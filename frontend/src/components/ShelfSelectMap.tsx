import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useShelf } from "../context/ShelfContext";
import { getUserLocation } from "../services/location";
import { fetchShelfMetadata } from "../services/shelfMetadata";

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
    // Find user location to show it on the map
    const fetchUserLocation = async (): Promise<[number, number] | null> => {
      try {
        const { lat, lon } = await getUserLocation();
        const userCoords: [number, number] = [lat, lon];
        onUserCoords(userCoords);
        return userCoords;
      } catch {
        onUserCoords(null);
        return null;
      }
    };
    // Center the map
    async function center(userCoords: [number, number] | null) {
      // Center on most recently selected shelf
      if (shelfId) {
        const shelf = await fetchShelfMetadata(shelfId);
        if (shelf && shelf.latitude && shelf.longitude) {
          const coords: [number, number] = [shelf.latitude, shelf.longitude];
          map.setView(coords, 15);
          onShelfCoords(coords);
          return;
        }
      }
      // fallback: Center on user location
      if (userCoords) {
        map.setView(userCoords, 15);
      } else {
        map.setView([51.505, -0.09], 15); // fallback: default location
      }
    }
    fetchUserLocation().then(center);
  }, [shelfId, map]);

  return null;
}

export default function ShelfSelectMap() {
  const { shelfId } = useShelf();
  const [shelfCoords, setShelfCoords] = useState<[number, number] | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

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
    </MapContainer>
  );
}
