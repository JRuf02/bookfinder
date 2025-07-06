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
    if (!active || !videoRef.current || !readerRef.current) {
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
      // Small delay to ensure resources are released
      setTimeout(initCamera, 300);
    } else {
      initCamera();
    }

    function initCamera() {
      if (!active || !videoRef.current || !readerRef.current) return;

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
        .then(() => {
          if (!active || !videoRef.current || !readerRef.current) return;

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
                    lastResultRef.current = text;

                    if (controlsRef.current) {
                      controlsRef.current.stop();
                      controlsRef.current = null;
                    }

                    onResult(text);
                  }
                }
              }
            )
            .then((controls) => {
              if (!active) {
                controls.stop();
                return;
              }
              controlsRef.current = controls;
              setError(null);
            })
            .catch((err) => {
              console.error("Scanner init error:", err);
              setError(`Could not start scanner: ${err.message}`);
            });
        })
        .catch((err) => {
          console.error("Camera access error:", err);
          setError(`Camera access denied: ${err.message}`);
        });
    }

    return () => {
      // Clean up when active changes
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
        autoPlay
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
