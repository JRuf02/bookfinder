import { useState, useRef, useCallback } from "react";
import Scanner from "../components/Scanner";
import ISBNInput from "../components/ISBNInput";
import ScanningResultsScreen from "./ScanningResultsScreen";
import { Box, Container, Typography } from "@mui/material";

export default function ScanningScreen() {
  const [isbn, setIsbn] = useState<string>("");
  const [inputIsbn, setInputIsbn] = useState<string>("");
  const [book, setBook] = useState<{
    title: string;
    author: string;
    dnbISBN: string;
    dnbId: string;
  } | null>(null);
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
    setIsbn(scannedIsbn);
    setScanning(false);
    // Fetch book data in ScanningResultsScreen
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
    setIsbn(inputIsbn);
    // Fetch book data in ScanningResultsScreen
    // setBook(await fetchBookData(inputIsbn));
  };

  const handleScannerReady = useCallback(
    (methods: { stopCamera: () => void; stopReading: () => void }) => {
      scannerRef.current = methods;
    },
    []
  );

  // Reset for rescan
  const handleRescan = () => {
    setIsbn("");
    setInputIsbn("");
    setBook(null);
    setScanning(true);
  };

  // If not scanning, show results screen
  if (!scanning) {
    return (
      <ScanningResultsScreen
        isbn={isbn}
        onRescan={handleRescan}
        // Optionally pass setBook or book if you fetch here
      />
    );
  }

  return (
    <Container className="app-container">
      {scanning && !book && (
        <Typography
          variant="h4"
          className="scan-screen-title"
          sx={{ mb: "0.5rem" }}
        >
          Scan your book's barcode
        </Typography>
      )}
      <Box sx={{ width: "100%", maxWidth: "100%" }}>
        <Scanner
          onResult={handleScanResult}
          active={scanning}
          onReady={handleScannerReady}
        />
      </Box>
      <Box className="input-overlay">
        <ISBNInput
          value={inputIsbn}
          onChange={(e) => setInputIsbn(e.target.value)}
          onSubmit={handleInputSubmit}
        />
      </Box>
    </Container>
  );
}
