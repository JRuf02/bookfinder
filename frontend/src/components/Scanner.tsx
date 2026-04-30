import { useEffect, useRef, useState, useCallback, memo } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { BrowserMultiFormatReader } from "@zxing/browser";
import "@zxing/library"; // check if this import does anything

type ScannerProps = {
  onResult: (isbn: string) => void;
  active: boolean;
  onReady?: (methods: {
    stopCamera: () => void;
    stopReading: () => void;
  }) => void;
};

// Custom hook to manage camera access and video element
function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, []);

  // Initialize camera with proper constraints
  const startCamera = useCallback(async () => {
    if (!videoRef.current) {
      setError("Video element not found");
      return false;
    }

    // Stop any existing stream first
    await stopCamera();

    // If component was unmounted during cleanup, abort
    if (!isMountedRef.current) return false;

    try {
      // Prefer environment-facing camera (the back camera on mobile)
      const constraints = {
        video: {
          facingMode: "environment",
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Check if still mounted after async operation
      if (!isMountedRef.current) {
        // Clean up the stream we just got if component unmounted
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        // Double-check ref is still valid
        videoRef.current.srcObject = stream;
        setError(null);
        return true;
      } else {
        // If video element is gone, clean up the stream
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.error("Camera access error:", err);
        setError(`Camera access denied: ${err.message}`);
      }
      return false;
    }
  }, []);

  // Clean up camera resources
  const stopCamera = useCallback(() => {
    console.log("Stopping camera...");
    let tracksStopped = false;

    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();

      if (tracks.length > 0) {
        tracks.forEach((track) => {
          track.stop();
          console.log("Stopped track:", track);
        });
        tracksStopped = true;
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    return tracksStopped;
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
  onResult: (isbn: string) => void,
) {
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);
  const lastResultRef = useRef<string | null>(null);
  const decodingStartedRef = useRef(false);
  const [isReading, setIsReading] = useState(false);
  const isMountedRef = useRef(true);

  // Initialize the reader once and clean up on unmount
  useEffect(() => {
    isMountedRef.current = true;

    if (!readerRef.current) {
      readerRef.current = new BrowserMultiFormatReader();
    }

    return () => {
      isMountedRef.current = false;
      stopReading();

      // Try to fully reset the reader
      // if (readerRef.current) {
      //  try {
      //    readerRef.current.reset();  // Property 'reset' does not exist on type 'BrowserMultiFormatReader'.
      //  } catch (e) {
      //    console.log("Error resetting reader:", e);
      //  }
      // Don't set to null, as other parts might still reference it
      // }
    };
  }, []);

  // Start barcode reading with improved cleanup
  const startReading = useCallback(async () => {
    if (!videoRef.current || !readerRef.current || decodingStartedRef.current) {
      return false;
    }

    // Prevent multiple concurrent starts
    decodingStartedRef.current = true;
    setIsReading(true);

    try {
      // Add a scan interval to reduce CPU usage and violations
      let lastScanTime = 0;
      const scanInterval = 200; // milliseconds between scans

      const controls = await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, err) => {
          const now = Date.now();

          // Skip processing if we're scanning too frequently
          if (now - lastScanTime < scanInterval) {
            return;
          }

          lastScanTime = now;

          if (result && isMountedRef.current) {
            const text = result.getText();

            // Only process the result if it's different from the last one
            if (lastResultRef.current !== text) {
              console.log(`Got new result: ${text}`);
              lastResultRef.current = text;

              // Stop reading immediately
              if (controlsRef.current) {
                controlsRef.current.stop();
                controlsRef.current = null;
              }
              decodingStartedRef.current = false;

              if (isMountedRef.current) {
                setIsReading(false);
                onResult(text);
              }
            }
          }
        },
      );

      // Check if component was unmounted during async operation
      if (!isMountedRef.current) {
        controls.stop();
        return false;
      }

      controlsRef.current = controls;
      return true;
    } catch (err) {
      console.error("Scanner init error:", err);
      decodingStartedRef.current = false;
      if (isMountedRef.current) {
        setIsReading(false);
      }
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

function Scanner({ onResult, active, onReady }: ScannerProps) {
  const mountCountRef = useRef(0);
  const { videoRef, error, startCamera, stopCamera, playVideo } = useCamera();
  // TODO: Tackle warnings and problems in this file; split into subcomponents
  const { isReading, startReading, stopReading, resetReader } =
    useBarcodeReader(videoRef, onResult);

  // expose methods to parent component
  useEffect(() => {
    if (onReady) {
      onReady({
        stopCamera,
        stopReading,
      });
    }
  }, [onReady, stopCamera, stopReading]);

  // Track initialization timers
  const timerRef = useRef<number | null>(null);

  // Orchestrate the scanning process
  useEffect(() => {
    // Track mount/remount count for debugging
    mountCountRef.current++;
    const currentMount = mountCountRef.current;
    console.log(`Scanner mount #${currentMount}, active=${active}`);

    if (!active) {
      // Clean up if component is not active
      stopReading();
      stopCamera();
      return;
    }

    // Main scanning sequence
    async function initializeScanner() {
      // Reset reader state
      resetReader();

      try {
        console.log(`Accessing camera (mount #${currentMount})`);
        const cameraStarted = await startCamera();

        // Check if we're still in the same effect instance
        if (mountCountRef.current !== currentMount) {
          console.log(
            `Camera started but mount changed, aborting (mount #${currentMount})`,
          );
          stopCamera();
          return;
        }

        if (cameraStarted) {
          console.log(`Got media stream (mount #${currentMount})`);

          // Use one-time event listener for metadata loaded
          const handleMetadata = async () => {
            // Check again if we're still relevant
            if (mountCountRef.current !== currentMount) {
              console.log(
                `Metadata loaded but mount changed, aborting (mount #${currentMount})`,
              );
              return;
            }

            try {
              await playVideo();

              // One more check before starting the decoder
              if (mountCountRef.current !== currentMount) return;

              console.log(`Video playing (mount #${currentMount})`);
              const decoderStarted = await startReading();

              if (decoderStarted) {
                console.log(`Decoder running (mount #${currentMount})`);
              }
            } catch (err) {
              console.error(
                `Failed to start scanning (mount #${currentMount}):`,
                err,
              );
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
              },
            );
          } else {
            console.error("Video element not available");
          }
        }
      } catch (err) {
        console.error(
          `Scanner initialization error (mount #${currentMount}):`,
          err,
        );
      }
    }

    // Clear any existing timers first
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Set a delay to prevent race conditions
    timerRef.current = window.setTimeout(() => {
      initializeScanner();
      timerRef.current = null;
    }, 300);

    // Clean up when component unmounts or active changes
    return () => {
      console.log(`Cleaning up scanner (mount #${currentMount})`);

      // Clear any pending timers
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Stop reader and camera
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

  useEffect(() => {
    console.log("Scanner mounted");
    return () => {
      console.log("Scanner unmounted");
    };
  }, []);

  return (
    <Box className="scanner-container">
      <video
        ref={videoRef}
        className="scanner-video"
        playsInline
        autoPlay={false}
        muted
      />
      {/* Todo: Improve error message styling / Add error component */}
      {error && (
        <Paper
          elevation={3}
          sx={{
            color: "error.main",
            p: 2,
            position: "absolute",
            top: "50%",
            left: "50%",
            zIndex: 3,
            transform: "translate(-50%, -50%)",
            maxWidth: "80%",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <Typography variant="body1">{error}</Typography>
          <Typography variant="body2">
            Please allow camera access. Close all other applications and tabs
            using the camera and reload the page or try on another device.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default memo(Scanner);
