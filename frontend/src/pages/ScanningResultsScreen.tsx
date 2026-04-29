import { useState, useEffect } from "react";
import BookDisplay from "../components/BookDisplay";
import { fetchBookData } from "../services/fetchBookData";
import { Button, Stack, Box, Container, Typography } from "@mui/material";
import ShelfActionScreen from "./ShelfActionScreen";
import { Book } from "../types/Book";

export default function ScanningResultsScreen({
  isbn,
  mode = "both",
  onRescan,
}: {
  isbn: string;
  mode?: "insert" | "remove" | "both";
  onRescan: () => void;
}) {
  const [book, setBook] = useState<Book | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [shelfActionType, setShelfActionType] = useState<
    "insert" | "remove" | null
  >(null);

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

  if (shelfActionType && book) {
    return (
      <ShelfActionScreen
        book={book}
        action={shelfActionType}
        onCancel={() => setShelfActionType(null)}
        onRescan={onRescan}
      />
    );
  }

  return (
    <Container className="app-container">
      <Box sx={{ width: "100%", maxWidth: "25rem", mx: "auto", mt: "2rem" }}>
        {book && (
          <>
            <BookDisplay book={book} isbn={isbn} onRescan={onRescan} />
            <Stack direction="row" spacing={2} sx={{ mt: "1.5rem" }}>
              {(mode === "insert" || mode === "both") && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShelfActionType("insert")}
                >
                  Insert into bookshelf
                </Button>
              )}
              {(mode === "remove" || mode === "both") && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setShelfActionType("remove")}
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
