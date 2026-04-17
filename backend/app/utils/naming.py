from dataclasses import asdict

from camel_converter.decorators import dict_to_camel

from app.models.book import Book


@dict_to_camel
def as_json_dict(book: Book) -> dict:
    """Convert Book dataclass to dict with camelCase keys for frontend."""
    return asdict(book)
