import { Box, Container } from "@mui/material";
import { useCallback, useRef, useState } from "react";

import TextInput from "../TextInput";
import Scanner from "./Scanner";

type ScanningViewProps = {
  onScanComplete: (isbn: string) => void;
};

// Shows the Scanner component (video feed) and an input field for manual ISBN entry.
// When a scan is successful or the form is submitted, call onScanComplete with the scanned/entered ISBN.
export default function ScanningView({ onScanComplete }: ScanningViewProps) {
  const [inputIsbn, setInputIsbn] = useState<string>("");
  const [scanning, setScanning] = useState(true);

  const scannerRef = useRef<{
    stopCamera: () => void;
    stopReading: () => void;
  } | null>(null);

  const handleScanResult = useCallback(async (scannedIsbn: string) => {
    // Stop camera explicitly
    if (scannerRef.current) {
      scannerRef.current.stopReading();
      scannerRef.current.stopCamera();
    }
    onScanComplete(scannedIsbn);
    setScanning(false);
  }, []);

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // prevents page reload

    // Stop camera before changing state
    if (scannerRef.current) {
      scannerRef.current.stopReading();
      scannerRef.current.stopCamera();
    }

    // Now update state
    setScanning(false);
    onScanComplete(inputIsbn);
  };

  const handleScannerReady = useCallback(
    (methods: { stopCamera: () => void; stopReading: () => void }) => {
      scannerRef.current = methods;
    },
    [],
  );

  return (
    <Container
      className="app-container"
      maxWidth={false}
      sx={{ alignItems: "center", justifyContent: "center" }}
    >
      <Box sx={{ width: "100%", maxWidth: "100%" }}>
        <Scanner
          onResult={handleScanResult}
          active={scanning}
          onReady={handleScannerReady}
        />
      </Box>
      <Box className="input-overlay">
        <TextInput
          value={inputIsbn}
          onChange={(e) => setInputIsbn(e.target.value)}
          onSubmit={handleInputSubmit}
        />
      </Box>
    </Container>
  );
}
