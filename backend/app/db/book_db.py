from app.db.database import db_cursor
from app.models.book import Book, BookPopularity
from app.models.identifiers import Isbn
from app.utils.time import compute_avg_num_of_days_until_now

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

    If a book with the same ISBN already exists, old metadata will be overwritten.
    """

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


def get_book_popularity_from_db(isbn: Isbn) -> BookPopularity:
    """Fetch popularity data for a book from the local database."""

    avg_days_until_takeout = 0
    total_books_seen = 0

    # Fetch the (historical) average of days until takeout for the given ISBN
    with db_cursor() as c:
        c.execute(
            "SELECT avg_days_until_takeout, total_insertions FROM books WHERE isbn = ?",
            (str(isbn),),
        )
        row = c.fetchone()
    if row and row["avg_days_until_takeout"] is not None:
        avg_days_until_takeout = int(row["avg_days_until_takeout"])
    if row and row["total_insertions"] is not None:
        total_books_seen = int(row["total_insertions"])

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
