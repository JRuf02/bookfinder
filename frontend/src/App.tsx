import { useState, useRef } from "react";
import { fetchBookData } from "./services/fetchBookData";
import "./styles/global.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomeScreen from "./pages/HomeScreen";
import ScanningScreen from "./pages/ScanningScreen";
/*import ScannerResultScreen from "./pages/ScannerResultScreen";
import ShelfActionScreen from "./pages/ShelfActionScreen";
import ManualAddScreen from "./pages/ManualAddScreen";
import InfoScreen from "./pages/InfoScreen";
import CatalogHomeScreen from "./pages/CatalogHomeScreen";*/
import NotFoundScreen from "./pages/NotFoundScreen";
import BottomNavBar from "./components/BottomNavBar";

type ShelfAction = "insert" | "remove" | null;

function App() {
  /*
        <Route path="/result" element={<ScannerResultScreen />} />
        <Route path="/shelf-action" element={<ShelfActionScreen />} />
        <Route path="/manual-add" element={<ManualAddScreen />} />
        <Route path="/info" element={<InfoScreen />} />
        <Route path="/catalog" element={<CatalogHomeScreen />} />
  */

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/scan" element={<ScanningScreen />} />
        {/* ...other routes */}
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
      <BottomNavBar />
    </BrowserRouter>
  );
}

export default App;
