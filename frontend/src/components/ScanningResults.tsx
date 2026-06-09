import { useState, useEffect } from "react";
import BookDisplay from "./BookDisplay";
import { fetchBookData } from "../services/fetchBookData";
import { Button, Stack, Box, Container, Typography } from "@mui/material";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import { Book } from "../types/Book";
import { useAppState } from "../state/AppStateProvider";
import { ShelfAction } from "../types/ShelfAction";
import WrongBookDialog from "./WrongBookDialog";
import CancelDialog from "./CancelDialog";

type ScanningResultsProps = {
  scannedIsbns: string[];
  queuedBooks: Book[];
  onActionSelected: (action: ShelfAction) => void;
  onBookFound: (book: Book) => void;
  onCancel: () => void;
  onTryAgain: () => void;
  onManuallyAdd: () => void;
  onDontAdd: () => void;
  onScanMore: () => void;
};

export default function ScanningResults({
  scannedIsbns: scannedIsbns,
  queuedBooks: queuedBooks,
  onActionSelected,
  onBookFound,
  onCancel: onCancel,
  onTryAgain: onTryAgain,
  onManuallyAdd: onManuallyAdd,
  onDontAdd: onDontAdd,
  onScanMore: onScanMore,
}: ScanningResultsProps) {
  const { state } = useAppState();
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [wrongBookDialogOpen, setWrongBookDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

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

  const onRetry = () => {
    setBackendError(null);
    setCurrentBook(null);
    onScanMore();
  };

  const onWrongBook = () => {
    setWrongBookDialogOpen(true);
  };

  // TODO: Test multibook insert with error scans in between
  // TODO: move the three buttons into a separate component to avoid code duplication
  return (
    <div>
      <Container
        className="app-container"
        maxWidth={false}
        sx={{ overflowY: "auto" }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "25rem",
            mx: "auto",
            my: "0.5rem",
          }}
        >
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
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  mt: "1.5rem",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  sx={{
                    mt: "1rem",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outlined"
                  onClick={onRetry}
                  sx={{
                    mt: "1rem",
                  }}
                >
                  Retry
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => alert("TODO: implement")}
                  sx={{
                    mt: "1rem",
                  }}
                >
                  Add manually
                </Button>
              </Stack>

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
                <Button
                  variant="outlined"
                  onClick={() => setWrongBookDialogOpen(true)}
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Container>
      <WrongBookDialog
        open={wrongBookDialogOpen}
        onTryAgain={() => {
          setWrongBookDialogOpen(false);
          onTryAgain();
        }}
        onManuallyAdd={() => {
          setWrongBookDialogOpen(false);
          onManuallyAdd();
        }}
        onDontAdd={() => {
          setWrongBookDialogOpen(false);
          onDontAdd();
        }}
      />
      <CancelDialog
        open={cancelDialogOpen}
        onYes={() => {
          setCancelDialogOpen(false);
          onCancel();
        }}
        onNo={() => {
          setCancelDialogOpen(false);
        }}
      />
    </div>
  );
}
