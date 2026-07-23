import itertools
import json
import logging

from app.db.database import db_cursor
from app.db.database_fuzzy_utils import search_authors, search_titles
from app.models.book import Book, BookEntity
from app.models.coordinates import GeoCoordinateError, GeoCoordinates
from app.models.identifiers import Isbn, OsmId
from app.models.shelf import LocatedShelf, Shelf
from app.models.time_strings import TimezonedDatetimeString
from app.utils.geo_utils import haversine

logger = logging.getLogger(__name__)


def merge_book_entity_lists(
    list1: list[tuple[BookEntity, float]],
    list2: list[tuple[BookEntity, float]],
) -> list[tuple[BookEntity, float]]:
    """Merge two lists of (BookEntity, score) tuples, keeping only the best score
    for each unique BookEntity (identified by entity_id).

    Assumes that there are no duplicate entity_ids within each list,
    but the same entity_id may appear in both lists.
    """

    if len(list1) == 0:
        return list2

    if len(list2) == 0:
        return list1

    best: dict[int, tuple[BookEntity, float]] = {}

    for entity, score in itertools.chain(list1, list2):
        current = best.get(entity.entity_id)
        if current is None or score > current[1]:
            best[entity.entity_id] = (entity, score)

    return list(best.values())


def search_in_catalog_db(
    title: str | None = None,
    author: str | None = None,
    user_coordinates: GeoCoordinates | None = None,
) -> list[BookEntity]:
    """Search for books by title and / or author and return entries
    with shelf info and distance, sorted by fuzzy search scores.

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

    author_results: list[tuple[BookEntity, float]] = []
    title_results: list[tuple[BookEntity, float]] = []

    if author:
        # Fuzzy search for matching books in the database (contains all books ever seen)
        matching_author_isbns = search_authors(query=author, max_edit_dist=3)
        # Filter out books that are not on any shelf currently
        author_matching_books_on_shelves: list[tuple[Isbn, float]] = []
        for isbn, score in matching_author_isbns:
            parsed_isbn = Isbn.parse(isbn)
            if parsed_isbn is None:
                logger.warning(f"Invalid ISBN '{isbn}' found in database.")
                continue
            author_matching_books_on_shelves.append((parsed_isbn, score))
        # Fetch metadata for the matching books that are currently on shelves
        author_results = _fetch_books_from_catalog(
            author_matching_books_on_shelves, user_coordinates=user_coordinates
        )

    if title:
        # Fuzzy search for matching books in the database
        matching_title_isbns = search_titles(query=title, max_edit_dist=3)
        # Filter out books that are not on any shelf currently
        title_matching_books_on_shelves: list[tuple[Isbn, float]] = []
        for isbn, score in matching_title_isbns:
            parsed_isbn = Isbn.parse(isbn)
            if parsed_isbn is None:
                logger.warning(f"Invalid ISBN '{isbn}' found in database.")
                continue
            title_matching_books_on_shelves.append((parsed_isbn, score))
        # Fetch metadata for the matching books that are currently on shelves
        title_results = _fetch_books_from_catalog(
            title_matching_books_on_shelves, user_coordinates=user_coordinates
        )

    # Combine results from title and author searches
    # TODO: Consider weighting title and author scores differently,
    #       e.g. by multiplying one of them by a factor
    #       If title has more words than author, it can reach way higher scores
    #       than author, even if the author is a perfect match and title is not.
    # TODO: Consider requiring at least one match for title and author if both are given
    # TODO: Dynamically adjust max_edit_dist based on the length of the query string
    #       e.g.: max_edit_dist = max(1, len(query) // 4)
    #       currently: max_edit_dist=3 -> query="Horry" matches "Homo Faber"
    combined_results = merge_book_entity_lists(author_results, title_results)

    # Sort by fuzzy scores, highest first (with lowest distance as tie-breaker)
    def sort_key(item: tuple[BookEntity, float]) -> tuple[float, float]:
        book_entity, score = item
        shelf = book_entity.located_shelf
        if shelf is not None and shelf.distance_meters is not None:
            return (score, -shelf.distance_meters)
        return (score, float("-inf"))

    combined_results.sort(key=sort_key, reverse=True)

    return [entity for entity, _ in combined_results]


def _fetch_books_from_catalog(
    scored_book_isbns: list[tuple[Isbn, float]],
    user_coordinates: GeoCoordinates | None = None,
) -> list[tuple[BookEntity, float]]:
    """Fetch book entities from the catalog for the given list of ISBNs.
    If user_coordinates is given, compute the distance to each shelf.

    Only books that are currently listed in current_catalog AND whose ISBN
    matches one of the given scored_book_isbns are returned. Books in the
    input list that are not currently on any shelf are silently omitted.

    Does not guarantee any sort order of the returned list, but returns
    (BookEntity, fuzzy_score) tuples for each matching book entity found
    in the catalog.
    """

    if not scored_book_isbns:
        return []

    # Map isbn string to fuzzy score, so we can attach the right score
    # to each row after the join.
    # TODO: Take dict as input instead (fuzzy search already has the
    #       before returning sorted list)
    score_by_isbn = {str(isbn): score for isbn, score in scored_book_isbns}

    # Fetch all books from the catalog that match the given ISBNs
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
            WHERE cc.isbn IN (SELECT value FROM json_each(?))
        """,
            (json.dumps(list(score_by_isbn.keys())),),
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

        score = score_by_isbn.get(str(isbn))

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

        in_shelf_since = TimezonedDatetimeString.parse(row["time_of_entry"])
        if not in_shelf_since:
            logger.warning(
                f"Invalid time_of_entry {row['time_of_entry']} in database "
                f"for shelf {osm_id}. Skipping."
            )
            continue

        book_entity = BookEntity(
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
            in_shelf_since=in_shelf_since,
        )

        results.append((book_entity, score))

    return results


def search_in_catalog_by_isbn(
    isbn: Isbn, user_coordinates: GeoCoordinates | None = None
) -> list[BookEntity]:
    """Search for books by ISBN and return entries with shelf info and distance."""

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
            WHERE b.isbn = ?
        """,
            (str(isbn),),
        )
        rows = c.fetchall()

    results = []
    for row in rows:
        osm_id = OsmId.parse(row["osm_id"])
        if osm_id is None:
            logger.warning("Missing osm_id for shelf. Skipping book entity.")
            continue  # Skip entries without osm_id

        entry_id = row["entry_id"]
        if row["time_of_entry"] is None:
            logger.warning(
                f"Missing time_of_entry for catalog entity with entry_id {entry_id}"
            )
            continue  # Skip entries without time_of_entry
        if entry_id is None:
            # This should not happen, as entry_id is a primary key
            logger.error(f"Entity without entry_id in current_catalog for ISBN {isbn}.")
            continue

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
            )
        else:
            dist_m = None

        in_shelf_since = TimezonedDatetimeString.parse(row["time_of_entry"])
        if not in_shelf_since:
            logger.warning(
                f"Invalid time_of_entry {row['time_of_entry']} in database "
                f"for shelf {osm_id}. Skipping."
            )
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
                        latitude=row["shelf_latitude"],
                        longitude=row["shelf_longitude"],
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
                in_shelf_since=in_shelf_since,
            )
        )

    if user_coordinates is not None:
        results.sort(key=lambda x: x.located_shelf.distance_meters)

    return results


def get_number_of_books_with_isbn(isbn: Isbn) -> int:
    """Return the number of books with the given ISBN that are currently on shelves."""

    with db_cursor() as c:
        c.execute(
            "SELECT COUNT(*) AS count FROM current_catalog WHERE isbn = ?",
            (str(isbn),),
        )
        row = c.fetchone()
    return row["count"] if row else 0
