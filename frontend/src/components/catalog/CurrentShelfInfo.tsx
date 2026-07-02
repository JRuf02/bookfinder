import Alert from "@mui/material/Alert";

import { removeOsmIdPrefix } from "../../services/prefix";
import { Shelf } from "../../types/Shelf";

type CurrentShelfInfoProps = {
  activeShelf: Shelf;
  onClose: () => void;
};

/** Renders information about the currently active shelf */
export default function CurrentShelfInfo({
  activeShelf,
  onClose,
}: CurrentShelfInfoProps) {
  return (
    <Alert
      severity="info"
      variant="outlined"
      onClose={onClose}
      sx={{
        bgcolor: "background.paper",
        minWidth: "100%",
        py: 0,
        px: 1,
        mb: "1rem",
        minHeight: 28,
        "& .MuiAlert-message": {
          fontSize: "0.8rem",
          lineHeight: 1.3,
        },
        "& .MuiAlert-icon": {
          fontSize: 16,
          mr: 0.75,
        },
        "& .MuiAlert-action": {
          p: 0,
        },
      }}
    >
      Showing books in shelf:{" "}
      {activeShelf.name ||
        activeShelf.operator ||
        activeShelf.address ||
        removeOsmIdPrefix(activeShelf.osmId)}
    </Alert>
  );
}
