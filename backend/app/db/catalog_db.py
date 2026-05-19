import logging

from fuzzysearch import find_near_matches

from app.db.database import db_cursor
from app.models.book import Book, BookEntity
from app.models.coordinates import GeoCoordinateError, GeoCoordinates
from app.models.identifiers import Isbn, OsmId
from app.models.shelf import LocatedShelf, Shelf
from app.utils.geo_utils import haversine

logger = logging.getLogger(__name__)


def search_in_catalog_db(
    title: str | None = None,
    author: str | None = None,
    user_coordinates: GeoCoordinates | None = None,
) -> list[BookEntity]:
    """Search for books by title and / or author and return entries
    with shelf info and distance.

    If user coordinates are None, distance will be returned as None.
    """

    author = author.strip() if author is not None else None
    title = title.strip() if title is not None else None

    if author == "":
        author = None

    if title == "":
        title = None

    if author is None and title is None:
        msg = "Title or author must be given."
        raise ValueError(msg)

    # TODO: ask Patrick if this is fast enough:
    # This returns all books, pre-sorted by distance from the user
    all_book_entities = _fetch_all_books_from_catalog(user_coordinates)

    # Sort by fuzzy scores, filter out non-matching entries
    return rank_and_filter_book_entities(title, author, all_book_entities)


def rank_and_filter_book_entities(
    title: str | None,
    author: str | None,
    all_book_entities: list[BookEntity],
) -> list[BookEntity]:
    """Rank and filter the given book entities based on how well they match
    the given title and author.
    The returned list is sorted by relevance (best matches first).
    """

    max_l_distance_author = 3

    title_given = title is not None and title != ""
    author_given = author is not None and author != ""

    title = title if title is not None else ""
    author = author if author is not None else ""

    author_parts = author.lower().replace(",", " ").split(" ")
    author_parts = [part.strip() for part in author_parts]
    author_parts = [part for part in author_parts if len(part) >= max_l_distance_author]

    scored_entities: list[tuple[BookEntity, tuple[float, float, float, float]]] = []
    # Compute fuzzy scores for all books and filter out non-matching ones
    for entity in all_book_entities:
        # Compute fuzzy scores that measure how well the queried title / author matches
        # this book's title / author
        if not entity.book.author:
            logger.warning(f"Book without author in db: {entity.book}")
            author_parts_matched, author_parts_score = (0, 0)
        else:
            author_parts_matched, author_parts_score = (
                calculate_author_score(author_parts, entity.book.author.lower())
                if author_given
                else (0, 0)
            )
        if not entity.book.title:
            logger.warning(f"Book without title in db: {entity.book}")
            title_matched, title_score = (0, 0)
        else:
            title_matched, title_score = (
                calculate_title_score(title, entity.book.title.lower())
                if title_given
                else (0, 0)
            )

        # Filter out the book if it doesn't match the queried title / author at all.
        if title_given and title_matched == 0:
            continue

        if author_given and author_parts_matched == 0:
            continue

        # combine title and author scores into one tuple
        combined_score = (
            title_matched,
            title_score,
            author_parts_matched,
            author_parts_score,
        )

        scored_entities.append((entity, combined_score))

    scored_entities.sort(key=lambda x: x[1], reverse=True)

    return [entity for entity, _ in scored_entities]


def calculate_title_score(query_title: str, db_title: str) -> tuple[float, float]:
    """Calculate a fuzzy score for how well the query_title matches the db_title.
    Returns (0, 0) for no match and (1, -distance) for a match,
    where distance is the Levenshtein distance.
    """

    matches = find_near_matches(
        query_title, db_title, max_l_dist=min(int(len(query_title) * 0.5), 3)
    )
    if len(matches) > 0:
        minimum_distance = min(match.dist for match in matches)
        return 1, -minimum_distance
    return 0, 0


def calculate_author_score(
    author_parts: list[str], book_author: str
) -> tuple[float, float]:
    """Calculate a fuzzy score for how well the query author matches the book author.

    Each part of the author's name is matched against book_author.
    The score is based on how many parts match,
    and the Levenshtein distance of the matches.
    Returns (0, 0) for no match and (num_parts_matched, -distance) for a match, where
    distance is the sum of the minimum Levenshtein distances of each author_part that
    matches the book_author, and num_parts_matched is the number of parts that match.

    Example:
    author_parts: ["stephen", "erwin", "kong"]
    book_author: "king, stephen"

    calculate_author_score(author_parts, book_author) -> (2, -1)

    """

    minimum_distances = []
    for author_part in author_parts:
        matches = find_near_matches(
            author_part, book_author, max_l_dist=min(int(len(author_part) * 0.5), 3)
        )
        if len(matches) > 0:
            minimum_distance = min(match.dist for match in matches)
            minimum_distances.append(minimum_distance)
    return len(minimum_distances), -sum(minimum_distances)


def _fetch_all_books_from_catalog(
    user_coordinates: GeoCoordinates | None = None,
) -> list[BookEntity]:
    with db_cursor() as c:
        c.execute(
            """
            SELECT cc.entry_id, cc.osm_id, cc.isbn,
            b.title, b.author, b.dnb_id, b.cover_url,
            bs.latitude AS shelf_latitude,
            bs.longitude AS shelf_longitude,
            bs.name AS shelf_name,
            bs.type AS shelf_type,
            bs.address, bs.opening_hours, bs.operator, bs.website,
            bs.osm_check_date, bs.osm_last_updated,
            cc.time_of_entry
            FROM current_catalog cc
            JOIN books b ON cc.isbn = b.isbn
            JOIN bookshelves bs ON cc.osm_id = bs.osm_id
        """,  # TODO: LIMIT and OFFSET for pagination?
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

        entry_id = row["entry_id"]
        if row["time_of_entry"] is None:
            logger.warning(
                f"Missing time_of_entry for catalog entity with entry_id {entry_id}"
            )
            continue  # Skip entries without time_of_entry

        if entry_id is None:
            # This should not happen, as entry_id is a primary key
            logger.error(f"Entity without entry_id in current_catalog. ISBN: {isbn}")
            continue

        results.append(
            BookEntity(
                entity_id=entry_id,
                book=Book(
                    isbn=isbn,
                    title=row["title"],
                    author=row["author"],
                    dnb_id=row["dnb_id"],
                    cover_url=row["cover_url"],
                ),
                located_shelf=LocatedShelf(
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
                in_shelf_since=row["time_of_entry"],
            )
        )

    if user_coordinates is not None:
        results.sort(key=lambda x: x.located_shelf.distance_meters)
    # This pre-sorting can be overwritten by fuzzysearch (in the calling function),
    # but entities with the same fuzzy score will remain sorted by distance.

    return results
