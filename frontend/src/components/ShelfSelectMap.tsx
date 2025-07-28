import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useShelf } from "../context/ShelfContext";
import { getUserLocation } from "../services/location";
import { fetchShelfMetadata } from "../services/shelfMetadata";
import { fetchAllBookshelves, Bookshelf } from "../services/bookshelves";
import LocateMeControl from "./LocateMeMapControl";
import MapPopup from "./MapPopup";

function CenterMapOnShelfOrUser({
  shelfId,
  onShelfCoords,
  onUserCoords,
}: {
  shelfId: string | null;
  onShelfCoords: (coords: [number, number] | null) => void;
  onUserCoords: (coords: [number, number] | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    async function center() {
      // Center on most recently used shelf
      if (shelfId) {
        const shelf = await fetchShelfMetadata(shelfId);
        if (shelf && shelf.latitude && shelf.longitude) {
          const coords: [number, number] = [shelf.latitude, shelf.longitude];
          map.setView(coords, 15);
          onShelfCoords(coords);
          return;
        }
      }
      // Fallback: Center on user location
      try {
        const { lat, lon } = await getUserLocation();
        const userCoords: [number, number] = [lat, lon];
        map.setView(userCoords, 15);
        onUserCoords(userCoords);
      } catch {
        map.setView([48.0126, 7.835], 15); // Fallback: Default location
        onUserCoords(null);
      }
    }
    center();
    // Only run on mount or shelfId change
  }, [shelfId, map]);

  return null;
}

export default function ShelfSelectMap() {
  const { shelfId } = useShelf();
  const [shelfCoords, setShelfCoords] = useState<[number, number] | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [bookshelves, setBookshelves] = useState<Bookshelf[]>([]);

  useEffect(() => {
    fetchAllBookshelves().then(setBookshelves);
  }, []);

  // Handler for LocateMeControl
  const handleUserLocation = (coords: [number, number]) => {
    setUserCoords(coords);
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
      <CenterMapOnShelfOrUser
        shelfId={shelfId}
        onShelfCoords={setShelfCoords}
        onUserCoords={setUserCoords}
      />
      {bookshelves.map((shelf) =>
        shelf.latitude && shelf.longitude ? (
          <Marker
            key={shelf.osm_id}
            position={[shelf.latitude, shelf.longitude]}
          >
            <Popup>
              <MapPopup
                shelf={shelf}
                showInsert={true}
                showRemove={true}
                onInsert={() => {
                  /* handle insert */
                }}
                onRemove={() => {
                  /* handle remove */
                }}
              />
            </Popup>
          </Marker>
        ) : null
      )}
      {shelfCoords && (
        <Marker position={shelfCoords}>
          <Popup>
            <span>Selected Shelf</span>
          </Popup>
        </Marker>
      )}
      {userCoords && (
        <Marker position={userCoords}>
          <Popup>
            <span>Your location</span>
          </Popup>
        </Marker>
      )}
      <LocateMeControl onUserLocation={handleUserLocation} />
    </MapContainer>
  );
}
