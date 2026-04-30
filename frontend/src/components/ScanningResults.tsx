import { useState, useEffect } from "react";
import BookDisplay from "./BookDisplay";
import { fetchBookData } from "../services/fetchBookData";
import { Button, Stack, Box, Container, Typography } from "@mui/material";
import { Book } from "../types/Book";
import { useAppState } from "../state/AppStateProvider";

type ScanningResultsProps = {
  isbn: string;
  onActionSelected: (book: Book, action: "insert" | "remove") => void;
  onRescan: () => void;
};

export default function ScanningResults({
  isbn,
  onActionSelected,
  onRescan,
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
    onActionSelected(book as Book, action);
  };

  return (
    <Container className="app-container">
      <Box sx={{ width: "100%", maxWidth: "25rem", mx: "auto", mt: "2rem" }}>
        {book && (
          <>
            <BookDisplay book={book} isbn={isbn} onRescan={onRescan} />
            <Stack direction="row" spacing={2} sx={{ mt: "1.5rem" }}>
              {(state.preSelectedShelfAction === "insert" ||
                state.preSelectedShelfAction === "both") && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleActionSelected("insert")}
                >
                  Insert into bookshelf
                </Button>
              )}
              {(state.preSelectedShelfAction === "remove" ||
                state.preSelectedShelfAction === "both") && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleActionSelected("remove")}
                >
                  Remove from bookshelf
                </Button>
              )}
              <Button variant="outlined" onClick={onRescan}>
                Rescan
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
            <Button variant="outlined" onClick={onRescan} sx={{ mt: "1rem" }}>
              Try Again
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
