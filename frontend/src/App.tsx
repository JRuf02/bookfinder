import { useState, useRef } from "react";
import { Box, Typography, Button, Container, Stack } from "@mui/material";
import Scanner from "./components/Scanner";
import ISBNInput from "./components/ISBNInput";
import BookDisplay from "./components/BookDisplay";
import ShelfActionDialog from "./components/ShelfActionDialog";
import ActionResultDialog from "./components/ActionResultDialog";
import { fetchBookData } from "./services/fetchBookData";
import { shelfAction } from "./services/shelfActions";
import "./styles/global.css";

type ShelfAction = "insert" | "remove" | null;

function App() {
  const [isbn, setIsbn] = useState<string>("");
  const [inputIsbn, setInputIsbn] = useState<string>("");
  const [book, setBook] = useState<{
    title: string;
    author: string;
    dnbISBN: string;
    dnbId: string;
  } | null>(null);
  const [scanning, setScanning] = useState(true);
  const [shelfActionType, setShelfActionType] = useState<ShelfAction>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);

  const scannerRef = useRef<{
    stopCamera: () => void;
    stopReading: () => void;
  } | null>(null);

  // Callback when Scanner finds a result
  const handleScanResult = async (scannedIsbn: string) => {
    setIsbn(scannedIsbn);
    setScanning(false);
    setBook(await fetchBookData(scannedIsbn));
  };

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
    setBook(await fetchBookData(inputIsbn));
  };

  const handleRescan = () => {
    setBook(null);
    setIsbn("");
    setInputIsbn("");
    setShelfActionType(null);
    setActionResult(null);
    setScanning(true);
  };

  // Remove or insert book dialog
  const handleShelfAction = (action: ShelfAction) => setShelfActionType(action);

  // Handle shelf insert/remove
  const handleShelfSubmit = async (osmId: string) => {
    if (!osmId || !isbn || !shelfActionType) return;
    const result = await shelfAction(shelfActionType, osmId, isbn);
    setActionResult(result.message);
    setShelfActionType(null);
    setTimeout(handleRescan, 2000);
  };

  // Add a function to get the scanner methods
  const handleScannerReady = (methods: {
    stopCamera: () => void;
    stopReading: () => void;
  }) => {
    scannerRef.current = methods;
  };

  return (
    <Container
      className="app-container"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        Scan ISBN Barcode
      </Typography>

      {scanning && (
        <Box sx={{ width: "100%" }}>
          <Scanner
            onResult={handleScanResult}
            active={scanning}
            onReady={handleScannerReady}
          />
          <Box className="input-overlay">
            <ISBNInput
              value={inputIsbn}
              onChange={(e) => setInputIsbn(e.target.value)}
              onSubmit={handleInputSubmit}
            />
          </Box>
        </Box>
      )}

      {book && !shelfActionType && !actionResult && (
        <Box>
          <BookDisplay book={book} isbn={isbn} onRescan={handleRescan} />
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleShelfAction("insert")}
            >
              Insert into bookshelf
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleShelfAction("remove")}
            >
              Remove from bookshelf
            </Button>
            <Button variant="outlined" onClick={handleRescan}>
              Rescan
            </Button>
          </Stack>
        </Box>
      )}

      {shelfActionType && (
        <ShelfActionDialog
          action={shelfActionType}
          onSubmit={handleShelfSubmit}
          onCancel={() => setShelfActionType(null)}
        />
      )}

      {actionResult && <ActionResultDialog message={actionResult} />}
    </Container>
  );
}

export default App;
