import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import { fetchAllBookshelves } from "../../services/api/bookshelves";
import { getUserLocation } from "../../services/location";
import { useAppState } from "../../state/AppStateProvider";
import { Shelf } from "../../types/Shelf";
import ErrorDialog from "../dialogs/ErrorDialog";
import { LocateMeButton } from "./LocateMeButton";
import MapPopup from "./MapPopup";

const DEFAULT_CENTER_COORDS: [number, number] = [48.0126, 7.835];

type LocationError = {
  title: string;
  text: string;
};

type ShelfMapContentProps = {
  showSelect?: boolean;
  showInsert?: boolean;
  showRemove?: boolean;
  showShowBooks?: boolean;
  onInsert?: (shelf: Shelf) => void;
  onRemove?: (shelf: Shelf) => void;
  onShowBooks?: (shelf: Shelf) => void;
};

export default function ShelfMapContent({
  showSelect,
  showInsert,
  showRemove,
  showShowBooks,
  onInsert,
  onRemove,
  onShowBooks,
}: ShelfMapContentProps) {
  const { state, dispatch } = useAppState();
  const [bookshelves, setBookshelves] = useState<Shelf[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<LocationError | null>(
    null,
  );
  const map = useMap();
  const [mapSize, setMapSize] = useState(() => map.getSize()); // Needed for MapPopup

  useEffect(() => {
    const updateMapSize = () => {
      setMapSize(map.getSize());
    };

    updateMapSize();
    map.on("resize", updateMapSize);

    return () => {
      map.off("resize", updateMapSize);
    };
  }, [map]);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    fetchAllBookshelves()
      .then((shelves) => {
        if (!isMounted) {
          return;
        }

        setBookshelves(shelves);
        setLoadError(null);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setLoadError("Could not load bookshelves.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handler for LocateMeControl
  const handleLocateMeClick = async () => {
    try {
      const userCoords = await getUserLocation();
      map.setView([userCoords.latitude, userCoords.longitude], 15);
      dispatch({
        type: "SET_USER_COORDINATES",
        payload: userCoords,
      });
    } catch {
      setLocationError({
        title: "Could not get your location",
        text: "Please activate GPS in your device settings and allow location access for this app.",
      });
    }
  };

  // Center on most recently used shelf
  useEffect(() => {
    if (state.selectedShelf) {
      map.setView(
        [state.selectedShelf.latitude, state.selectedShelf.longitude],
        15,
      );
    } else {
      map.setView(DEFAULT_CENTER_COORDS, 12);
    }
  }, [map]);

  return (
    <>
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 1.5,
            zIndex: 1000,
            bgcolor: "rgba(255, 255, 255, 0.75)",
            pointerEvents: "none",
          }}
        >
          <CircularProgress size={35} />
          <Typography variant="body2" color="text.secondary">
            Loading bookshelves...
          </Typography>
        </Box>
      )}

      {loadError && !isLoading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            bgcolor: "rgba(255, 255, 255, 0.75)",
            pointerEvents: "none",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {loadError}
          </Typography>
        </Box>
      )}

      {/* Render clustered bookshelf markers */}
      <MarkerClusterGroup
        chunkedLoading
        showCoverageOnHover={false}
        spiderfyOnMaxZoom={false}
        animateAddingMarkers={false}
        animate
        zoomToBoundsOnClick
        disableClusteringAtZoom={11}
        maxClusterRadius={50}
        removeOutsideVisibleBounds
      >
        {bookshelves.map((shelf) =>
          shelf.latitude != null && shelf.longitude != null ? (
            <Marker
              key={shelf.osmId}
              position={[shelf.latitude, shelf.longitude]}
            >
              <Popup>
                {/* TODO: remove extra Popup around MapPopup? */}
                <MapPopup
                  shelf={shelf}
                  isSelected={state.selectedShelf?.osmId === shelf.osmId}
                  showInsert={showInsert}
                  showRemove={showRemove}
                  showSelect={showSelect}
                  showShowBooks={showShowBooks}
                  maxWidth={Math.max(1, mapSize.x - 40)}
                  maxHeight={Math.max(1, mapSize.y - 60)}
                  onInsert={
                    onInsert
                      ? () => onInsert(shelf)
                      : () => {
                          console.error("Insert handler not provided");
                        }
                  }
                  onRemove={
                    onRemove
                      ? () => onRemove(shelf)
                      : () => {
                          console.error("Remove handler not provided");
                        }
                  }
                  onSelect={() => {
                    dispatch({ type: "SET_SELECTED_SHELF", payload: shelf });
                  }}
                  onShowBooks={
                    onShowBooks
                      ? () => onShowBooks(shelf)
                      : () => {
                          console.error("ShowBooks handler not provided");
                        }
                  }
                />
              </Popup>
            </Marker>
          ) : null,
        )}
      </MarkerClusterGroup>

      {/* TODO: show "selected" on standard popup of selected shelf */}

      {/* User location marker */}
      {state.userCoordinates && (
        <Marker
          position={[
            state.userCoordinates.latitude,
            state.userCoordinates.longitude,
          ]}
        >
          <Popup>
            <span>Your location</span>
          </Popup>
        </Marker>
      )}

      {/* Locate Me button */}
      <LocateMeButton onClick={handleLocateMeClick} />

      {locationError && (
        <ErrorDialog
          open={!!locationError}
          title={locationError.title}
          text={locationError.text}
          onClose={() => setLocationError(null)}
        />
      )}
    </>
  );
}
