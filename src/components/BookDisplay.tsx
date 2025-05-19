import { useState, useEffect } from "react";

type Book = { title: string; author: string; dnbISBN: string; dnbId: string };
type BookDisplayProps = {
  book: Book;
  isbn: string;
  onRescan: () => void;
};

export default function BookDisplay({
  book,
  isbn,
  onRescan,
}: BookDisplayProps) {
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Construct cover URL using the formatted ISBN
    setCoverUrl(
      `https://portal.dnb.de/opac/mvb/cover?isbn=${book.dnbISBN}&size=l`
    );
    setImageError(false);
  }, [isbn]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div>
      <p>
        ISBN: <strong>{isbn}</strong>
      </p>
      <h2>{book.title}</h2>
      <p>by {book.author}</p>

      {!imageError && coverUrl && (
        <div style={{ margin: "1rem 0" }}>
          <img
            src={coverUrl}
            alt={`Cover of ${book.title}`}
            style={{
              maxWidth: "200px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "5px",
            }}
            onError={handleImageError}
          />
        </div>
      )}

      {imageError && (
        <div style={{ margin: "1rem 0" }}>
          <p style={{ fontStyle: "italic", color: "#666" }}>
            Cover image not available
          </p>
        </div>
      )}

      <button onClick={onRescan} style={{ marginTop: "1rem" }}>
        Scan Another
      </button>
    </div>
  );
}
