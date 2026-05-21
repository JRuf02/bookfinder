import { Button, Stack, Typography, Link } from "@mui/material";
import { Shelf } from "../../types/Shelf";

type MapPopupProps = {
  shelf: Shelf;
  showInsert?: boolean;
  showRemove?: boolean;
  showSelect?: boolean;
  showShowBooks?: boolean;
  onInsert?: () => void;
  onRemove?: () => void;
  onSelect?: () => void;
  onShowBooks?: () => void;
};

export default function MapPopup({
  shelf,
  showInsert,
  showRemove,
  showSelect,
  showShowBooks,
  onInsert,
  onRemove,
  onSelect,
  onShowBooks,
}: MapPopupProps) {
  return (
    <Stack spacing={1} alignItems="flex-start" sx={{ minWidth: 200 }}>
      <Typography variant="subtitle1">{shelf.name || "Bookshelf"}</Typography>
      {shelf.address && (
        <Typography variant="body2">Address: {shelf.address}</Typography>
      )}
      {shelf.type && (
        <Typography variant="body2">Type: {shelf.type}</Typography>
      )}
      {shelf.operator && (
        <Typography variant="body2">Operator: {shelf.operator}</Typography>
      )}
      {shelf.website && (
        <Typography variant="body2">
          Website:{" "}
          <Link href={shelf.website} target="_blank" rel="noopener">
            {shelf.website}
          </Link>
        </Typography>
      )}
      {shelf.openingHours && (
        <Typography variant="body2">
          Opening hours: {shelf.openingHours}
        </Typography>
      )}
      {shelf.osmCheckDate && (
        <Typography variant="body2">
          OSM check date: {shelf.osmCheckDate}
        </Typography>
      )}
      {shelf.osmLastUpdated && (
        <Typography variant="body2">
          OSM last updated: {shelf.osmLastUpdated}
        </Typography>
      )}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        {showInsert && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={onInsert}
          >
            Insert
          </Button>
        )}
        {showRemove && (
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
        {showSelect && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={onSelect}
          >
            Select{/*Todo: Change to "Selected" if already selected*/}
          </Button>
        )}
        {showShowBooks && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={onShowBooks}
          >
            Show Books{/*Todo: use mui icons?*/}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
