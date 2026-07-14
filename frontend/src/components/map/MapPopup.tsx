import LanguageIcon from "@mui/icons-material/Language";
import ListIcon from "@mui/icons-material/List";
import NavigationIcon from "@mui/icons-material/Navigation";
import PlaceIcon from "@mui/icons-material/Place";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
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
  maxWidth?: number;
  maxHeight?: number;
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
  maxWidth,
  maxHeight,
  onInsert,
  onRemove,
  onSelect,
  onShowBooks,
}: MapPopupProps) {
  // Ref to the root element of the popup content, used to disable event propagation to the map.
  // Needed to prevent MapPopup from closing and reopening when clicking buttons inside the popup.
  const popupContentRef = useRef<HTMLDivElement>(null);

  const navigationURL =
    shelf.latitude && shelf.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${shelf.latitude},${shelf.longitude}`
      : undefined;

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
      sx={{
        minWidth: 0,
        maxWidth: maxWidth !== undefined ? `${maxWidth}px` : "min(90vw, 24rem)",
        maxHeight:
          maxHeight !== undefined ? `${maxHeight}px` : "min(70vh, 32rem)",
        overflowX: "hidden",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="subtitle1">{shelf.name || "Bookshelf"}</Typography>

      <ShelfMetadataTable shelf={shelf} />

      {(shelf.osmCheckDate || shelf.osmLastUpdated) && (
        <Typography variant="caption" color="text.secondary" align="right">
          shelf info updated{" "}
          <Moment utc fromNow>{shelf.osmCheckDate || shelf.osmLastUpdated}</Moment>
        </Typography>
      )}
      <Box>
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ flexWrap: "nowrap", maxWidth: "100%" }}
        >
          <Button
            size="small"
            startIcon={<PlaceIcon />}
            variant="outlined"
            href={shelf.osmId ?? ""}
            target="_blank"
            rel="noopener noreferrer"
            disabled={!shelf.osmId}
            onClick={(e) => !shelf.osmId && e.preventDefault()}
          >
            Location
          </Button>
          <Button
            size="small"
            startIcon={<NavigationIcon />}
            variant="outlined"
            href={navigationURL ?? ""}
            target="_blank"
            rel="noopener noreferrer"
            disabled={!navigationURL}
            onClick={(e) => !navigationURL && e.preventDefault()}
          >
            Navigate
          </Button>

          {shelf.website && (
            <Tooltip title="Website" placement="right" arrow>
              <IconButton
                size="small"
                color="primary"
                aria-label="website"
                href={shelf.website ?? ""}
                target="_blank"
                rel="noopener noreferrer"
                disabled={!shelf.website}
                onClick={(e) => !shelf.website && e.preventDefault()}
              >
                <LanguageIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ flexWrap: "nowrap", maxWidth: "100%", pt: 0.5 }}
        >
          {showInsert && (
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<PlaylistAddIcon />}
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
              startIcon={<PlaylistRemoveIcon />}
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
              color="info"
              startIcon={<ListIcon />}
              onClick={onShowBooks}
            >
              Books
            </Button>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}
