import ErrorIcon from "@mui/icons-material/Error";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { memo, useEffect, useRef } from "react";

import { useBarcodeReader } from "./useBarcodeReader";
import { useCamera } from "./useCamera";

type ScannerProps = {
  onResult: (isbn: string) => void;
  active: boolean;
  onReady?: (methods: {
    stopCamera: () => void;
    stopReading: () => void;
  }) => void;
};

function Scanner({ onResult, active, onReady }: ScannerProps) {
  const mountCountRef = useRef(0);
  const { videoRef, error, startCamera, stopCamera, playVideo } = useCamera();
  const { startReading, stopReading, resetReader } = useBarcodeReader(
    videoRef,
    onResult,
  );

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
    videoRef,
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
            p: 2,
            position: "absolute",
            top: "50%",
            left: "50%",
            zIndex: 3,
            transform: "translate(-50%, -50%)",
            width: 250,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <ErrorIcon color="error" sx={{ mt: 1 }} />
            <Typography variant="body1" color="error.main">
              {error}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please allow camera access. Close all other applications and tabs
            using the camera and reload the page or try on another device.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default memo(Scanner);
