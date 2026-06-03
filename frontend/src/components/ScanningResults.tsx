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
  isbn: string;
  onActionSelected: (action: ShelfAction) => void;
  onCancel: () => void;
  onWrongBook: () => void;
  onScanMore: () => void;
};

export default function ScanningResults({
  isbn,
  onActionSelected,
  onCancel: onCancel,
  onWrongBook: onWrongBook,
  onScanMore: onScanMore,
}: ScanningResultsProps) {
  const { state } = useAppState();
  const [book, setBook] = useState<Book | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    async function getBook() {
      setBackendError(null);
      setBook(null);
      await fetchBookData(isbn).then((data) => {
        if (data.ok) {
          setBook(data.data);
        } else {
          setBackendError(data.error);
        }
      });
    }
    getBook();
  }, [isbn]);

  const handleActionSelected = (action: "insert" | "remove") => {
    onActionSelected({
      book: book as Book,
      action,
    });
  };

  // TODO: Test multibook insert with error scans in between
  return (
    <Container className="app-container">
      <Box sx={{ width: "100%", maxWidth: "25rem", mx: "auto", mt: "2rem" }}>
        {book && (
          <>
            <BookDisplay
              book={book}
              isbn={isbn}
              onScanMore={onScanMore}
              onWrongBook={onWrongBook}
            />
            <Stack direction="row" spacing={2} sx={{ mt: "1.5rem" }}>
              {(state.preSelectedShelfAction === "insert" ||
                state.preSelectedShelfAction === "both") && (
                <Button
                  startIcon={<PlaylistAddIcon />}
                  variant="contained"
                  color="primary"
                  onClick={() => handleActionSelected("insert")}
                >
                  Insert x books into bookshelf
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
                  Remove x books from bookshelf
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
              Try Again (= Cancel - TODO: add retry option)
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
