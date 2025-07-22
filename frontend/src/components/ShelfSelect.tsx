import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button, Typography, Box, CircularProgress } from "@mui/material";
import {
  Bookshelf,
  getAllBookshelves,
  getNearbyBookshelves,
} from "../services/fetchBookshelves";
import { getUserLocation } from "../services/location";
import L from "leaflet";

// Fix Leaflet icon issues
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to set the view to user's location
function SetViewToUserLocation() {
  const map = useMap();

  useEffect(() => {
    getUserLocation()
      .then(({ lat, lon }) => {
        map.setView([lat, lon], 13);
      })
      .catch((error) => {
        console.error("Error getting user location:", error);
        // Default view if location not available
        map.setView([48.05, 7.9], 10);
      });
  }, [map]);

  return null;
}

interface ShelfSelectProps {
  onSelect: (osmId: string) => void;
  useNearbyOnly?: boolean;
  radius?: number;
}

export default function ShelfSelect({
  onSelect,
  useNearbyOnly = false,
  radius = 5000,
}: ShelfSelectProps) {
  const [bookshelves, setBookshelves] = useState<Bookshelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get user location for the map center
        const location = await getUserLocation();
        setUserLocation([location.lat, location.lon]);

        // Fetch bookshelves based on mode
        const shelves = useNearbyOnly
          ? await getNearbyBookshelves(radius)
          : await getAllBookshelves();

        setBookshelves(shelves);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load bookshelves");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [useNearbyOnly, radius]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          flexDirection: "column",
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading bookshelves...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: "error.main" }}>
        <Typography>Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      {userLocation ? (
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <SetViewToUserLocation />

          {/* User location marker */}
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: "user-location-marker",
              html: `<div style="background-color: #4285F4; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white;"></div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            })}
          >
            <Popup>Your location</Popup>
          </Marker>

          {/* Bookshelf markers */}
          {bookshelves.map((shelf) => (
            <Marker
              key={shelf.osm_id}
              position={[shelf.latitude, shelf.longitude]}
            >
              <Popup>
                <Typography variant="subtitle1" fontWeight="bold">
                  {shelf.name || "Unnamed Bookshelf"}
                </Typography>

                {shelf.type && (
                  <Typography variant="body2">Type: {shelf.type}</Typography>
                )}

                {shelf.address && (
                  <Typography variant="body2">
                    Address: {shelf.address}
                  </Typography>
                )}

                {shelf.opening_hours && (
                  <Typography variant="body2">
                    Hours: {shelf.opening_hours}
                  </Typography>
                )}

                {shelf.distance_m && (
                  <Typography variant="body2">
                    Distance: {(shelf.distance_m / 1000).toFixed(2)} km
                  </Typography>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => onSelect(shelf.osm_id)}
                >
                  Select this shelf
                </Button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <Box sx={{ p: 2 }}>
          <Typography>Unable to determine your location</Typography>
        </Box>
      )}
    </Box>
  );
}
