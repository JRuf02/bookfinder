import { useState } from "react";
import Scanner from "./components/Scanner";
import ISBNInput from "./components/ISBNInput";
import BookDisplay from "./components/BookDisplay";
import { fetchBookData } from "./services/fetchBookData";

function App() {
  const [isbn, setIsbn] = useState<string>("");
  const [inputIsbn, setInputIsbn] = useState<string>("");
  const [book, setBook] = useState<{ title: string; author: string } | null>(
    null
  );
  const [scanning, setScanning] = useState(true);

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
    setScanning(true);
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

      {book && <BookDisplay book={book} isbn={isbn} onRescan={handleRescan} />}
    </div>
  );
}

export default App;
