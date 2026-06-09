import { useState, useRef, useCallback } from "react";
import Scanner from "../components/Scanner";
import TextInput from "./TextInput";
import { Box, Container, Typography } from "@mui/material";

type ScanningViewProps = {
  onScanComplete: (isbn: string) => void;
};

export default function ScanningView({ onScanComplete }: ScanningViewProps) {
  const [inputIsbn, setInputIsbn] = useState<string>("");
  const [scanning, setScanning] = useState(true);

  const scannerRef = useRef<{
    stopCamera: () => void;
    stopReading: () => void;
  } | null>(null);

  // Callback when Scanner finds a result
  const handleScanResult = useCallback(async (scannedIsbn: string) => {
    // Stop camera explicitly
    if (scannerRef.current) {
      scannerRef.current.stopReading();
      scannerRef.current.stopCamera();
    }
    onScanComplete(scannedIsbn);
    setScanning(false);
    // Fetch book data in ScanningResults
    // setBook(await fetchBookData(scannedIsbn));
  }, []);

  // Callback when ISBN input is submitted manually
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
    // Fetch book data in ScanningResults
    // setBook(await fetchBookData(inputIsbn));
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
      <Typography
        variant="h4"
        className="scan-screen-title"
        sx={{ mb: "0.5rem" }}
      >
        Scan your book's barcode
      </Typography>
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
