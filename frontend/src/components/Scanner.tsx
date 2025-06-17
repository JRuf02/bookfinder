import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

type ScannerProps = {
  onResult: (isbn: string) => void;
  active: boolean;
};

export default function Scanner({ onResult, active }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;

    const codeReader = new BrowserMultiFormatReader();
    let controls: any = null;

    if (!videoRef.current) {
      setError("Video element not found");
      return;
    }

    // Get available video devices to better handle mobile
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        console.log("Available video devices:", videoDevices);

        // Prefer environment-facing camera (the back camera on mobile)
        const constraints = {
          video: {
            facingMode: "environment",
          },
          audio: false,
        };

        // Try to access camera
        return navigator.mediaDevices
          .getUserMedia(constraints)
          .then(() => {
            // If we can access the camera, try to decode
            return codeReader
              .decodeFromVideoDevice(
                undefined, // Let the library choose the appropriate device
                videoRef.current!,
                async (result, err) => {
                  if (result) {
                    if (controls) controls.stop();
                    onResult(result.getText());
                  }
                  // if (err && !(err instanceof TypeError)) {
                  //  // Ignore TypeError as it's often just the library's internal error
                  //  console.warn("Scanner error:", err);
                  // }
                }
              )
              .then((c) => {
                controls = c;
                setError(null);
              });
          })
          .catch((err) => {
            console.error("Camera access error:", err);
            setError(`Camera access denied: ${err.message}`);
          });
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setError(`Camera access denied: ${err.message}`);
      });

    return () => {
      if (controls) controls.stop();
    };
  }, [active, onResult]);

  return (
    <div>
      <video
        ref={videoRef}
        width="400"
        height="300"
        style={{
          border: "2px solid black",
          background: "#f0f0f0",
          maxWidth: "100%",
        }}
      />

      {error && (
        <div style={{ color: "red", margin: "10px 0" }}>
          <p>{error}</p>
          <p>Please allow camera access or try another device.</p>
        </div>
      )}
    </div>
  );
}
