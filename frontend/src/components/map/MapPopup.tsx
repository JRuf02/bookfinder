import { Button, Stack, Typography, Link } from "@mui/material";
import { Bookshelf } from "../../services/bookshelves";

type MapPopupProps = {
  shelf: Bookshelf;
  showInsert?: boolean;
  showRemove?: boolean;
  onInsert?: () => void;
  onRemove?: () => void;
};

export default function MapPopup({
  shelf,
  showInsert,
  showRemove,
  onInsert,
  onRemove,
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
      {shelf.opening_hours && (
        <Typography variant="body2">
          Opening hours: {shelf.opening_hours}
        </Typography>
      )}
      {shelf.osm_check_date && (
        <Typography variant="body2">
          OSM check date: {shelf.osm_check_date}
        </Typography>
      )}
      {shelf.osm_last_updated && (
        <Typography variant="body2">
          OSM last updated: {shelf.osm_last_updated}
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
      </Stack>
    </Stack>
  );
}
