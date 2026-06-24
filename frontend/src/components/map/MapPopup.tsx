import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { Button, Stack, Typography } from "@mui/material";
import L from "leaflet";
import { useEffect, useRef } from "react";
import Moment from "react-moment";

import { Shelf } from "../../types/Shelf";
import ShelfMetadataTable from "./ShelfMetadataTable";

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

      <ShelfMetadataTable shelf={shelf} />

      {(shelf.osmCheckDate || shelf.osmLastUpdated) && (
        <Typography variant="body2" color="text.secondary" align="right">
          shelf info updated{" "}
          <Moment fromNow>{shelf.osmCheckDate || shelf.osmLastUpdated}</Moment>
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
            startIcon={isSelected ? <TaskAltIcon /> : undefined}
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
