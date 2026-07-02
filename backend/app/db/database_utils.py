from app.db.database import db_cursor
from app.models.book import Book
from app.models.identifiers import Isbn, OsmId


def check_if_shelf_exists(osm_id: OsmId) -> bool:
    """Check if a shelf with the given osm_id exists
    in the bookshelves table of the database.
    """
    with db_cursor() as c:
        c.execute(
            "SELECT 1 FROM bookshelves WHERE osm_id = ? LIMIT 1",
            (str(osm_id),),
        )
        return c.fetchone() is not None


def book_already_in_database(book: Book) -> bool:
    """Check if a book with exactly the given metadata exists
    in the 'books' table of the database.
    """
    with db_cursor() as c:
        c.execute(
            """
            SELECT 1 FROM books
            WHERE isbn = ? AND title = ? AND author = ? AND dnb_id = ? AND cover_url = ?
            LIMIT 1
        """,
            (
                str(book.isbn),
                book.title,
                book.author,
                book.dnb_id,
                book.cover_url,
            ),
        )
        return c.fetchone() is not None


def isbn_already_in_database(isbn: Isbn) -> bool:
    """Check if a book with the given ISBN exists in the 'books' table
    of the database.
    """
    with db_cursor() as c:
        c.execute(
            "SELECT 1 FROM books WHERE isbn = ? LIMIT 1",
            (str(isbn),),
        )
        return c.fetchone() is not None
