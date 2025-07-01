import { useState, useEffect } from "react";
import styles from "../styles/BookDisplay.module.css";

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
    // Use my server endpoint instead of DNB directly
    const host = window.location.hostname;
    setCoverUrl(`http://${host}:5000/api/covers?isbn=${book.dnbISBN}&size=l`);
    setImageError(false);
  }, [book.dnbISBN]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div>
      <p>
        ISBN: <strong>{isbn}</strong>
      </p>
      <p>
        ISBN (DNB format): <strong>{book.dnbISBN}</strong>
      </p>
      <h2>{book.title}</h2>
      <p>by {book.author}</p>

      {!imageError && coverUrl && (
        <div>
          <img
            src={coverUrl}
            alt={`Cover of ${book.title}`}
            className={styles.bookCover}
            onError={handleImageError}
          />
        </div>
      )}

      {imageError && (
        <div className={styles.imageError}>
          <p>Cover image not available</p>
        </div>
      )}

      <button onClick={onRescan} className={styles.rescanButton}>
        Scan Another
      </button>
    </div>
  );
}
