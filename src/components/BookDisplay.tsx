type Book = { title: string; author: string };
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
  return (
    <div>
      <p>
        ISBN: <strong>{isbn}</strong>
      </p>
      <h2>{book.title}</h2>
      <p>by {book.author}</p>
      <button onClick={onRescan} style={{ marginTop: "1rem" }}>
        Scan Another
      </button>
    </div>
  );
}
