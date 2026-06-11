import { useEffect, useRef } from "react";
import CheckIcon from "@mui/icons-material/Check";
import L from "leaflet";
import { Button, Stack, Typography, Link } from "@mui/material";
import { Shelf } from "../../types/Shelf";

type MapPopupProps = {
  shelf: Shelf;
  isSelected?: boolean;
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
  isSelected,
  showInsert,
  showRemove,
  showSelect,
  showShowBooks,
  onInsert,
  onRemove,
  onSelect,
  onShowBooks,
}: MapPopupProps) {
  // Ref to the root element of the popup content, used to disable event propagation to the map.
  // Needed to prevent MapPopup from closing and reopening when clicking buttons inside the popup.
  const popupContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popupContentRef.current) {
      return;
    }

    L.DomEvent.disableClickPropagation(popupContentRef.current);
    L.DomEvent.disableScrollPropagation(popupContentRef.current);
  }, []);

  return (
    <Stack
      ref={popupContentRef}
      spacing={1}
      alignItems="flex-start"
      sx={{ minWidth: 200 }}
    >
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
            startIcon={isSelected ? <CheckIcon /> : undefined}
            onClick={onSelect}
          >
            {isSelected ? "Selected" : "Select"}
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
