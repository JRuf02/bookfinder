import "leaflet/dist/leaflet.css";
import "./styles/global.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeScreen from "./pages/HomeScreen";
import ScanningScreen from "./pages/ScanningScreen";
/*import ManualAddScreen from "./pages/ManualAddScreen";
import InfoScreen from "./pages/InfoScreen";*/
import CatalogHomeScreen from "./pages/CatalogHomeScreen";
import NotFoundScreen from "./pages/NotFoundScreen";
import BottomNavBar from "./components/layout/BottomNavBar";

function App() {
  /*
        <Route path="/manual-add" element={<ManualAddScreen />} />
        <Route path="/info" element={<InfoScreen />} />
  */

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/catalog" element={<CatalogHomeScreen />} />
        <Route path="/scan" element={<ScanningScreen />} />
        <Route path="/scan/:mode" element={<ScanningScreen />} />
        {/* ...other routes */}
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
      <BottomNavBar />
    </BrowserRouter>
  );
}

export default App;
