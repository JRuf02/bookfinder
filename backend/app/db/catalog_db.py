# TODO: Move all api logic to app/routes/catalog.py
import logging

from app.db.database import db_cursor
from app.models.book import Book
from app.models.coordinates import GeoCoordinateError, GeoCoordinates
from app.models.identifiers import Isbn, OsmId
from app.models.shelf import LocatedShelf, Shelf
from app.utils.geo_utils import haversine

logger = logging.getLogger(__name__)


def search_in_catalog_db(
    title: str | None = None,
    author: str | None = None,
    user_coordinates: GeoCoordinates | None = None,
) -> list[dict[str, Book | LocatedShelf]]:
    """Search for books by title and / or author and return entries
    with shelf info and distance.

    If user coordinates are None, distance will be returned as None.
    """

    # TODO: remove commas and other special characters from title and author

    # TODO: author.split(" ") and then WHERE author LIKE a AND author LIKE b
    #       (Search for "Stephen King" should find "King, Stephen" and
    #       "Stephen Edwin King", but not "Stephen Spielberg")
    # TODO: Add fuzzy search after db query?

    # TODO: Ensure that authors like Rowling, J.K. are handeled correctly

    with db_cursor() as c:
        c.execute(
            """
            SELECT cc.osm_id, cc.isbn,
            b.title, b.author, b.dnb_id, b.cover_url,
            bs.latitude AS shelf_latitude,
            bs.longitude AS shelf_longitude,
            bs.name AS shelf_name,
            bs.type AS shelf_type,
            bs.address, bs.opening_hours, bs.operator, bs.website,
            bs.osm_check_date, bs.osm_last_updated
            FROM current_catalog cc
            JOIN books b ON cc.isbn = b.isbn
            JOIN bookshelves bs ON cc.osm_id = bs.osm_id
            WHERE (? IS NULL OR b.title LIKE ?)
            AND (? IS NULL OR b.author LIKE ?)
        """,  # TODO: LIMIT and OFFSET for pagination?
            (title, f"%{title}%", author, f"%{author}%"),
        )
        rows = c.fetchall()

    results = []

    for row in rows:
        shelf_coordinates = GeoCoordinates.parse(
            raw_latitude=row["shelf_latitude"], raw_longitude=row["shelf_longitude"]
        )

        if shelf_coordinates is None or isinstance(
            shelf_coordinates, GeoCoordinateError
        ):
            # Don't include results without coordinates
            logger.warning(
                f"Invalid shelf coordinates for shelf with OSM id {row['osm_id']}."
            )
            continue

        if user_coordinates is not None:
            dist_m = haversine(
                user_coordinates.longitude,
                user_coordinates.latitude,
                shelf_coordinates.longitude,
                shelf_coordinates.latitude,
            )  # TODO: Use GeoCoordinates in the haversine function
        else:
            dist_m = None

        isbn = Isbn.parse(row["isbn"])
        if isbn is None:
            logger.warning(f"Invalid ISBN in database: {row['isbn']}")
            continue  # Skip invalid ISBNs in the database

        osm_id = OsmId.parse(row["osm_id"])
        if osm_id is None:
            logger.warning(f"Missing osm_id for shelf of book with ISBN {isbn}")
            continue  # Skip entries without osm_id

        results.append(
            {
                "book": Book(
                    isbn=isbn,
                    title=row["title"],
                    author=row["author"],
                    dnb_id=row["dnb_id"],
                    cover_url=row["cover_url"],
                ),
                "located_shelf": LocatedShelf(
                    shelf=Shelf(
                        osm_id=osm_id,
                        name=row["shelf_name"],
                        latitude=shelf_coordinates.latitude,
                        longitude=shelf_coordinates.longitude,
                        address=row["address"],
                        type=row["shelf_type"],
                        operator=row["operator"],
                        website=row["website"],
                        opening_hours=row["opening_hours"],
                        osm_check_date=row["osm_check_date"],
                        osm_last_updated=row["osm_last_updated"],
                    ),
                    distance_meters=dist_m,
                ),
            }
        )

    if user_coordinates is not None:
        results.sort(key=lambda x: x["located_shelf"].distance_meters)

    return results
