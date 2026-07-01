from dataclasses import dataclass

from app.models.identifiers import Isbn
from app.models.shelf import LocatedShelf


@dataclass
class Book:
    """Dataclass to represent general book information by isbn, fetched from DNB."""

    isbn: Isbn
    title: str | None
    author: str | None
    dnb_id: str
    cover_url: str | None = None


@dataclass
class BookEntity:
    """Dataclass to represent a real entity of a book."""

    entity_id: int
    book: Book
    located_shelf: LocatedShelf | None
    in_shelf_since: str


@dataclass
class BookPopularity:
    """Dataclass to represent the popularity of books with a given ISBN."""

    isbn: Isbn
    # historical average of days between insertion and takeout for books with this ISBN
    avg_days_until_takeout: int | None
    # number of books with this ISBN that are currently on shelves
    currently_on_shelves: int
    # number of books with this ISBN that have ever been inserted to a shelf
    total_books_seen: int
    # average number of days the currently shelved copies have been on their shelf
    avg_days_on_shelf_for_current_books: int | None
