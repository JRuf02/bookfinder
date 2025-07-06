import { useEffect, useRef, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { BrowserMultiFormatReader } from "@zxing/browser";
import "@zxing/library";

type ScannerProps = {
  onResult: (isbn: string) => void;
  active: boolean;
};

export default function Scanner({ onResult, active }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);
  const lastResultRef = useRef<string | null>(null);
  const mountCountRef = useRef(0);
  const decodingStartedRef = useRef(false); // Flag to prevent multiple decoder starts

  // Initialize reader once
  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    return () => {
      // Clean up on component unmount
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };
  }, []);

  // Handle active state changes
  useEffect(() => {
    // Track mount/remount count to help with debugging
    mountCountRef.current++;
    const currentMount = mountCountRef.current;
    console.log(`Scanner mount #${currentMount}, active=${active}`);

    if (!active) {
      return;
    }

    // Reset the decoding flag when we start a new camera session
    decodingStartedRef.current = false;

    // Delay before attempting to initialize (helpful after reload)
    console.log(`Initializing camera (mount #${currentMount})`);
    startCamera();

    function startCamera() {
      if (!videoRef.current || !readerRef.current) {
        console.log("No video ref or reader ref available");
        return;
      }

      // Reset state when component becomes active
      setError(null);
      lastResultRef.current = null;

      // Stop any existing controls
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }

      // Reset video element
      const video = videoRef.current;
      if (video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        video.srcObject = null;
      }

      // Small delay to ensure resources are released
      setTimeout(initCamera, 300);
    }

    function initCamera() {
      if (!active || !videoRef.current || !readerRef.current) {
        console.log("Abort initCamera - component inactive or refs missing");
        return;
      }

      console.log(`Accessing camera (mount #${currentMount})`);

      // Prefer environment-facing camera (the back camera on mobile)
      const constraints = {
        video: {
          facingMode: "environment",
        },
        audio: false,
      };

      // Try to access camera
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          if (!active || !videoRef.current || !readerRef.current) {
            console.log("Component deactivated during getUserMedia");
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          console.log(`Got media stream (mount #${currentMount})`);

          // Manual stream attachment to prevent race conditions
          videoRef.current.srcObject = stream;

          // Make sure we properly attach video before decoding
          // Use one-time event listener to prevent multiple callbacks
          const handleMetadata = () => {
            if (!videoRef.current) return;

            // Remove the event listener to prevent duplicate calls
            videoRef.current.removeEventListener(
              "loadedmetadata",
              handleMetadata
            );

            videoRef.current
              .play()
              .then(() => {
                console.log(`Video playing (mount #${currentMount})`);
                // Only start decoding if we haven't already
                if (!decodingStartedRef.current) {
                  startDecoding();
                }
              })
              .catch((err) => {
                console.error("Video play error:", err);
                setError(`Could not play video: ${err.message}`);
              });
          };

          // Use addEventListener instead of onloadedmetadata to have more control
          videoRef.current.addEventListener("loadedmetadata", handleMetadata, {
            once: true,
          });
        })
        .catch((err) => {
          console.error("Camera access error:", err);
          setError(`Camera access denied: ${err.message}`);
        });
    }

    function startDecoding() {
      if (!active || !videoRef.current || !readerRef.current) return;
      if (decodingStartedRef.current) return; // Prevent multiple decoder starts

      decodingStartedRef.current = true;
      console.log(`Starting decoder (mount #${currentMount})`);

      // If we can access the camera, try to decode
      readerRef.current
        .decodeFromVideoDevice(
          undefined, // Let the library choose the appropriate device
          videoRef.current,
          async (result, err) => {
            if (result) {
              const text = result.getText();

              // Only process the result if it's different from the last one
              // or if there is no last result
              if (lastResultRef.current !== text) {
                console.log(`Got new result: ${text}`);
                lastResultRef.current = text;

                if (controlsRef.current) {
                  controlsRef.current.stop();
                  controlsRef.current = null;
                  decodingStartedRef.current = false;
                }

                onResult(text);
              }
            }
          }
        )
        .then((controls) => {
          if (!active) {
            console.log("Component deactivated after decoder start");
            controls.stop();
            decodingStartedRef.current = false;
            return;
          }

          console.log(`Decoder running (mount #${currentMount})`);
          controlsRef.current = controls;
          setError(null);
        })
        .catch((err) => {
          console.error("Scanner init error:", err);
          decodingStartedRef.current = false;
          setError(`Could not start scanner: ${err.message}`);
        });
    }

    return () => {
      // Reset the decoding flag
      decodingStartedRef.current = false;

      // Clean up when active changes
      console.log(`Cleaning up scanner (mount #${currentMount})`);

      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }

      // Stop video tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [active, onResult]);

  return (
    <Box className="scanner-container">
      <video
        ref={videoRef}
        className="scanner-video"
        playsInline
        autoPlay={false} // Important: we'll manually call play()
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
