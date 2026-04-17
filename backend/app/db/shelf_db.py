# TODO: Move all api logic to app/routes/shelf.py
from flask import Request, jsonify
from flask.typing import ResponseReturnValue

from app.db.database import db_cursor
from app.models.identifiers import Isbn, OsmId
from app.models.shelf import Shelf


def insert_book_to_shelf_in_db(osm_id: OsmId, isbn: Isbn) -> None:
    # TODO: Add tests for this and the other functions!
    # TODO: Check if shelf exists, if not create it
    # TODO: Check if book has a books table entry, if not create it
    """Insert a book into a bookshelf (current_catalog)."""
    with db_cursor() as c:
        c.execute(
            """
            INSERT INTO current_catalog (osm_id, isbn)
            VALUES (?, ?)
        """,
            (str(osm_id), str(isbn)),
        )


def remove_book_from_shelf_in_db(osm_id: OsmId, isbn: Isbn) -> None:
    """Remove the oldest instance of a book from a bookshelf (current_catalog)."""
    # TODO: Add tests for this function!
    # TODO: Check if shelf, book and isbn exist
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
        if row:
            entry_id = row[0]
            c.execute("DELETE FROM current_catalog WHERE entry_id = ?", (entry_id,))


def get_books_in_shelf_from_db(req: Request) -> ResponseReturnValue:
    """Fetch list of all books in the given shelf."""
    osm_id = OsmId.parse(req.args.get("osm_id"))
    if not osm_id:
        return jsonify({"status": "error", "message": "osm_id is required"}), 400
    with db_cursor() as c:
        c.execute(
            """
            SELECT b.isbn, b.title, b.author, b.dnb_isbn, b.dnb_id, b.cover_url
            FROM current_catalog cc
            JOIN books b ON cc.isbn = b.isbn
            WHERE cc.osm_id = ?
            ORDER BY cc.time_of_entry DESC
        """,
            (str(osm_id),),
        )
        rows = c.fetchall()

    # TODO: Single function to convert db rows to list of Book objects
    books = [
        {
            "isbn": row[0],
            "title": row[1],
            "author": row[2],
            "dnb_isbn": row[3],
            "dnb_id": row[4],
            "cover_url": row[5],
        }
        for row in rows
    ]
    return jsonify(books)  # TODO: Use Book class before jsonify


def check_if_book_in_shelf(osm_id: OsmId, isbn: Isbn) -> bool:
    """Check if a book with the given ISBN is in the given shelf."""
    with db_cursor() as c:
        c.execute(
            """
            SELECT 1 FROM current_catalog
            WHERE osm_id = ? AND isbn = ?
            LIMIT 1
        """,
            (str(osm_id), str(isbn)),
        )
        return c.fetchone() is not None


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
        osm_id=row[0],
        name=row[1],
        latitude=row[2],
        longitude=row[3],
        address=row[4],
        type=row[5],
        operator=row[6],
        website=row[7],
        opening_hours=row[8],
        osm_check_date=row[9],
        osm_last_updated=row[10],
    )
