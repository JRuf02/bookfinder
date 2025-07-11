import { useState, useRef, useEffect, useCallback } from "react";
import Scanner from "../components/Scanner";
import ISBNInput from "../components/ISBNInput";
import BookDisplay from "../components/BookDisplay";
import ShelfActionDialog from "../components/ShelfActionDialog";
import ActionResultDialog from "../components/ActionResultDialog";
import { fetchBookData } from "../services/fetchBookData";
import { shelfAction } from "../services/shelfActions";
import { Box, Typography, Button, Container, Stack } from "@mui/material";

type ShelfAction = "insert" | "remove" | null;

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
  const [shelfActionType, setShelfActionType] = useState<ShelfAction>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);

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
    setBook(await fetchBookData(scannedIsbn));
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

  const handleShelfAction = (action: ShelfAction) => setShelfActionType(action);

  // Handle shelf insert/remove
  const handleShelfSubmit = async (osmId: string) => {
    if (!osmId || !isbn || !shelfActionType) return;
    const result = await shelfAction(shelfActionType, osmId, isbn);
    setActionResult(result.message);
    setShelfActionType(null);
    setTimeout(handleRescan, 2000);
  };

  // Get the scanner methods
  const handleScannerReady = useCallback(
    (methods: { stopCamera: () => void; stopReading: () => void }) => {
      scannerRef.current = methods;
    },
    []
  );

  // Cleanup camera when component unmounts
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stopReading();
        scannerRef.current.stopCamera();
      }
    };
  }, []);

  // Sizing constants in rem
  const TITLE_MARGIN_BOTTOM = "0.5rem";
  const CONTENT_MAX_WIDTH = "25rem";
  const STACK_SPACING = 2; // MUI spacing unit, should work well with rem

  // TODO: make this more maintainable by splitting into multiple pages!
  return (
    <Container className="app-container">
      {scanning && !book && (
        <Typography
          variant="h4"
          className="scan-screen-title"
          sx={{ mb: TITLE_MARGIN_BOTTOM }}
        >
          Scan your book's barcode
        </Typography>
      )}

      {scanning && (
        <Box sx={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH }}>
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: CONTENT_MAX_WIDTH,
            mt: "2rem",
            gap: "1.5rem",
          }}
        >
          <BookDisplay book={book} isbn={isbn} onRescan={handleRescan} />
          <Stack direction="row" spacing={STACK_SPACING} sx={{ mt: "1.5rem" }}>
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
