import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Dialog,
  Stack,
  Container,
} from "@mui/material";
import { shelfAction } from "../../services/api/shelfActions";
import ActionResultAlert from "./ActionResultAlert";
import ShelfMap from "../map/ShelfMap";
import { useAppState } from "../../state/AppStateProvider";
import { ShelfAction } from "../../types/ShelfAction";
import CancelDialog from "../dialogs/CancelDialog";

type ShelfActionViewProps = {
  action: ShelfAction;
  onCancel: () => void;
  onRestart: () => void;
};

export default function ShelfActionView({
  action,
  onCancel,
  onRestart,
}: ShelfActionViewProps) {
  const { state, dispatch } = useAppState();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  // Needed to ensure the successful actions are not repeated -> hide action buttons if true
  const [partialSuccess, setPartialSuccess] = useState(false);

  const handleShelfSubmit = async () => {
    setPartialSuccess(false);
    setErrors([]);

    // Input validation
    const shelfId = state.selectedShelf?.osmId;
    if (!shelfId) {
      setResult({ success: false, message: "Please select a shelf." });
      return;
    }

    if (action.books.length === 0) {
      setResult({
        success: false,
        message: "Please scan at least one book before submitting.",
      });
      return;
    }

    dispatch({ type: "RESET_PRESELECTED_SHELF_ACTION" });

    let succeededCount = 0;
    let errorCount = 0;

    // Fetch results for each book sequentially
    for (const book of action.books) {
      const res = await shelfAction(action.action, shelfId, book.isbn);
      if (res.success) {
        succeededCount += 1;
      } else {
        setErrors((prev) => [
          ...prev,
          `${book.title ?? book.isbn} (${book.isbn}): ${res.message}`,
        ]);
        errorCount += 1;
      }
    }

    const totalCount = action.books.length;
    const actionVerb = action.action === "insert" ? "inserted" : "removed";

    // Full success
    if (errorCount === 0) {
      setResult({
        success: true,
        message: `Successfully ${actionVerb} ${totalCount} book${
          totalCount === 1 ? "" : "s"
        }.`,
      });
      return;
    }

    // errorCount > 0
    const failedCount = totalCount - succeededCount;
    if (failedCount != totalCount) {
      setPartialSuccess(true);
    }
    setResult({
      success: false,
      message:
        succeededCount > 0
          ? `${succeededCount} of ${totalCount} book${
              totalCount === 1 ? "" : "s"
            } ${actionVerb}. Failed to ${action.action} ${failedCount} book${
              failedCount === 1 ? "" : "s"
            }.`
          : `Failed to ${action.action} ${totalCount} book${
              totalCount === 1 ? "" : "s"
            }.`,
    });
  };

  const shelfIdRepr = state.selectedShelf?.osmId || "Not set";

  // TODO: Remove this block and show all books in a list instead of the summary when there are multiple books.
  const firstBook = action.books[0];
  const actionVerb = action.action === "insert" ? "inserted" : "removed";
  const bookSummary =
    action.books.length === 1
      ? firstBook
        ? (firstBook.title ?? firstBook.isbn)
        : "Book"
      : `${action.books.length} books`;

  // todo: move parts of this to seperate components / ShelfActionDialog.tsx
  return (
    <Container className="app-container" maxWidth={false}>
      <Box sx={{ width: "100%", maxWidth: "25rem", mx: "auto", mt: "2rem" }}>
        <Card sx={{ mb: "1rem", p: 2 }}>
          <Typography variant="h6">{bookSummary}</Typography>
          {action.books.length === 1 && firstBook && (
            <>
              <Typography variant="body2">by {firstBook.author}</Typography>
              <Typography variant="body2">ISBN: {firstBook.isbn}</Typography>
            </>
          )}
          {action.books.length > 1 && (
            <Typography variant="body2">
              {action.books.length} books will be {actionVerb} on this shelf.
            </Typography>
          )}
        </Card>

        <Card sx={{ mb: "1rem", p: 2 }}>
          <Typography variant="body2">
            Bookshelf OSM ID: {shelfIdRepr}
          </Typography>
          <Button variant="outlined" onClick={() => setMapDialogOpen(true)}>
            Change
          </Button>
        </Card>

        {/* Map Dialog for selecting shelf */}
        <Dialog
          open={mapDialogOpen}
          onClose={() => setMapDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <Box sx={{ height: "70vh", width: "100%", position: "relative" }}>
            <ShelfMap showSelect={true} showInsert={false} showRemove={false} />
            <Button
              variant="contained"
              onClick={() => setMapDialogOpen(false)}
              sx={{
                position: "absolute",
                bottom: 16,
                right: 16,
                zIndex: 1000,
              }}
            >
              Done
            </Button>
          </Box>
        </Dialog>

        {result && <ActionResultAlert result={result} errors={errors} />}
        {(result === null || !result.success) && !partialSuccess ? (
          <Stack direction="row" spacing={2} sx={{ mt: "1.5rem" }}>
            <Button
              variant="outlined"
              onClick={() => setCancelDialogOpen(true)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleShelfSubmit}
            >
              {action.action === "insert" ? "Insert" : "Remove"}
            </Button>
          </Stack>
        ) : (
          <Box sx={{ mt: "1.5rem" }}>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={onRestart}>
              Restart Scanning
            </Button>
          </Box>
        )}
      </Box>
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
    </Container>
  );
}
