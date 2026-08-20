import type { IScannerControls } from "@zxing/browser";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// Custom hook to manage barcode reading
export function useBarcodeReader(
  videoRef: RefObject<HTMLVideoElement | null>,
  onResult: (isbn: string) => void,
) {
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastResultRef = useRef<string | null>(null);
  const decodingStartedRef = useRef(false);
  const [isReading, setIsReading] = useState(false);
  const isMountedRef = useRef(true);

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

  // Initialize the reader once and clean up on unmount
  useEffect(() => {
    isMountedRef.current = true;

    if (!readerRef.current) {
      readerRef.current = new BrowserMultiFormatReader();
    }

    return () => {
      isMountedRef.current = false;
      stopReading();
    };
  }, [stopReading]);

  // Start barcode reading with improved cleanup
  const startReading = useCallback(async () => {
    if (!videoRef.current || !readerRef.current || decodingStartedRef.current) {
      return false;
    }

    decodingStartedRef.current = true;
    setIsReading(true);

    try {
      // Add a scan interval to reduce CPU usage and violations
      let lastScanTime = 0;
      const scanInterval = 200; // milliseconds between scans

      const controls = await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          // we don't need the error, only the result

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
  }, [onResult, videoRef]);

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

export default useBarcodeReader;
