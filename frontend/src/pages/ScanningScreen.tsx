import { useState } from "react";
import ScanningResults from "../components/ScanningResults";
import ScanningView from "../components/ScanningView";
import ShelfActionView from "../components/ShelfActionView";
import { useAppState } from "../state/AppStateProvider";
import { ShelfAction } from "../types/ShelfAction";
import { Book } from "../types/Book";

export default function ScanningScreen() {
  const { dispatch } = useAppState();
  const [scannedIsbns, setScannedIsbns] = useState<string[]>([]); // ISBNs that will be inserted/removed, in scanned order
  const [queuedBooks, setQueuedBooks] = useState<Book[]>([]); // Book data for all scanned ISBNs to be inserted/removed
  const [selectedShelfAction, setSelectedShelfAction] =
    useState<ShelfAction | null>(null);
  const [scanning, setScanning] = useState(true);

  if (scanning) {
    return (
      <ScanningView
        onScanComplete={(scannedIsbn: string) => {
          setScannedIsbns((prev) => [...prev, scannedIsbn]);
          setScanning(false);
        }}
      />
    );
  }

  if (!selectedShelfAction) {
    return (
      <ScanningResults
        scannedIsbns={scannedIsbns}
        queuedBooks={queuedBooks}
        onActionSelected={(action: ShelfAction) => {
          setSelectedShelfAction(action);
        }}
        onBookFound={(book: Book) => {
          setQueuedBooks((prev) => [...prev, book]);
        }}
        onCancel={() => {
          // TODO: Add popup asking for confirmation
          setScannedIsbns([]);
          setQueuedBooks([]);
          setSelectedShelfAction(null);
          setScanning(true);
        }}
        onWrongBook={() => {
          // TODO: add popup with options tryAgain, ManualAdd, Cancel
          alert("TODO");
          setQueuedBooks((prev) =>
            prev.length > 0 ? prev.slice(0, -1) : prev,
          );
          setScannedIsbns((prev) =>
            prev.length > 0 ? prev.slice(0, -1) : prev,
          );
          setScanning(true);
        }}
        onScanMore={() => {
          setScanning(true);
        }}
      />
    );
  }

  return (
    <ShelfActionView
      action={selectedShelfAction}
      onCancel={() => {
        // TODO: Add popup asking for confirmation
        setScannedIsbns([]);
        setQueuedBooks([]);
        setSelectedShelfAction(null);
        dispatch({ type: "RESET_PRESELECTED_SHELF_ACTION" });
        setScanning(true);
      }}
      onRestart={() => {
        setScannedIsbns([]);
        setQueuedBooks([]);
        setSelectedShelfAction(null);
        dispatch({ type: "RESET_PRESELECTED_SHELF_ACTION" });
        setScanning(true);
      }}
    />
  );
}
