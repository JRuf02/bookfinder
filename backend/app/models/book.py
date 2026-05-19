from dataclasses import dataclass

from app.models.identifiers import Isbn
from app.models.shelf import LocatedShelf


@dataclass
class Book:
    """Data class to represent general book information by isbn, fetched from DNB."""

    isbn: Isbn
    title: str | None
    author: str | None
    dnb_id: str
    cover_url: str | None = None


@dataclass
class BookEntity:
    """Data class to represent a real entity of a book."""

    entity_id: int
    book: Book
    located_shelf: LocatedShelf
    in_shelf_since: str
