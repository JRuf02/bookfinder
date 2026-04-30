# TODO: Move all api logic to app/routes/shelf.py
import logging

from app.db.database import db_cursor
from app.db.database_utils import check_if_shelf_exists
from app.models.book import Book
from app.models.errors import DatabaseQueryError
from app.models.identifiers import Isbn, OsmId
from app.models.shelf import Shelf

logger = logging.getLogger(__name__)


def insert_book_to_shelf_in_db(osm_id: OsmId, isbn: Isbn) -> None:
    """Insert a book into a bookshelf (current_catalog)."""

    with db_cursor() as c:
        c.execute(
            """
            INSERT INTO current_catalog (osm_id, isbn)
            VALUES (?, ?)
        """,
            (str(osm_id), str(isbn)),
        )


def remove_book_from_shelf_in_db(
    osm_id: OsmId, isbn: Isbn
) -> DatabaseQueryError | None:
    """Remove the oldest instance of a book from a bookshelf (current_catalog).
    Return None if the book was removed successfully, or a DatabaseQueryError otherwise.
    """

    with db_cursor() as c:
        # Find the entry_id of the oldest matching entry
        c.execute(
            """
            SELECT entry_id FROM current_catalog
            WHERE osm_id = ? AND isbn = ?
            ORDER BY time_of_entry ASC, entry_id ASC
            LIMIT 1
        """,
            (str(osm_id), str(isbn)),
        )

        row = c.fetchone()

        if not row:
            if not check_if_shelf_exists(osm_id):
                return DatabaseQueryError(
                    message=f"Shelf with OSM ID {osm_id} does not exist."
                )
            return DatabaseQueryError(
                message=f"Book with ISBN {isbn} not found in shelf {osm_id}."
            )

        entry_id = row[0]
        c.execute("DELETE FROM current_catalog WHERE entry_id = ?", (entry_id,))

        if c.rowcount != 1:
            logger.error(f"Expected to delete 1 row, but deleted {c.rowcount} rows.")
            return DatabaseQueryError(message="Error removing book from shelf.")

        return None


def get_books_in_shelf_from_db(osm_id: OsmId) -> list[Book]:
    """Fetch list of all books in the given shelf."""

    with db_cursor() as c:
        c.execute(
            """
            SELECT b.isbn, b.title, b.author, b.dnb_id, b.cover_url
            FROM current_catalog cc
            JOIN books b ON cc.isbn = b.isbn
            WHERE cc.osm_id = ?
            ORDER BY cc.time_of_entry DESC
        """,
            (str(osm_id),),
        )
        rows = c.fetchall()

    books = []
    for row in rows:
        isbn = Isbn.parse(row[0])

        if not isbn:
            logger.warning(
                f"Invalid ISBN {row[0]} in database for shelf {osm_id}. Skipping entry."
            )
            continue

        books.append(
            Book(
                isbn=isbn,
                title=row[1],
                author=row[2],
                dnb_id=row[3],
                cover_url=row[4],
            )
        )

    return books


def get_shelf_metadata_from_db(osm_id: OsmId) -> Shelf | None:
    """Fetch metadata of the given shelf."""

    with db_cursor() as c:
        c.execute(
            """
            SELECT osm_id, name, latitude, longitude, address, type, operator, website,
                opening_hours, osm_check_date, osm_last_updated
            FROM bookshelves WHERE osm_id = ?
        """,
            (str(osm_id),),
        )
        row = c.fetchone()

    if not row:
        return None

    return Shelf(
        osm_id=osm_id,
        name=row["name"],
        latitude=float(row["latitude"]),
        longitude=float(row["longitude"]),
        address=row["address"],
        type=row["type"],
        operator=row["operator"],
        website=row["website"],
        opening_hours=row["opening_hours"],
        osm_check_date=row["osm_check_date"],
        osm_last_updated=row["osm_last_updated"],
    )
