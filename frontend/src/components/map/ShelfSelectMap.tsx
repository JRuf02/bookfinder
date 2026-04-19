import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useShelf } from "../../context/ShelfContext";
import { getUserLocation } from "../../services/location";
import { fetchAllBookshelves, Bookshelf } from "../../services/bookshelves";
import { CenterMapOnShelf } from "./CenterMapOnShelf";
import { CenterMapOnUser } from "./CenterMapOnUser";
import { LocateMeButton } from "./LocateMeButton";
import MapPopup from "./MapPopup";

type ShelfSelectMapProps = {
  showSelect?: boolean;
  showInsert?: boolean;
  showRemove?: boolean;
  onInsert?: (shelf: Bookshelf) => void;
  onRemove?: (shelf: Bookshelf) => void;
};

export default function ShelfSelectMap({
  showSelect = true,
  showInsert = false,
  showRemove = false,
  onInsert,
  onRemove,
}: ShelfSelectMapProps) {
  const { shelfId, setShelfId } = useShelf();
  const [shelfCoords, setShelfCoords] = useState<[number, number] | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [shouldCenterOnUser, setShouldCenterOnUser] = useState(false);
  const [bookshelves, setBookshelves] = useState<Bookshelf[]>([]);

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

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Center on selected shelf (or fallback) at map load */}
      <CenterMapOnShelf
        shelfId={shelfId}
        userCoords={userCoords}
        onShelfCoords={setShelfCoords}
      />

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
                  setShelfId(shelf.osmId);
                }}
              />
            </Popup>
          </Marker>
        ) : null,
      )}

      {/* Selected shelf marker */}
      {shelfCoords && (
        <Marker position={shelfCoords}>
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
    </MapContainer>
  );
}
