from dataclasses import dataclass


@dataclass
class Book:
    """Data class to represent book information fetched from DNB."""

    # CamelCase for frontend compatibility
    isbn: str
    title: str
    author: str
    dnbISBN: str
    dnbId: str
    coverUrl: str | None = None
