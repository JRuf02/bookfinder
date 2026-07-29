import MyLocationIcon from "@mui/icons-material/MyLocation";
import { IconButton, Paper, Tooltip } from "@mui/material";
import L from "leaflet";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { useMap } from "react-leaflet";

const LocateMeButtonContent = ({ onClick }: { onClick: () => void }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleClick = () => {
    setTooltipOpen(false); // force close, e.g. when an error dialog opens
    onClick();
  };

  return (
    <Paper elevation={1}>
      <Tooltip
        title="Find me"
        placement="right"
        open={tooltipOpen}
        onOpen={() => setTooltipOpen(true)}
        onClose={() => setTooltipOpen(false)}
      >
        <IconButton size="small" color="primary" onClick={handleClick}>
          <MyLocationIcon />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export const LocateMeButton = ({ onClick }: { onClick: () => void }) => {
  const map = useMap();

  useEffect(() => {
    const control = new L.Control({ position: "topleft" });
    let root: ReactDOM.Root | undefined;

    control.onAdd = () => {
      const container = L.DomUtil.create("div");
      L.DomEvent.disableClickPropagation(container);

      root = ReactDOM.createRoot(container);
      root.render(<LocateMeButtonContent onClick={onClick} />);

      return container;
    };

    control.addTo(map);
    return () => {
      control.remove();
      root?.unmount();
    };
  }, [map, onClick]);

  return null;
};
