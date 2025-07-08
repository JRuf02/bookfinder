import { useState, useRef } from "react";
import { Box, Typography, Button, Container, Stack } from "@mui/material";
import Scanner from "./components/Scanner";
import ISBNInput from "./components/ISBNInput";
import BookDisplay from "./components/BookDisplay";
import ShelfActionDialog from "./components/ShelfActionDialog";
import ActionResultDialog from "./components/ActionResultDialog";
import { fetchBookData } from "./services/fetchBookData";
import { shelfAction } from "./services/shelfActions";
import "./styles/global.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
//import HomeScreen from "./pages/HomeScreen";
import ScanningScreen from "./pages/ScanningScreen";
/*import ScannerResultScreen from "./pages/ScannerResultScreen";
import ShelfActionScreen from "./pages/ShelfActionScreen";
import ManualAddScreen from "./pages/ManualAddScreen";
import InfoScreen from "./pages/InfoScreen";
import CatalogHomeScreen from "./pages/CatalogHomeScreen";
import NotFoundScreen from "./pages/NotFoundScreen";*/
import BottomNavBar from "./components/BottomNavBar";

type ShelfAction = "insert" | "remove" | null;

function App() {
  // TODO? Remove unused/duplicate(see ScanningScreen.tsx) states / make global or use react createContext
  const [isbn, setIsbn] = useState<string>("");
  const [inputIsbn, setInputIsbn] = useState<string>("");
  const [book, setBook] = useState<{
    title: string;
    author: string;
    dnbISBN: string;
    dnbId: string;
  } | null>(null);
  const [scanning, setScanning] = useState(true);
  const [shelfActionType, setShelfActionType] = useState<ShelfAction>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);

  const scannerRef = useRef<{
    stopCamera: () => void;
    stopReading: () => void;
  } | null>(null);

  // Callback when Scanner finds a result
  const handleScanResult = async (scannedIsbn: string) => {
    setIsbn(scannedIsbn);
    setScanning(false);
    setBook(await fetchBookData(scannedIsbn));
  };

  /*
        <Route path="/" element={<HomeScreen />} />
        
        <Route path="/result" element={<ScannerResultScreen />} />
        <Route path="/shelf-action" element={<ShelfActionScreen />} />
        <Route path="/manual-add" element={<ManualAddScreen />} />
        <Route path="/info" element={<InfoScreen />} />
        <Route path="/catalog" element={<CatalogHomeScreen />} />
        <Route path="*" element={<NotFoundScreen />} />
  */

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/scan" element={<ScanningScreen />} />
        {/* ...other routes */}
      </Routes>
      <BottomNavBar />
    </BrowserRouter>
  );
}

export default App;
