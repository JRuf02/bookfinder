import { useState } from "react";
import Scanner from "./components/Scanner";
import ISBNInput from "./components/ISBNInput";
import BookDisplay from "./components/BookDisplay";
import ShelfActionDialog from "./components/ShelfActionDialog";
import ActionResultDialog from "./components/ActionResultDialog";
import { fetchBookData } from "./services/fetchBookData";
import { shelfAction } from "./services/shelfActions";

type ShelfAction = "insert" | "remove" | null;

function App() {
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

  // Callback when Scanner finds a result
  const handleScanResult = async (scannedIsbn: string) => {
    setIsbn(scannedIsbn);
    setScanning(false);
    setBook(await fetchBookData(scannedIsbn));
  };

  // Callback when ISBN input is submitted manually
  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // prevents page reload
    setIsbn(inputIsbn);
    setScanning(false);
    setBook(await fetchBookData(inputIsbn));
  };

  const handleRescan = () => {
    setBook(null);
    setIsbn("");
    setInputIsbn("");
    setShelfActionType(null);
    setActionResult(null);
    setScanning(true);
  };

  // Remove or insert book dialog
  const handleShelfAction = (action: ShelfAction) => setShelfActionType(action);

  // Handle shelf insert/remove
  const handleShelfSubmit = async (osmId: string) => {
    if (!osmId || !isbn || !shelfActionType) return;
    const result = await shelfAction(shelfActionType, osmId, isbn);
    setActionResult(result.message);
    setShelfActionType(null);
    setTimeout(handleRescan, 2000);
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Scan ISBN Barcode</h1>
      {scanning && <Scanner onResult={handleScanResult} active={scanning} />}
      <ISBNInput
        value={inputIsbn}
        onChange={(e) => setInputIsbn(e.target.value)}
        onSubmit={handleInputSubmit}
      />
      {book && !shelfActionType && !actionResult && (
        <div>
          <BookDisplay book={book} isbn={isbn} onRescan={handleRescan} />
          <div style={{ margin: "1rem 0" }}>
            <button
              onClick={() => handleShelfAction("insert")}
              style={{ marginRight: "1rem" }}
            >
              Insert into bookshelf
            </button>
            <button
              onClick={() => handleShelfAction("remove")}
              style={{ marginRight: "1rem" }}
            >
              Remove from bookshelf
            </button>
            <button onClick={handleRescan}>Rescan</button>
          </div>
        </div>
      )}
      {shelfActionType && (
        <ShelfActionDialog
          action={shelfActionType}
          onSubmit={handleShelfSubmit}
          onCancel={() => setShelfActionType(null)}
        />
      )}
      {actionResult && <ActionResultDialog message={actionResult} />}
    </div>
  );
}

export default App;
