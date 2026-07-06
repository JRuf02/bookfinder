import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer } from "react-leaflet";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import { Shelf } from "../../types/Shelf";
import ShelfMapContent from "./ShelfMapContent";

type ShelfMapProps = {
  showSelect?: boolean;
  showInsert?: boolean;
  showRemove?: boolean;
  showShowBooks?: boolean;
  onInsert?: (shelf: Shelf) => void;
  onRemove?: (shelf: Shelf) => void;
  onShowBooks?: (shelf: Shelf) => void;
};

export default function ShelfMap({
  showSelect = true,
  showInsert = false,
  showRemove = false,
  showShowBooks = false,
  onInsert,
  onRemove,
  onShowBooks,
}: ShelfMapProps) {
  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", position: "relative" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ShelfMapContent
        showSelect={showSelect}
        showInsert={showInsert}
        showRemove={showRemove}
        showShowBooks={showShowBooks}
        onInsert={onInsert}
        onRemove={onRemove}
        onShowBooks={onShowBooks}
      />
    </MapContainer>
  );
}
