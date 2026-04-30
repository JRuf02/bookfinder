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
import { shelfAction } from "../services/shelfActions";
import ActionResultAlert from "./ActionResultAlert";
import ShelfMap from "./map/ShelfMap";
import { useAppState } from "../state/AppStateProvider";

type ShelfActionViewProps = {
  book: any;
  action: "insert" | "remove";
  onCancel: () => void;
  onRescan: () => void;
};

export default function ShelfActionView({
  book,
  action,
  onCancel,
  onRescan,
}: ShelfActionViewProps) {
  const { state, dispatch } = useAppState();
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleShelfSubmit = async () => {
    let shelfId = state.selectedShelf?.osmId;
    if (!shelfId) {
      setResult({ success: false, message: "Shelf ID is required." });
      return;
    }
    dispatch({ type: "RESET_PRESELECTED_SHELF_ACTION" });
    const res = await shelfAction(action, shelfId, book.isbn);
    setResult(res);
  };

  let shelfIdRepr = state.selectedShelf?.osmId || "Not set";

  // todo: move parts of this to seperate components / ShelfActionDialog.tsx
  return (
    <Container className="app-container">
      <Box sx={{ width: "100%", maxWidth: "25rem", mx: "auto", mt: "2rem" }}>
        <Card sx={{ mb: "1rem", p: 2 }}>
          <Typography variant="h6">{book.title}</Typography>
          <Typography variant="body2">by {book.author}</Typography>
          <Typography variant="body2">ISBN: {book.isbn}</Typography>
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

        {result && <ActionResultAlert result={result} />}
        {result === null || !result.success ? (
          <Stack direction="row" spacing={2} sx={{ mt: "1.5rem" }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleShelfSubmit}
            >
              {action === "insert" ? "Insert" : "Remove"}
            </Button>
          </Stack>
        ) : (
          <Box sx={{ mt: "1.5rem" }}>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={onRescan}>
              Scan Another
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
