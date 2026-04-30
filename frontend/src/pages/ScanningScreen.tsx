import { useState } from "react";
import ScanningResults from "../components/ScanningResults";
import ScanningView from "../components/ScanningView";
import ShelfActionView from "../components/ShelfActionView";
import { Book } from "../types/Book";
import { useAppState } from "../state/AppStateProvider";

export default function ScanningScreen() {
  const { dispatch } = useAppState();
  const [isbn, setIsbn] = useState<string | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [selectedShelfAction, setSelectedShelfAction] = useState<
    "insert" | "remove" | null
  >(null);

  console.log("ScanningScreen state:", { isbn, book });

  if (!isbn) {
    return (
      <ScanningView
        onScanComplete={(scannedIsbn: string) => setIsbn(scannedIsbn)}
      />
    );
  } else if (isbn && !book) {
    console.log("Rendering ScanningResults with ISBN:", isbn);
    return (
      <ScanningResults
        isbn={isbn}
        onActionSelected={(book, action) => {
          setSelectedShelfAction(action);
          setBook(book);
        }}
        onRescan={() => {
          setIsbn(null);
          setBook(null);
        }}
      />
    );
  } else if (isbn && book && selectedShelfAction) {
    console.log("Rendering ShelfActionView with book:", book);
    return (
      <ShelfActionView
        book={book}
        action={selectedShelfAction}
        onCancel={() => {
          setIsbn(null);
          setBook(null);
          dispatch({ type: "RESET_PRESELECTED_SHELF_ACTION" });
        }}
        onRescan={() => {
          setIsbn(null);
          setBook(null);
        }}
      />
    );
  }
  // if state.isbn not set -> show ScanningScreen
  // else if state.isbn set -> show ScanningResults
  // else if state.book set -> show ShelfActionView
}
