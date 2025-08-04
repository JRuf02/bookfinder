import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import { IconButton, Paper, Tooltip } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ReactDOM from "react-dom/client";

export const LocateMeButton = ({ onClick }: { onClick: () => void }) => {
  const map = useMap();

  useEffect(() => {
    const control = new L.Control({ position: "topleft" });

    control.onAdd = () => {
      const container = L.DomUtil.create("div");
      L.DomEvent.disableClickPropagation(container);

      const root = ReactDOM.createRoot(container);
      root.render(
        <Paper elevation={3} sx={{ m: "0.2rem" }}>
          <Tooltip title="Locate Me">
            <IconButton size="small" color="primary" onClick={onClick}>
              <MyLocationIcon />
            </IconButton>
          </Tooltip>
        </Paper>
      );

      return container;
    };

    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map, onClick]);

  return null;
};
