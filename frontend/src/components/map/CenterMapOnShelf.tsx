import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { fetchShelfMetadata } from "../../services/shelfMetadata";

// TODO: Move centering logic to a non-rendering component, e.g. in services/map/centerMapOnShelf.ts

export function CenterMapOnShelf({
  shelfId,
  userCoords,
  onShelfCoords,
}: {
  shelfId: string | null | undefined;
  userCoords: [number, number] | null;
  onShelfCoords: (coords: [number, number] | null) => void;
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
      // Fallback 1: Center on user location
      if (userCoords) {
        map.setView(userCoords, 15);
      } else {
        map.setView([48.0126, 7.835], 15); // Fallback: Default location
      }
    }
    center();
  }, [shelfId, userCoords, map, onShelfCoords]);

  return null;
}
