import CameraAltIcon from "@mui/icons-material/CameraAlt";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Home", icon: <HomeIcon />, path: "/" },
    { label: "Catalog", icon: <SearchIcon />, path: "/catalog" },
    { label: "Scan", icon: <CameraAltIcon />, path: "/scan" },
    { label: "Info", icon: <InfoIcon />, path: "/info" },
  ];

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={navItems.findIndex((item) => item.path === location.pathname)}
        onChange={(_, newValue) => navigate(navItems[newValue].path)}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
