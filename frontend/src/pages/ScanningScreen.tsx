import { useState } from "react";
import ScanningResults from "../components/ScanningResults";
import ScanningView from "../components/ScanningView";
import ShelfActionView from "../components/ShelfActionView";
import { useAppState } from "../state/AppStateProvider";
import { ShelfAction } from "../types/ShelfAction";
import { Book } from "../types/Book";
import ManualInsertDialog from "../components/dialogs/ManualInsertDialog";
import { manuallyAddBook } from "../services/manualAdd";

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
            // TODO: move this logic into a separate function
            setScannedIsbns([]);
            setQueuedBooks([]);
            setSelectedShelfAction(null);
            setScanning(true);
          }}
          onTryAgain={() => {
            // TODO: move this logic into a separate function
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
            // TODO: move this logic into a separate function
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
          onSubmit={async (book: Book) => {
            // TODO: Move this logic into a separate function
            const manualAddResponse = await manuallyAddBook(
              book.isbn,
              book.title,
              book.author,
            );
            if (manualAddResponse.status === "error") {
              alert(`Something went wrong: ${manualAddResponse.message}`);
              return;
            }
            if (manualAddResponse.status === "warning") {
              alert(`${manualAddResponse.message}`);
            }
            const addedBook = manualAddResponse.data;
            setQueuedBooks((prev) => [...prev, addedBook]);
            setScannedIsbns((prev) => [...prev, addedBook.isbn]);
            alert(
              `Book "${addedBook.title}" by ${addedBook.author} added successfully!`,
            );
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
        // TODO: move this logic into a separate function
        setScannedIsbns([]);
        setQueuedBooks([]);
        setSelectedShelfAction(null);
        dispatch({ type: "RESET_PRESELECTED_SHELF_ACTION" });
        setScanning(true);
      }}
      onRestart={() => {
        // TODO: move this logic into a separate function
        setScannedIsbns([]);
        setQueuedBooks([]);
        setSelectedShelfAction(null);
        dispatch({ type: "RESET_PRESELECTED_SHELF_ACTION" });
        setScanning(true);
      }}
    />
  );
}
