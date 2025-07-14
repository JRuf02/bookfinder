import sqlite3
import os
from book import Book


def get_book_from_database(isbn: str) -> Book | None:
    """Fetch book data from the local SQLite database using the ISBN."""
    if not isbn:
        return None
    
    # TODO: Use function from shelf_db.py to normalize ISBN
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
    # TODO? Use function from shelf_db.py to normalize ISBNS?
    db_path = os.path.join(os.path.dirname(__file__), "books.db")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("""
        INSERT OR REPLACE INTO books (isbn, title, author, dnb_isbn, dnb_id, cover_url)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (book.isbn, book.title, book.author, book.dnbISBN, book.dnbId, book.coverUrl))  # TODO test what happens if coverUrl = None
    conn.commit()
    conn.close()