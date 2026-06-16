import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./styles/global.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeScreen from "./pages/HomeScreen";
import ScanningScreen from "./pages/ScanningScreen";
import CatalogHomeScreen from "./pages/CatalogHomeScreen";
import NotFoundScreen from "./pages/NotFoundScreen";
import BottomNavBar from "./components/layout/BottomNavBar";

function App() {
  /*
        TODO: Add info screen with instructions for the app/scanning, data sources, contact info, etc.
        <Route path="/info" element={<InfoScreen />} />
  */

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/catalog" element={<CatalogHomeScreen />} />
        <Route path="/scan" element={<ScanningScreen />} />
        {/* ...other routes */}
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
      <BottomNavBar />
    </BrowserRouter>
  );
}

export default App;
