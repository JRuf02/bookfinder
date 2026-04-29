import { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import { getUserLocation } from "../../services/location";
import { fetchAllBookshelves } from "../../services/bookshelves";
import { CenterMapOnUser } from "./CenterMapOnUser";
import { LocateMeButton } from "./LocateMeButton";
import MapPopup from "./MapPopup";
import { Shelf } from "../../types/Shelf";
import { useAppState } from "../../state/AppStateProvider";

type ShelfMapContentProps = {
  showSelect?: boolean;
  showInsert?: boolean;
  showRemove?: boolean;
  onInsert?: (shelf: Shelf) => void;
  onRemove?: (shelf: Shelf) => void;
};

export default function ShelfMapContent({
  showSelect,
  showInsert,
  showRemove,
  onInsert,
  onRemove,
}: ShelfMapContentProps) {
  const { state, dispatch } = useAppState();
  // TODO: Use type for GeoCoordinates
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [shouldCenterOnUser, setShouldCenterOnUser] = useState(false);
  const [bookshelves, setBookshelves] = useState<Shelf[]>([]);
  const map = useMap();

  useEffect(() => {
    fetchAllBookshelves().then(setBookshelves);
  }, []);

  // Handler for LocateMeControl
  const handleLocateMeClick = async () => {
    try {
      const { lat, lon } = await getUserLocation();
      setUserCoords([lat, lon]);
      setShouldCenterOnUser(true);
    } catch {
      // TODO: show error to user / log
      alert("Could not get your location.");
    }
  };

  //////////
  // TODO: call center functions here, not as a non-rendering component inside the map
  // Center on most recently used shelf
  useEffect(() => {
    if (state.selectedShelf) {
      map.setView(
        [state.selectedShelf.latitude, state.selectedShelf.longitude],
        15,
      );
    } else if (userCoords) {
      // Fallback 1: Center on user location
      map.setView(userCoords, 15);
    } else {
      map.setView([48.0126, 7.835], 15); // Fallback: Default location
    }
  }, [map]);

  return (
    <>
      {/* Recenter on user when LocateMe button is clicked */}
      <CenterMapOnUser
        userCoords={userCoords}
        shouldCenter={shouldCenterOnUser}
        onDone={() => setShouldCenterOnUser(false)}
      />

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
                onInsert={
                  onInsert
                    ? () => onInsert(shelf)
                    : () => {
                        console.log("Insert handler not provided");
                      }
                }
                onRemove={
                  onRemove
                    ? () => onRemove(shelf)
                    : () => {
                        console.log("Remove handler not provided");
                      }
                }
                onSelect={() => {
                  dispatch({ type: "SET_SELECTED_SHELF", payload: shelf });
                }}
              />
            </Popup>
          </Marker>
        ) : null,
      )}

      {/* Selected shelf marker */}
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
      {userCoords && (
        <Marker position={userCoords}>
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
