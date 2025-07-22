import "./styles/global.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeScreen from "./pages/HomeScreen";
import ScanningScreen from "./pages/ScanningScreen";
/*import ManualAddScreen from "./pages/ManualAddScreen";
import InfoScreen from "./pages/InfoScreen";*/
import CatalogHomeScreen from "./pages/CatalogHomeScreen";
import NotFoundScreen from "./pages/NotFoundScreen";
import ShelfSelectScreen from "./pages/ShelfSelectScreen";
import BottomNavBar from "./components/BottomNavBar";
import { ShelfProvider } from "./context/ShelfContext";

function App() {
  /*
        <Route path="/manual-add" element={<ManualAddScreen />} />
        <Route path="/info" element={<InfoScreen />} />
  */

  return (
    <ShelfProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/catalog" element={<CatalogHomeScreen />} />
          <Route path="/scan" element={<ScanningScreen />} />
          <Route path="/select-shelf" element={<ShelfSelectScreen />} />
          {/* ...other routes */}
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
        <BottomNavBar />
      </BrowserRouter>
    </ShelfProvider>
  );
}

export default App;
