import sqlite3
import os
from book import Book


def init_db() -> None:
    """Initialize the SQLite database."""
    db_path = os.path.join(os.path.dirname(__file__), "books.db")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS books (
            isbn TEXT PRIMARY KEY,
            title TEXT,
            author TEXT,
            dnb_isbn TEXT,
            dnb_id TEXT,
            cover_url TEXT,
            time_of_entry DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS bookshelves (
            osm_id TEXT PRIMARY KEY,
            name TEXT,
            location TEXT,
            time_of_entry DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS current_catalog (
            entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
            osm_id TEXT,
            isbn TEXT,
            time_of_entry DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(osm_id) REFERENCES bookshelves(osm_id),
            FOREIGN KEY(isbn) REFERENCES books(isbn)
        )
    """)
    conn.commit()
    conn.close()

def get_book_from_database(isbn: str) -> Book | None:
    """Fetch book data from the local SQLite database using the ISBN."""
    if not isbn:
        return None
    
    # Normalize ISBN (remove spaces, dashes, and convert to uppercase)  TODO: move to util function + test
    isbn = isbn.replace(" ", "").replace("-", "").upper()
    # Remove any non-numeric characters (except for 'X' at the end of ISBN-10)
    isbn = ''.join(filter(lambda x: x.isdigit() or (x == 'X' and len(isbn) == 10 and isbn[-1] == 'X'), isbn))

    db_path = os.path.join(os.path.dirname(__file__), "books.db")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT isbn, title, author, dnb_isbn, dnb_id, cover_url FROM books WHERE isbn = ?", (isbn,))
    row = c.fetchone()
    conn.close()
    if row:
        return Book(
            isbn=row[0],
            title=row[1],
            author=row[2],
            dnbISBN=row[3],
            dnbId=row[4],
            coverUrl=row[5]
        )
    return None

def save_book_to_db(book: Book) -> None:
    """Save book data to the local SQLite database."""
    db_path = os.path.join(os.path.dirname(__file__), "books.db")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("""
        INSERT OR REPLACE INTO books (isbn, title, author, dnb_isbn, dnb_id, cover_url)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (book.isbn, book.title, book.author, book.dnbISBN, book.dnbId, book.coverUrl))  # TODO test what happens if coverUrl = None
    conn.commit()
    conn.close()

def insert_book_to_shelf(osm_id: str, isbn: str) -> None:
    """Insert a book into a bookshelf (current_catalog)."""
    db_path = os.path.join(os.path.dirname(__file__), "books.db")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("""
        INSERT INTO current_catalog (osm_id, isbn)
        VALUES (?, ?)
    """, (osm_id, isbn))
    conn.commit()
    conn.close()

def remove_book_from_shelf(osm_id: str, isbn: str) -> None:
    """Remove the oldest instance of a book from a bookshelf (current_catalog)."""
    db_path = os.path.join(os.path.dirname(__file__), "books.db")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    # Find the entry_id of the oldest matching entry
    c.execute("""
        SELECT entry_id FROM current_catalog
        WHERE osm_id = ? AND isbn = ?
        ORDER BY time_of_entry ASC, entry_id ASC
        LIMIT 1
    """, (osm_id, isbn))
    row = c.fetchone()
    if row:
        entry_id = row[0]
        c.execute("DELETE FROM current_catalog WHERE entry_id = ?", (entry_id,))
        conn.commit()
    conn.close()
