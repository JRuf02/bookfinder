import { Box, Container } from "@mui/material";
import { useEffect, useState } from "react";

import { fetchBookData } from "../../services/api/fetchBookData";
import { Book } from "../../types/Book";
import { ShelfAction } from "../../types/ShelfAction";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import WrongBookDialog from "../dialogs/WrongBookDialog";
import BookDisplay from "./BookDisplay";
import ScanningResultsButtons from "./ScanningResultsButtons";
import ScanningResultsErrorView from "./ScanningResultsErrorView";

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
  scannedIsbns,
  queuedBooks,
  onActionSelected,
  onBookFound,
  onCancel,
  onTryAgain,
  onManuallyAdd,
  onDontAdd,
  onScanMore,
}: ScanningResultsProps) {
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
      // This should not happen, as the component should only be called when an ISBN is scanned
      setCurrentBook(null);
      setBackendError("No ISBNs scanned");
    }

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (queuedBooks.length > 0) {
      setCurrentBook(queuedBooks.at(-1) ?? null);
      setBackendError(null);
    } else {
      setCurrentBook(null);
      setBackendError("No ISBNs scanned");
    }
  }, [queuedBooks]);

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

  const onDontAddButtonClicked = () => {
    setWrongBookDialogOpen(false);
    onDontAdd();
  };

  const onInsert = () => {
    handleActionSelected("insert");
  };

  const onRemove = () => {
    handleActionSelected("remove");
  };

  const onCancelButtonClicked = () => {
    if (queuedBooks.length > 0) {
      setCancelDialogOpen(true);
    } else {
      onCancel();
    }
  };

  // TODO: Add loading state (spinner) while fetching book data?
  return (
    <div>
      <Container
        className="app-container"
        maxWidth={false}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          // Do not add justifyContent: "center" here, otherwise the top of the card will be hidden when content is taller than viewport
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            maxWidth: "25rem",
            mx: "auto",
            mt: "0.5rem",
            overflowY: "auto",
          }}
        >
          {currentBook && !backendError ? (
            <BookDisplay
              book={currentBook}
              onScanMore={onScanMore}
              onWrongBook={onWrongBook}
            />
          ) : backendError ? (
            <ScanningResultsErrorView
              errorMessage={backendError}
              onRetry={onRetry}
              onCancel={onCancelButtonClicked}
              onManuallyAdd={onManuallyAdd}
            />
          ) : (
            // This case should not happen, but show message just in case
            <ScanningResultsErrorView
              errorMessage={"No book selected"}
              onRetry={onRetry}
              onCancel={onCancelButtonClicked}
              onManuallyAdd={onManuallyAdd}
            />
          )}
        </Box>
        <Box
          sx={{
            width: "100%",
            maxWidth: "25rem",
            mx: "auto",
            mb: "0.5rem",
            mt: 0,
            flexShrink: 0,
          }}
        >
          <ScanningResultsButtons
            numberOfBooks={queuedBooks.length}
            onInsert={onInsert}
            onRemove={onRemove}
            onCancel={onCancelButtonClicked}
          />
        </Box>
      </Container>

      <WrongBookDialog
        open={wrongBookDialogOpen}
        onTryAgain={() => {
          setWrongBookDialogOpen(false);
          onTryAgain();
        }}
        onManuallyAdd={() => {
          onDontAdd(); // Remove the wrong book from the queue
          setWrongBookDialogOpen(false);
          onManuallyAdd();
        }}
        onDontAdd={onDontAddButtonClicked}
      />

      <ConfirmDialog
        title="Discard all scanned books?"
        text="Discard all scanned books without inserting or taking them from a shelf?"
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
