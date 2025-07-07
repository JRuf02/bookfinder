import { useEffect, useRef, useState, useCallback } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { BrowserMultiFormatReader } from "@zxing/browser";
import "@zxing/library";

type ScannerProps = {
  onResult: (isbn: string) => void;
  active: boolean;
};

// Custom hook to manage camera access and video element
function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera with proper constraints
  const startCamera = useCallback(async () => {
    if (!videoRef.current) {
      setError("Video element not found");
      return false;
    }

    // Stop any existing stream
    stopCamera();

    try {
      // Prefer environment-facing camera (the back camera on mobile)
      const constraints = {
        video: {
          facingMode: "environment",
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setError(null);
      return true;
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError(`Camera access denied: ${err.message}`);
      return false;
    }
  }, []);

  // Clean up camera resources
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Play the video and return a promise
  const playVideo = useCallback(async () => {
    if (!videoRef.current) {
      return Promise.reject(new Error("Video element not found"));
    }

    try {
      await videoRef.current.play();
      return true;
    } catch (err: any) {
      console.error("Video play error:", err);
      setError(`Could not play video: ${err.message}`);
      return Promise.reject(err);
    }
  }, []);

  return {
    videoRef,
    error,
    startCamera,
    stopCamera,
    playVideo,
  };
}

// Custom hook to manage barcode reading
function useBarcodeReader(
  videoRef: React.RefObject<HTMLVideoElement>,
  onResult: (isbn: string) => void
) {
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);
  const lastResultRef = useRef<string | null>(null);
  const decodingStartedRef = useRef(false);
  const [isReading, setIsReading] = useState(false);

  // Initialize the reader once
  useEffect(() => {
    if (!readerRef.current) {
      readerRef.current = new BrowserMultiFormatReader();
    }

    return () => {
      stopReading();
    };
  }, []);

  // Start barcode reading
  const startReading = useCallback(async () => {
    if (!videoRef.current || !readerRef.current || decodingStartedRef.current) {
      return false;
    }

    decodingStartedRef.current = true;
    setIsReading(true);

    try {
      const controls = await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, err) => {
          if (result) {
            const text = result.getText();

            // Only process the result if it's different from the last one
            if (lastResultRef.current !== text) {
              console.log(`Got new result: ${text}`);
              lastResultRef.current = text;

              if (controlsRef.current) {
                controlsRef.current.stop();
                controlsRef.current = null;
                decodingStartedRef.current = false;
                setIsReading(false);
              }

              onResult(text);
            }
          }
        }
      );

      controlsRef.current = controls;
      return true;
    } catch (err) {
      console.error("Scanner init error:", err);
      decodingStartedRef.current = false;
      setIsReading(false);
      return false;
    }
  }, [videoRef, onResult]);

  // Stop barcode reading
  const stopReading = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }

    decodingStartedRef.current = false;
    lastResultRef.current = null;
    setIsReading(false);
  }, []);

  // Reset the reader state
  const resetReader = useCallback(() => {
    stopReading();
    lastResultRef.current = null;
  }, [stopReading]);

  return {
    isReading,
    startReading,
    stopReading,
    resetReader,
  };
}

export default function Scanner({ onResult, active }: ScannerProps) {
  const mountCountRef = useRef(0);
  const { videoRef, error, startCamera, stopCamera, playVideo } = useCamera();
  const { isReading, startReading, stopReading, resetReader } =
    useBarcodeReader(videoRef, onResult);

  // Orchestrate the scanning process
  useEffect(() => {
    // Track mount/remount count for debugging
    mountCountRef.current++;
    const currentMount = mountCountRef.current;
    console.log(`Scanner mount #${currentMount}, active=${active}`);

    if (!active) {
      return;
    }

    // Main scanning sequence
    async function initializeScanner() {
      resetReader();

      // Small delay to ensure resources are released from previous session
      setTimeout(async () => {
        console.log(`Accessing camera (mount #${currentMount})`);
        const cameraStarted = await startCamera();

        if (cameraStarted) {
          console.log(`Got media stream (mount #${currentMount})`);

          // Use one-time event listener for metadata loaded
          const handleMetadata = async () => {
            try {
              await playVideo();
              console.log(`Video playing (mount #${currentMount})`);
              await startReading();
              console.log(`Decoder running (mount #${currentMount})`);
            } catch (err) {
              console.error("Failed to start scanning:", err);
            }
          };

          // Check if video element exists and if metadata already loaded
          if (videoRef.current && videoRef.current.readyState >= 2) {
            handleMetadata();
          } else if (videoRef.current) {
            videoRef.current.addEventListener(
              "loadedmetadata",
              handleMetadata,
              {
                once: true,
              }
            );
          } else {
            console.error("Video element not available");
          }
        }
      }, 300);
    }

    initializeScanner();

    // Clean up when component unmounts or active changes
    return () => {
      console.log(`Cleaning up scanner (mount #${currentMount})`);
      stopReading();
      stopCamera();
    };
  }, [
    active,
    onResult,
    startCamera,
    stopCamera,
    playVideo,
    startReading,
    stopReading,
    resetReader,
  ]);

  return (
    <Box className="scanner-container">
      <video
        ref={videoRef}
        className="scanner-video"
        playsInline
        autoPlay={false}
        muted
      />
      {error && (
        <Paper
          elevation={3}
          sx={{
            color: "error.main",
            p: 2,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "80%",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <Typography variant="body1">{error}</Typography>
          <Typography variant="body2">
            Please allow camera access or try another device.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
