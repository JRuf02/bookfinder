import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Dialog,
  TextField,
  Stack,
  Container,
} from "@mui/material";
import { shelfAction } from "../services/shelfActions";
import ActionResultAlert from "../components/ActionResultAlert";
import { useShelf } from "../context/ShelfContext";
import ShelfSelectMap from "../components/map/ShelfSelectMap";

export default function ShelfActionScreen({
  book,
  action,
  onCancel,
  onRescan,
}: {
  book: any;
  action: "insert" | "remove";
  onCancel: () => void;
  onRescan: () => void;
}) {
  const { shelfId, setShelfId } = useShelf(); // this is the shelf's osm id
  const [osmDialogOpen, setOsmDialogOpen] = useState(false); // legacy osm id input dialog TODO: remove if not needed
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleShelfSubmit = async () => {
    if (!shelfId) {
      setResult({ success: false, message: "Shelf ID is required." });
      return;
    }
    const res = await shelfAction(action, shelfId, book.dnbISBN);
    setResult(res);
  };

  // todo: move parts of this to seperate components / ShelfActionDialog.tsx
  return (
    <Container className="app-container">
      <Box sx={{ width: "100%", maxWidth: "25rem", mx: "auto", mt: "2rem" }}>
        <Card sx={{ mb: "1rem", p: 2 }}>
          <Typography variant="h6">{book.title}</Typography>
          <Typography variant="body2">by {book.author}</Typography>
          <Typography variant="body2">ISBN: {book.dnbISBN}</Typography>
        </Card>
        <Card sx={{ mb: "1rem", p: 2 }}>
          <Typography variant="body2">
            Bookshelf OSM ID: {shelfId || "Not set"}
          </Typography>
          <Button variant="outlined" onClick={() => setMapDialogOpen(true)}>
            Change
          </Button>
          {/* TODO: Use ShelfSelectMap component for selecting shelf and getting osm id */}
        </Card>

        {/* Map Dialog for selecting shelf */}
        <Dialog
          open={mapDialogOpen}
          onClose={() => setMapDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <Box sx={{ height: "70vh", width: "100%", position: "relative" }}>
            <ShelfSelectMap />
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

        {/* Legacy OSM ID input dialog (optional - can be removed) */}
        <Dialog open={osmDialogOpen} onClose={() => setOsmDialogOpen(false)}>
          <Box sx={{ p: 2 }}>
            <Typography>Enter OSM ID:</Typography>
            <TextField
              value={shelfId || ""}
              onChange={(e) => setShelfId(e.target.value)}
              sx={{ mt: 1, mb: 2 }}
            />
            <Button variant="contained" onClick={() => setOsmDialogOpen(false)}>
              OK
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
