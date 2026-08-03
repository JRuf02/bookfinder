import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./styles/global.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import BottomNavBar from "./components/layout/BottomNavBar";
import CatalogScreen from "./pages/CatalogScreen";
import HomeScreen from "./pages/HomeScreen";
import NotFoundScreen from "./pages/NotFoundScreen";
import ScanningScreen from "./pages/ScanningScreen";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/catalog" element={<CatalogScreen />} />
        <Route path="/scan" element={<ScanningScreen />} />
        {/* ...other routes */}
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
      <BottomNavBar />
    </BrowserRouter>
  );
}

export default App;
