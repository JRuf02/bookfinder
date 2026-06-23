import { MapContainer, TileLayer } from "react-leaflet";

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
