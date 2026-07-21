import logging

from app.db.catalog_db import get_number_of_books_with_isbn
from app.db.database import db_cursor
from app.models.book import Book, BookPopularity
from app.models.identifiers import Isbn
from app.utils.time import compute_avg_num_of_days_until_now
from scripts.fuzzy_db import add_author_name, add_book_title

logger = logging.getLogger(__name__)


def get_book_from_database(isbn: Isbn) -> Book | None:
    """Fetch book data from the local SQLite database using the ISBN."""

    with db_cursor() as c:
        c.execute(
            "SELECT isbn, title, author, dnb_id, cover_url FROM books WHERE isbn = ?",
            (str(isbn),),
        )
        row = c.fetchone()
    if row:
        return Book(
            isbn=isbn,
            title=row["title"],
            author=row["author"],
            dnb_id=row["dnb_id"],
            cover_url=row["cover_url"],
        )
    return None


def save_book_to_db(book: Book) -> None:
    """Save book metadata to the local SQLite database, in the table 'books'.

    If a book with the same ISBN already exists, old metadata will be kept.
    """

    with db_cursor() as c:
        c.execute(
            """
            INSERT OR IGNORE INTO books (isbn, title, author, dnb_id,
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

        is_new_book = c.rowcount == 1

    if is_new_book:
        # Generate and store tokens and threegrams for the book title and author name
        logger.debug(
            f"Generating tokens and threegrams for book: {book.title} ({book.isbn})"
        )
        if book.title:
            add_book_title(book.title, str(book.isbn))
        if book.author:
            add_author_name(book.author, str(book.isbn))


def get_book_popularity_from_db(isbn: Isbn) -> BookPopularity:
    """Fetch popularity data for a book from the local database.

    Raises a ValueError if no data for the given ISBN is found in the database.
    """

    # TODO: Error handling when isbn not in db

    avg_days_until_takeout = None

    # Fetch the (historical) average of days until takeout for the given ISBN
    with db_cursor() as c:
        c.execute(
            "SELECT avg_days_until_takeout, total_insertions FROM books WHERE isbn = ?",
            (str(isbn),),
        )
        row = c.fetchone()

    if row is None:
        msg = f"Book with ISBN {isbn} not found in database."
        raise ValueError(msg)

    if row["total_insertions"] is None:
        # This can only happen if the db is corrupted, so raise an error if it does
        msg = f"Popularity data for book with ISBN {isbn} is incomplete in database."
        raise KeyError(msg)
    total_books_seen = int(row["total_insertions"])

    avg_days_until_takeout = (
        float(row["avg_days_until_takeout"])
        if row["avg_days_until_takeout"] is not None
        else None
    )

    # Compute average on-shelf time of matching books that are still on shelves
    with db_cursor() as c:
        c.execute(
            "SELECT time_of_entry FROM current_catalog WHERE isbn = ?",
            (str(isbn),),
        )
        entry_times = c.fetchall()

    currently_on_shelves = len(entry_times) if entry_times else 0

    avg_days_on_shelf_for_current_books = compute_avg_num_of_days_until_now(
        [entry_time["time_of_entry"] for entry_time in entry_times]
    )

    return BookPopularity(
        isbn=isbn,
        avg_days_until_takeout=avg_days_until_takeout,
        currently_on_shelves=currently_on_shelves,
        total_books_seen=total_books_seen,
        avg_days_on_shelf_for_current_books=avg_days_on_shelf_for_current_books,
    )


def log_book_insertion_in_db(isbn: Isbn) -> None:
    """Increment the total_insertions counter for the given ISBN in the local db."""

    with db_cursor() as c:
        c.execute(
            """
            UPDATE books
            SET total_insertions = total_insertions + 1
            WHERE isbn = ?
        """,
            (str(isbn),),
        )


def _update_avg_days_until_takeout_in_db(isbn: Isbn, new_avg_days: float) -> None:
    """Update the avg_days_until_takeout for the given ISBN in the local db."""

    with db_cursor() as c:
        c.execute(
            """
            UPDATE books
            SET avg_days_until_takeout = ?
            WHERE isbn = ?
        """,
            (new_avg_days, str(isbn)),
        )


def log_book_takeout_in_db(isbn: Isbn, days_until_takeout: float) -> None:
    """Update the avg_days_until_takeout for the given ISBN in the local db,
    based on the new data point of a book with this ISBN being taken out after
    'days_until_takeout' days.
    """

    # Fetch current average and total insertions
    with db_cursor() as c:
        c.execute(
            "SELECT avg_days_until_takeout FROM books WHERE isbn = ?",
            (str(isbn),),
        )
        row = c.fetchone()

    current_avg = (
        float(row["avg_days_until_takeout"])
        if row["avg_days_until_takeout"] is not None
        else 0
    )
    num_elements_in_avg = get_number_of_books_with_isbn(isbn)

    # Calculate new average
    new_avg = (
        (current_avg * num_elements_in_avg + days_until_takeout)
        / (num_elements_in_avg + 1)
        if num_elements_in_avg > 0
        else days_until_takeout
    )

    # Update the database with the new average
    _update_avg_days_until_takeout_in_db(isbn, new_avg)
