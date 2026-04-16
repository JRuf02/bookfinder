from dataclasses import dataclass


@dataclass
class Book:
    """Data class to represent book information fetched from DNB."""

    isbn: str
    title: str
    author: str
    dnb_isbn: str
    dnb_id: str
    cover_url: str | None = None
