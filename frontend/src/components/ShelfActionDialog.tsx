// TODO !!!!
// This component is not used any more! Delete or replace it with the new implementation from the new ShelfActionScreen component.

/*
import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
} from "@mui/material";

type Props = {
  action: "insert" | "remove";
  onSubmit: (osmId: string) => void;
  onCancel: () => void;
};

export default function ShelfActionDialog({
  action,
  onSubmit,
  onCancel,
}: Props) {
  const [osmId, setOsmId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(osmId);
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={3}
      sx={{ p: 3, maxWidth: 500, width: "100%", mt: 2 }}
    >
      <Typography variant="h6" gutterBottom>
        {action === "insert"
          ? "Insert book into bookshelf"
          : "Remove book from bookshelf"}
      </Typography>

      <TextField
        fullWidth
        label="Bookshelf OSM ID"
        placeholder="Enter bookshelf OSM ID"
        value={osmId}
        onChange={(e) => setOsmId(e.target.value)}
        autoFocus
        required
        margin="normal"
      />

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          type="submit"
          color={action === "insert" ? "primary" : "secondary"}
        >
          Confirm
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Stack>
    </Paper>
  );
}
*/
