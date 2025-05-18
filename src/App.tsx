import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

async function fetchBookData(isbn: string) {
  const url = `https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query="${isbn}"&recordSchema=MARC21-xml&maximumRecords=1`;
  try {
    const response = await fetch(url);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    const title =
      xmlDoc.querySelector('datafield[tag="245"] > subfield[code="a"]')
        ?.textContent || "Unknown Title";
    const author =
      xmlDoc.querySelector('datafield[tag="100"] > subfield[code="a"]')
        ?.textContent || "Unknown Author";
    return { title, author };
  } catch (e) {
    return { title: "Error fetching data", author: "" };
  }
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isbn, setIsbn] = useState<string>("");
  const [inputIsbn, setInputIsbn] = useState<string>("");
  const [book, setBook] = useState<{ title: string; author: string } | null>(
    null
  );
  const [scanning, setScanning] = useState(true);

  // Handle barcode scanning
  useEffect(() => {
    if (!scanning) return;
    const codeReader = new BrowserMultiFormatReader();

    if (!videoRef.current) {
      console.error("Video element not found");
      return;
    }

    codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.current,
      async (result, err) => {
        if (result) {
          const scannedIsbn = result.getText();
          setIsbn(scannedIsbn);
          setInputIsbn(scannedIsbn);
          setScanning(false);
          const bookData = await fetchBookData(scannedIsbn);
          setBook(bookData);
        } else if (err) {
          // Optionally handle scan errors
        }
        codeReader.reset();
      }
    );

    return () => {};
  }, [scanning]);

  // Handle manual ISBN input
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
      {scanning && (
        <video
          ref={videoRef}
          width="400"
          height="300"
          style={{ border: "2px solid black" }}
        />
      )}
      <form onSubmit={handleInputSubmit} style={{ margin: "1rem 0" }}>
        <input
          type="text"
          placeholder="Enter ISBN manually"
          value={inputIsbn}
          onChange={handleInputChange}
          style={{ fontSize: "1rem", padding: "0.5rem" }}
        />
        <button type="submit" style={{ marginLeft: "0.5rem" }}>
          Lookup
        </button>
      </form>
      {isbn && (
        <p>
          ISBN: <strong>{isbn}</strong>
        </p>
      )}
      {book && (
        <div>
          <h2>{book.title}</h2>
          <p>by {book.author}</p>
          <button onClick={handleRescan} style={{ marginTop: "1rem" }}>
            Scan Another
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
