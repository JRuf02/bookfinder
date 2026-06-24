import { useState } from "react";

import ErrorDialog from "../components/dialogs/ErrorDialog";
import ManualInsertDialog from "../components/dialogs/ManualInsertDialog";
import ScanningResults from "../components/scanning/ScanningResults";
import ScanningView from "../components/scanning/ScanningView";
import ShelfActionView from "../components/shelfactions/ShelfActionView";
import { manuallyAddBook } from "../services/api/manualAdd";
import { useAppState } from "../state/AppStateProvider";
import { Book } from "../types/Book";
import { ShelfAction } from "../types/ShelfAction";

type ScanningError = {
  title: string;
  text: string;
};

/*
This component manages the entire scanning and book insert/remove flow:

  1. Scan the book's barcode (to get the ISBN) and fetch the book's metadata from the backend
  2. Show the retrieved data and ask the user whether to insert or remove, retry scanning or add the book manually
     2a. Go back to step 1 if the user wants to retry scanning or add more books
  3. Show a summary of what will be done (which books will be inserted/removed and to which shelf) and do it if the user confirms
*/
export default function ScanningScreen() {
  const { dispatch } = useAppState();
  const [scannedIsbns, setScannedIsbns] = useState<string[]>([]); // ISBNs that will be inserted/removed, in scanned order
  const [queuedBooks, setQueuedBooks] = useState<Book[]>([]); // Book data for all scanned ISBNs to be inserted/removed
  const [selectedShelfAction, setSelectedShelfAction] =
    useState<ShelfAction | null>(null);
  const [scanning, setScanning] = useState(true);
  const [manualInsertDialogOpen, setManualInsertDialogOpen] = useState(false);
  const [scanningError, setScanningError] = useState<ScanningError | null>(
    null,
  );

  const onBookFound = (book: Book) => {
    setQueuedBooks((prev) => [...prev, book]);
  };

  const onCancel = () => {
    setScannedIsbns([]);
    setQueuedBooks([]);
    setSelectedShelfAction(null);
    dispatch({ type: "RESET_PRESELECTED_SHELF_ACTION" });
    setScanning(true);
  };

  const onTryAgain = () => {
    setQueuedBooks((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    setScannedIsbns((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    setScanning(true);
  };

  const onDontAdd = () => {
    setQueuedBooks((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    setScannedIsbns((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  const onScanMore = () => {
    setScanning(true);
  };

  const onSubmitManuallyAddData = async (book: Book) => {
    const manualAddResponse = await manuallyAddBook(
      book.isbn,
      book.title,
      book.author,
    );
    if (manualAddResponse.status === "error") {
      setScanningError({
        title: "Something went wrong",
        text: `${manualAddResponse.message}`,
      });
      return;
    }
    if (manualAddResponse.status === "warning") {
      setScanningError({
        title: "Conflict detected",
        text: `${manualAddResponse.message}`,
      });
    }
    const addedBook = manualAddResponse.data;
    setQueuedBooks((prev) => [...prev, addedBook]);
    setScannedIsbns((prev) => [...prev, addedBook.isbn]);

    setManualInsertDialogOpen(false);
  };

  // Three steps:
  // 1. scan book
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

  // 2. verify the scanned book and select an action, retry or scan more
  if (!selectedShelfAction) {
    return (
      <div>
        <ScanningResults
          scannedIsbns={scannedIsbns}
          queuedBooks={queuedBooks}
          onActionSelected={(action: ShelfAction) => {
            setSelectedShelfAction(action);
          }}
          onBookFound={onBookFound}
          onCancel={onCancel}
          onTryAgain={onTryAgain}
          onScanMore={onScanMore}
          onManuallyAdd={() => {
            setManualInsertDialogOpen(true);
          }}
          onDontAdd={onDontAdd}
        />
        <ManualInsertDialog
          open={manualInsertDialogOpen}
          onClose={() => setManualInsertDialogOpen(false)}
          onSubmit={onSubmitManuallyAddData}
        />
        <ErrorDialog
          open={!!scanningError}
          title={scanningError?.title ?? ""}
          text={scanningError?.text ?? ""}
          onClose={() => setScanningError(null)}
        />
      </div>
    );
  }

  // 3. show summary of what will be done, execute the action or cancel the process, show result
  return (
    <ShelfActionView
      action={selectedShelfAction}
      onCancel={onCancel}
      onRestart={onCancel}
    />
  );
}
