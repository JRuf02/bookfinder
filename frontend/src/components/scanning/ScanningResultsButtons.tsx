import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import { Button, Stack, Typography } from "@mui/material";

import { useAppState } from "../../state/AppStateProvider";

type ScanningResultsButtonsProps = {
  numberOfBooks: number;
  onInsert: () => void;
  onRemove: () => void;
  onCancel: () => void;
};

export default function ScanningResultsButtons({
  numberOfBooks,
  onInsert,
  onRemove,
  onCancel,
}: ScanningResultsButtonsProps) {
  const { state } = useAppState();

  return (
    <div>
      <Stack direction="row" sx={{ my: 0.5 }}>
        <Typography variant="body1" color="text.secondary">
          {numberOfBooks} book(s) scanned so far
        </Typography>
      </Stack>

      {numberOfBooks > 0 && (
        <>
          <Stack direction="row" sx={{ gap: 1 }}>
            {(state.preSelectedShelfAction === "insert" ||
              state.preSelectedShelfAction === "both") && (
              <Button
                startIcon={<PlaylistAddIcon />}
                variant="contained"
                color="primary"
                onClick={onInsert}
              >
                Insert {numberOfBooks} books into bookshelf
              </Button>
            )}
            {(state.preSelectedShelfAction === "remove" ||
              state.preSelectedShelfAction === "both") && (
              <Button
                startIcon={<PlaylistRemoveIcon />}
                variant="contained"
                color="secondary"
                onClick={onRemove}
              >
                Remove {numberOfBooks} books from bookshelf
              </Button>
            )}
          </Stack>
          <Button
            variant="outlined"
            onClick={onCancel}
            fullWidth
            sx={{ mt: 1 }}
          >
            Cancel
          </Button>
        </>
      )}
    </div>
  );
}
