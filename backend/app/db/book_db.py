import sqlite3
from pathlib import Path

from app.models.book import Book

DB_PATH = Path(__file__).parent / ".." / ".." / "books.db"
ISBN_10_LENGTH = 10


def get_book_from_database(isbn: str) -> Book | None:
    """Fetch book data from the local SQLite database using the ISBN."""
    if not isbn:
        return None

    # TODO: Use function from shelf_db.py to normalize ISBN
    # Normalize ISBN (remove spaces, dashes, and convert to uppercase)
    # TODO: move to util function + test
    isbn = isbn.replace(" ", "").replace("-", "").upper()
    # Remove any non-numeric characters (except for 'X' at the end of ISBN-10)
    isbn = "".join(
        filter(
            lambda x: (
                x.isdigit()
                or (x == "X" and len(isbn) == ISBN_10_LENGTH and isbn[-1] == "X")
            ),
            isbn,
        )
    )

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "SELECT isbn, title, author, dnb_isbn, dnb_id, cover_url "
        "FROM books "
        "WHERE isbn = ?",
        (isbn,),
    )
    row = c.fetchone()
    conn.close()
    if row:
        return Book(
            isbn=row[0],
            title=row[1],
            author=row[2],
            dnb_isbn=row[3],
            dnb_id=row[4],
            cover_url=row[5],
        )
    return None


def save_book_to_db(book: Book) -> None:
    """Save book data to the local SQLite database."""
    # TODO? Use function from shelf_db.py to normalize ISBNS?
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
        INSERT OR REPLACE INTO books (isbn, title, author, dnb_isbn, dnb_id, cover_url)
        VALUES (?, ?, ?, ?, ?, ?)
    """,
        (
            book.isbn,
            book.title,
            book.author,
            book.dnb_isbn,
            book.dnb_id,
            book.cover_url,
        ),
    )  # TODO test what happens if coverUrl = None
    conn.commit()
    conn.close()
