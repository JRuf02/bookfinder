import { useState, useEffect } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";
import { shelfAction } from "../services/shelfActions";
import ActionResultAlert from "../components/ActionResultAlert";
import { getShelfMetadata } from "../services/fetchBookshelves";
import { useShelf } from "../context/ShelfContext";
import ShelfSelect from "../components/ShelfSelect";

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
  const { currentShelfId, setCurrentShelfId } = useShelf();
  const [osmId, setOsmId] = useState(currentShelfId || "");
  const [osmDialogOpen, setOsmDialogOpen] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [shelfName, setShelfName] = useState<string | null>(null);
  const [selectOpen, setSelectOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Check if we returned from ShelfSelectScreen with a selected shelf
  useEffect(() => {
    if (location.state?.selectedShelfId) {
      const newOsmId = location.state.selectedShelfId;
      setOsmId(newOsmId);

      // Fetch shelf metadata to display the name
      getShelfMetadata(newOsmId).then((shelf) => {
        if (shelf) {
          setShelfName(shelf.name || "Selected Bookshelf");
        }
      });

      // Clear the state to prevent reapplying on component remounts
      navigate(".", { state: undefined, replace: true });
    }
  }, [location, navigate]);

  const handleShelfSubmit = async () => {
    const res = await shelfAction(action, osmId, book.dnbISBN);
    setResult(res);
  };

  const handleSelectShelf = () => {
    // Navigate to shelf select screen, passing the current book and action
    navigate("/select-shelf", {
      state: {
        returnTo: "/scan", // Return to scanning flow
        book,
        action,
      },
    });
  };

  // When shelf is selected from map, update context and local state
  const handleShelfSelected = (selectedOsmId: string) => {
    setCurrentShelfId(selectedOsmId);
    setOsmId(selectedOsmId);
    // Optionally fetch shelf name here
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
            Bookshelf: {shelfName || "Not selected"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            OSM ID: {osmId || "Not set"}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button variant="outlined" onClick={() => setOsmDialogOpen(true)}>
              Enter ID manually
            </Button>
            <Button variant="contained" onClick={() => setSelectOpen(true)}>
              Select on Map
            </Button>
          </Stack>
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
        <Dialog
          open={selectOpen}
          onClose={() => setSelectOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <Box sx={{ height: 500 }}>
            <ShelfSelect
              onSelect={(osmId) => {
                handleShelfSelected(osmId);
                setSelectOpen(false);
              }}
              useNearbyOnly={true}
              radius={10000}
            />
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
              disabled={!osmId}
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
