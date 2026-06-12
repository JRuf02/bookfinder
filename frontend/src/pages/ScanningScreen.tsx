import { useState } from "react";
import ScanningResults from "../components/ScanningResults";
import ScanningView from "../components/ScanningView";
import ShelfActionView from "../components/ShelfActionView";
import { useAppState } from "../state/AppStateProvider";
import { ShelfAction } from "../types/ShelfAction";
import { Book } from "../types/Book";
import ManualInsertDialog from "../components/dialogs/ManualInsertDialog";

export default function ScanningScreen() {
  const { dispatch } = useAppState();
  const [scannedIsbns, setScannedIsbns] = useState<string[]>([]); // ISBNs that will be inserted/removed, in scanned order
  const [queuedBooks, setQueuedBooks] = useState<Book[]>([]); // Book data for all scanned ISBNs to be inserted/removed
  const [selectedShelfAction, setSelectedShelfAction] =
    useState<ShelfAction | null>(null);
  const [scanning, setScanning] = useState(true);
  const [manualInsertDialogOpen, setManualInsertDialogOpen] = useState(false);

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
      <div>
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
          onTryAgain={() => {
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
          onManuallyAdd={() => {
            setManualInsertDialogOpen(true);
          }}
          onDontAdd={() => {
            setQueuedBooks((prev) =>
              prev.length > 0 ? prev.slice(0, -1) : prev,
            );
            setScannedIsbns((prev) =>
              prev.length > 0 ? prev.slice(0, -1) : prev,
            );
          }}
        />
        <ManualInsertDialog
          open={manualInsertDialogOpen}
          onClose={() => setManualInsertDialogOpen(false)}
          onSubmit={(book: Book) => {
            // TODO: Send book data to backend, check if ISBN valid and handle response
            // TODO: Only insert into db if ISBN not yet in there, otherwise just add the existing book to the list of scanned books
            // TODO: Actually implement a backend endpoint that also handles title and author (currently the backend only accepts ISBN and tries to fetch the rest of the data itself)
            alert(
              "TODO: Send book data to backend, check if ISBN valid and handle response",
            );
            setQueuedBooks((prev) => [...prev, book]);
            setScannedIsbns((prev) => [...prev, book.isbn]);
            setManualInsertDialogOpen(false);
          }}
        />
      </div>
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
