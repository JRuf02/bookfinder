import { useState } from "react";
import ScanningResults from "../components/ScanningResults";
import ScanningView from "../components/ScanningView";
import ShelfActionView from "../components/ShelfActionView";
import { useAppState } from "../state/AppStateProvider";
import { ShelfAction } from "../types/ShelfAction";
import { Book } from "../types/Book";
import ManualInsertDialog from "../components/dialogs/ManualInsertDialog";
import { manuallyAddBook } from "../services/manualAdd";

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
