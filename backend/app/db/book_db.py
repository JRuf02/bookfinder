from app.db.database import db_cursor
from app.models.book import Book
from app.models.identifiers import Isbn

ISBN_10_LENGTH = 10


def get_book_from_database(isbn: Isbn) -> Book | None:
    """Fetch book data from the local SQLite database using the ISBN."""

    with db_cursor() as c:
        c.execute(
            "SELECT isbn, title, author, dnb_id, cover_url FROM books WHERE isbn = ?",
            (str(isbn),),
        )
        row = c.fetchone()
    if row:
        isbn: Isbn | None = Isbn.parse(str(row[0]))
        assert isbn is not None, f"Failed to parse ISBN from database: {row[0]}"

        return Book(
            isbn=isbn,
            title=row[1],
            author=row[2],
            dnb_id=row[3],
            cover_url=row[4],
        )
    return None


def save_book_to_db(book: Book) -> None:
    """Save book data to the local SQLite database."""
    # TODO? Use function from shelf_db.py to normalize ISBNS?
    with db_cursor() as c:
        c.execute(
            """
            INSERT OR REPLACE INTO books (isbn, title, author, dnb_id,
            cover_url)
            VALUES (?, ?, ?, ?, ?)
        """,
            (
                str(book.isbn),
                book.title,
                book.author,
                book.dnb_id,
                book.cover_url,
            ),
        )  # TODO test what happens if coverUrl = None
