import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isbn, setIsbn] = useState<string>("Waiting...");

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    if (!videoRef.current) {
      console.error("Video element not found");
      return;
    }

    codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.current!,
      (result, err) => {
        console.log(
          "Available methods:",
          Object.getOwnPropertyNames(Object.getPrototypeOf(codeReader))
        ); // Debugging
        if (result) {
          setIsbn(result.getText());
        } else if (err) {
          console.log("Scan error:", err);
        }
      }
    );

    return () => {
      // (codeReader as any).reset();
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Scan ISBN Barcode</h1>
      <video
        ref={videoRef}
        width="400"
        height="300"
        style={{ border: "2px solid black" }}
      />
      <p>
        ISBN: <strong>{isbn}</strong>
      </p>
    </div>
  );
}

export default App;
