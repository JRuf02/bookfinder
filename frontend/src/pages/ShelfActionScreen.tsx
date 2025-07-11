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
  const [result, setResult] = useState<string | null>(null);

  const handleShelfSubmit = async () => {
    const res = await shelfAction(action, osmId, book.dnbISBN);
    setResult(res.message);
  };

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
        {!result ? (
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
            <Typography variant="body1">{result}</Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={onRescan}>
              Scan Another
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
