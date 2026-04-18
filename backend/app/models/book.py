from dataclasses import dataclass

from app.models.identifiers import Isbn


@dataclass
class Book:
    """Data class to represent book information fetched from DNB."""

    isbn: Isbn
    title: str | None
    author: str | None
    dnb_id: str
    cover_url: str | None = None
