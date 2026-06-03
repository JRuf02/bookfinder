import { useState } from "react";
import ScanningResults from "../components/ScanningResults";
import ScanningView from "../components/ScanningView";
import ShelfActionView from "../components/ShelfActionView";
import { useAppState } from "../state/AppStateProvider";
import { ShelfAction } from "../types/ShelfAction";

export default function ScanningScreen() {
  const { dispatch } = useAppState();
  const [isbn, setIsbn] = useState<string | null>(null); // TODO: remove this (duplicate with scannedIsbns[-1])
  const [scannedIsbns, setScannedIsbns] = useState<string[]>([]);
  const [selectedShelfAction, setSelectedShelfAction] =
    useState<ShelfAction | null>(null);

  if (!isbn) {
    return (
      <ScanningView
        onScanComplete={(scannedIsbn: string) => {
          setIsbn(scannedIsbn);
          setScannedIsbns((prev) => [...prev, scannedIsbn]);
        }}
      />
    );
  }

  if (!selectedShelfAction) {
    return (
      <ScanningResults
        isbn={isbn}
        onActionSelected={(action: ShelfAction) => {
          setSelectedShelfAction(action);
        }}
        onCancel={() => {
          setIsbn(null);
          setSelectedShelfAction(null);
        }}
        onWrongBook={() => {
          // TODO
          alert("TODO");
        }}
        onScanMore={() => {
          // TODO
          alert("TODO");
        }}
      />
    );
  }

  return (
    <ShelfActionView
      action={selectedShelfAction}
      onCancel={() => {
        setIsbn(null);
        setSelectedShelfAction(null);
        dispatch({ type: "RESET_PRESELECTED_SHELF_ACTION" });
      }}
      onRestart={() => {
        setIsbn(null);
        setSelectedShelfAction(null);
      }}
    />
  );
}
