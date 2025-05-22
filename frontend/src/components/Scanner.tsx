import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

type ScannerProps = {
  onResult: (isbn: string) => void;
  active: boolean;
};

export default function Scanner({ onResult, active }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!active) return;

    const codeReader = new BrowserMultiFormatReader();
    let controls: any = null;

    if (!videoRef.current) return;

    codeReader
      .decodeFromVideoDevice(
        undefined,
        videoRef.current,
        async (result, err) => {
          if (result) {
            if (controls) controls.stop();
            onResult(result.getText());
          }
        }
      )
      .then((c) => {
        controls = c;
      })
      .catch((err) => {
        console.error("Scanner error:", err);
      });

    return () => {
      if (controls) controls.stop();
    };
  }, [active, onResult]);

  return (
    <video
      ref={videoRef}
      width="400"
      height="300"
      style={{ border: "2px solid black" }}
    />
  );
}
