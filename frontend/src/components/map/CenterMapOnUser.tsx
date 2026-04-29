import { useEffect } from "react";
import { useMap } from "react-leaflet";

// TODO: Move centering logic to a non-rendering component, e.g. in services/map/centerMapOnShelf.ts
// TODO: Rename this component to CenterMapOnLocation or also handle location here?
export function CenterMapOnUser({
  userCoords,
  shouldCenter,
  onDone,
}: {
  userCoords: [number, number] | null;
  shouldCenter: boolean;
  onDone: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (shouldCenter && userCoords) {
      // TODO: move standard zoom factor to sth like a global config?
      map.setView(userCoords, 15);
      onDone(); // Reset trigger
    } else if (shouldCenter && !userCoords) {
      // TODO: improve error text / design
      alert("Could not center map on your location.");
    }
  }, [shouldCenter, userCoords, map, onDone]);

  return null;
}
