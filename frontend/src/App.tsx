import { useState } from "react";
import Scanner from "./components/Scanner";
import ISBNInput from "./components/ISBNInput";
import BookDisplay from "./components/BookDisplay";
import { fetchBookData } from "./services/fetchBookData";

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

  // States for shelf actions
  const [shelfAction, setShelfAction] = useState<ShelfAction>(null);
  const [osmId, setOsmId] = useState<string>("");
  const [actionResult, setActionResult] = useState<string | null>(null);

  // Callback when Scanner finds a result
  const handleScanResult = async (scannedIsbn: string) => {
    setIsbn(scannedIsbn);
    setScanning(false);
    const bookData = await fetchBookData(scannedIsbn);
    setBook(bookData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputIsbn(e.target.value);
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsbn(inputIsbn);
    setScanning(false);
    const bookData = await fetchBookData(inputIsbn);
    setBook(bookData);
  };

  const handleRescan = () => {
    setBook(null);
    setIsbn("");
    setInputIsbn("");
    setOsmId("");
    setShelfAction(null);
    setActionResult(null);
    setScanning(true);
  };

  // Handle shelf action (insert/remove)
  const handleShelfAction = (action: ShelfAction) => {
    setShelfAction(action);
    setOsmId("");
    setActionResult(null);
  };

  // Send POST to /api/shelf/insert or /api/shelf/remove
  const handleShelfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!osmId || !isbn) return;
    // TODO: Error handling for removing nonexisting entry!
    const url =
      shelfAction === "insert" ? "/api/shelf/insert" : "/api/shelf/remove";
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ osm_id: osmId, isbn }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setActionResult(`${data.message || "Action successful!"}`);
      } else {
        setActionResult(`${data.error || "Error performing action."}`);
      }
    } catch (err) {
      setActionResult("Network or server error.");
    }
    // After a short delay, return to scanning
    setTimeout(handleRescan, 2000);
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Scan ISBN Barcode</h1>

      {scanning && <Scanner onResult={handleScanResult} active={scanning} />}

      <ISBNInput
        value={inputIsbn}
        onChange={handleInputChange}
        onSubmit={handleInputSubmit}
      />

      {book && !shelfAction && (
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

      {shelfAction && (
        <form onSubmit={handleShelfSubmit} style={{ margin: "2rem 0" }}>
          <h3>
            {shelfAction === "insert"
              ? "Insert book into bookshelf"
              : "Remove book from bookshelf"}
          </h3>
          <input
            type="text"
            placeholder="Enter bookshelf OSM ID"
            value={osmId}
            onChange={(e) => setOsmId(e.target.value)}
            required
            style={{ fontSize: "1rem", padding: "0.5rem" }}
          />
          <button type="submit" style={{ marginLeft: "1rem" }}>
            Confirm
          </button>
          <button
            type="button"
            style={{ marginLeft: "1rem" }}
            onClick={() => setShelfAction(null)}
          >
            Cancel
          </button>
          {actionResult && (
            <div style={{ marginTop: "1rem", fontWeight: "bold" }}>
              {actionResult}
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default App;
