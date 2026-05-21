import { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import { getUserLocation } from "../../services/location";
import { fetchAllBookshelves } from "../../services/bookshelves";
import { LocateMeButton } from "./LocateMeButton";
import MapPopup from "./MapPopup";
import { Shelf } from "../../types/Shelf";
import { useAppState } from "../../state/AppStateProvider";

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
  const map = useMap();

  useEffect(() => {
    fetchAllBookshelves().then(setBookshelves);
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
      // TODO: show error to user / log
      alert("Could not get your location.");
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
      map.setView([48.0126, 7.835], 12); // Fallback: Default location
    }
  }, [map]);

  return (
    <>
      {/* Render all bookshelf markers */}
      {bookshelves.map((shelf) =>
        shelf.latitude && shelf.longitude ? (
          <Marker
            key={shelf.osmId}
            position={[shelf.latitude, shelf.longitude]}
          >
            <Popup>
              {/* TODO: remove extra Popup around MapPopup? */}
              <MapPopup
                shelf={shelf}
                showInsert={showInsert}
                showRemove={showRemove}
                showSelect={showSelect}
                showShowBooks={showShowBooks}
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

      {/* Selected shelf marker TODO: remove this, show "selected" on standard popup instead */}
      {state.selectedShelf && (
        <Marker
          position={[
            state.selectedShelf.latitude,
            state.selectedShelf.longitude,
          ]}
        >
          <Popup>
            <span>Selected Shelf</span>
          </Popup>
        </Marker>
      )}

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
    </>
  );
}
