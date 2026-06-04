import { useState, useEffect } from "react";
import BookDisplay from "./BookDisplay";
import { fetchBookData } from "../services/fetchBookData";
import { Button, Stack, Box, Container, Typography } from "@mui/material";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import { Book } from "../types/Book";
import { useAppState } from "../state/AppStateProvider";
import { ShelfAction } from "../types/ShelfAction";

type ScanningResultsProps = {
  scannedIsbns: string[];
  queuedBooks: Book[];
  onActionSelected: (action: ShelfAction) => void;
  onBookFound: (book: Book) => void;
  onCancel: () => void;
  onWrongBook: () => void;
  onScanMore: () => void;
};

export default function ScanningResults({
  scannedIsbns: scannedIsbns,
  queuedBooks: queuedBooks,
  onActionSelected,
  onBookFound,
  onCancel: onCancel,
  onWrongBook: onWrongBook,
  onScanMore: onScanMore,
}: ScanningResultsProps) {
  const { state } = useAppState();
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    // Filter out duplicate runs caused by react strict mode
    const controller = new AbortController();

    async function getBook() {
      setBackendError(null);
      setCurrentBook(null);
      const latestIsbn: string = scannedIsbns.at(-1) ?? "";
      try {
        const data = await fetchBookData(latestIsbn, {
          signal: controller.signal,
        });

        if (data.ok) {
          setCurrentBook(data.data);
          onBookFound(data.data);
        } else {
          setBackendError(data.error);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          // Ignore abort errors as they are expected during cleanup
          return;
        }
        setBackendError("Failed to fetch book data.");
      }
    }

    if (scannedIsbns.length > 0) {
      getBook();
    } else {
      // This should not happen:
      // ScanningResults should only be shown when there are scanned ISBNs, but just in case
      setCurrentBook(null);
      setBackendError("No ISBNs scanned");
    }

    return () => {
      controller.abort();
    };
  }, [scannedIsbns]);

  const handleActionSelected = (action: "insert" | "remove") => {
    onActionSelected({
      books: queuedBooks,
      action,
    });
  };

  // TODO: Test multibook insert with error scans in between
  return (
    <Container className="app-container">
      <Box sx={{ width: "100%", maxWidth: "25rem", mx: "auto", mt: "2rem" }}>
        {currentBook && (
          <>
            <BookDisplay
              book={currentBook}
              isbn={scannedIsbns.at(-1) ?? ""}
              onScanMore={onScanMore}
              onWrongBook={onWrongBook}
            />

            <Stack direction="row" spacing={2} sx={{ mt: "1.5rem" }}>
              <Typography variant="body1" color="text.secondary">
                {queuedBooks.length} book(s) scanned so far
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: "1.5rem" }}>
              {(state.preSelectedShelfAction === "insert" ||
                state.preSelectedShelfAction === "both") && (
                <Button
                  startIcon={<PlaylistAddIcon />}
                  variant="contained"
                  color="primary"
                  onClick={() => handleActionSelected("insert")}
                >
                  Insert {queuedBooks.length} books into bookshelf
                </Button>
              )}
              {(state.preSelectedShelfAction === "remove" ||
                state.preSelectedShelfAction === "both") && (
                <Button
                  startIcon={<PlaylistRemoveIcon />}
                  variant="contained"
                  color="secondary"
                  onClick={() => handleActionSelected("remove")}
                >
                  Remove {queuedBooks.length} books from bookshelf
                </Button>
              )}
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
            </Stack>
          </>
        )}

        {backendError && (
          <Box sx={{ mt: "2rem", textAlign: "center" }}>
            <Typography variant="h6" color="error">
              Error fetching book data
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {backendError}
            </Typography>
            <Button variant="outlined" onClick={onCancel} sx={{ mt: "1rem" }}>
              Cancel
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
