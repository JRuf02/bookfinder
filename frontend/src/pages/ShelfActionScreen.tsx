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
  Alert,
} from "@mui/material";
import { shelfAction } from "../services/shelfActions";
import ActionResultAlert from "../components/ActionResultAlert";

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
  const [osmId, setOsmId] = useState("");
  const [osmDialogOpen, setOsmDialogOpen] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleShelfSubmit = async () => {
    const res = await shelfAction(action, osmId, book.dnbISBN);
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
            Bookshelf OSM ID: {osmId || "Not set"}
          </Typography>
          <Button variant="outlined" onClick={() => setOsmDialogOpen(true)}>
            Change
          </Button>
        </Card>
        <Dialog open={osmDialogOpen} onClose={() => setOsmDialogOpen(false)}>
          <Box sx={{ p: 2 }}>
            <Typography>Enter OSM ID:</Typography>
            <TextField
              value={osmId}
              onChange={(e) => setOsmId(e.target.value)}
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
