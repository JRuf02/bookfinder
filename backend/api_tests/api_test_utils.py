from flask import Flask

from app.db.database import db_cursor
from app.db.database_fuzzy_utils import add_author_name, add_book_title
from app.models.book import Book
from app.models.identifiers import Isbn


def insert_test_shelf_into_db(
    app: Flask,
    lat: float = 48.0998168,
    lon: float = 8.0546482,
    osm_id: str = "https://www.openstreetmap.org/node/11935877522",
) -> None:
    with db_cursor(app.config["DB_PATH"]) as c:
        c.execute(
            """
            INSERT OR REPLACE INTO bookshelves (
                osm_id, name, latitude, longitude, address, type, operator,
                website, opening_hours, osm_check_date, osm_last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                osm_id,
                "test shelf",
                lat,
                lon,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ),
        )


def insert_test_book_into_shelf_in_db(
    app: Flask,
    book: Book | None = None,
    osm_id: str = "https://www.openstreetmap.org/node/11935877522",
) -> None:
    """Insert a test book into the given shelf in the database.

    If no book is given, a default example book will be inserted.
    Adds the book to the books table and creates an entry in the current_catalog
    table showing the book in the given shelf.
    Also creates entries for the book in the author and title token tables and
    in the threegram table for fuzzy catalog search.

    Does NOT add the shelf to the bookshelves table.
    Call insert_test_shelf_into_db first, if needed.
    Shelf must exist in the bookshelves table before calling this function, otherwise
    the foreign key constraint will fail, the book will not be added to the shelf and
    an IntegrityError will be raised.
    """

    # Create default example book to insert if no book is specified
    if book is None:
        book = Book(
            # Use Isbn.parse("978-3-453-43690-9") to create Isbn objects in production!
            isbn=Isbn("978-3-453-43690-9"),  # For testing, we skip validation here
            title="Sprengstoff",
            author="King, Stephen",
            dnb_id="1028147899",
            cover_url="https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
        )

    # Create an entry for the book in the books table
    with db_cursor(app.config["DB_PATH"]) as c:
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
        )

    # Generate threegrams and tokens for fast fuzzy search
    if book.author:
        add_author_name(
            name=book.author, isbn=str(book.isbn), db_path=app.config["DB_PATH"]
        )
    if book.title:
        add_book_title(
            title=book.title, isbn=str(book.isbn), db_path=app.config["DB_PATH"]
        )

    # Insert the book into the shelf
    with db_cursor(app.config["DB_PATH"]) as c:
        c.execute(
            """
            INSERT INTO current_catalog (osm_id, isbn)
            VALUES (?, ?)
            """,
            (str(osm_id), str(book.isbn)),
        )


def insert_test_book_into_books_table_in_db(
    app: Flask,
    book: Book | None = None,
) -> None:
    """Insert a test book into the books table in the database.

    If no book is given, a default example book will be inserted.
    Adds the book only to the books table (for metadata), not to the catalog.
    Also generates and stores fuzzysearch tokens and threegrams for the book.
    """

    if book is None:
        book = Book(
            # Use Isbn.parse("978-3-453-43690-9") to create Isbn objects in production!
            isbn=Isbn("978-3-453-43690-9"),  # For testing, we skip validation here
            title="Sprengstoff",
            author="King, Stephen",
            dnb_id="1028147899",
            cover_url="https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
        )

    with db_cursor(app.config["DB_PATH"]) as c:
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
        )

    # Generate threegrams and tokens for fast fuzzy search
    if book.author:
        add_author_name(
            name=book.author, isbn=str(book.isbn), db_path=app.config["DB_PATH"]
        )
    if book.title:
        add_book_title(
            title=book.title, isbn=str(book.isbn), db_path=app.config["DB_PATH"]
        )


def get_number_of_entries_in_table_current_catalog(app: Flask) -> int:
    """Get the number of entries in the current_catalog table of the database."""
    with db_cursor(app.config["DB_PATH"]) as c:
        c.execute("SELECT COUNT(*) FROM current_catalog")
        row = c.fetchone()
        return row[0] if row else 0


def get_number_of_books_in_table_books(app: Flask) -> int:
    """Get the number of entries in the books table of the database."""
    with db_cursor(app.config["DB_PATH"]) as c:
        c.execute("SELECT COUNT(*) FROM books")
        row = c.fetchone()
        return row[0] if row else 0


def get_number_of_shelves_in_table_bookshelves(app: Flask) -> int:
    """Get the number of entries in the bookshelves table of the database."""
    with db_cursor(app.config["DB_PATH"]) as c:
        c.execute("SELECT COUNT(*) FROM bookshelves")
        row = c.fetchone()
        return row[0] if row else 0


def get_time_of_entry_of_book_in_shelf(app: Flask, osm_id: str, isbn: str) -> list[str]:
    """Get the time_of_entry of all books with the given isbn in the given shelf,
    from the current_catalog table.

    Returns a list of time_of_entry because an isbn can be in a shelf multiple times.
    Returns the list sorted from oldest to newest entry.
    Warning: Does not parse and validate osm_id and isbn.
    Sufficient for testing purposes. Do not use this function in production code!
    In production code, always use OsmId and Isbn objects to ensure validity!
    """
    with db_cursor(app.config["DB_PATH"]) as c:
        c.execute(
            """
            SELECT time_of_entry FROM current_catalog
            WHERE osm_id = ? AND isbn = ?
            ORDER BY time_of_entry ASC
        """,
            (osm_id, isbn),
        )
        row = c.fetchall()
        return [r[0] for r in row] if row else []
