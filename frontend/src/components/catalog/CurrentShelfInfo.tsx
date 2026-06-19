import { Typography } from "@mui/material";
import { Shelf } from "../../types/Shelf";

type CurrentShelfInfoProps = {
  activeShelf: Shelf;
};

/** Renders information about the currently active shelf */
export default function CurrentShelfInfo({
  activeShelf,
}: CurrentShelfInfoProps) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mt: 0.5, mb: 0.5 }}
    >
      Showing books for shelf:{" "}
      {activeShelf.name ||
        activeShelf.address ||
        activeShelf.operator ||
        activeShelf.osmId}
    </Typography>
  );
}
