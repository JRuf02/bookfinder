from dataclasses import asdict

from camel_converter.decorators import dict_to_camel

from app.models.book import Book
from app.models.shelf import LocatedShelf, Shelf


@dict_to_camel
def as_json_dict(obj: Book | Shelf | LocatedShelf) -> dict:
    """Convert Book dataclass to dict with camelCase keys for frontend."""

    data = asdict(obj)

    if "isbn" in data and isinstance(data["isbn"], dict):
        data["isbn"] = data["isbn"]["value"]

    if "osm_id" in data and isinstance(data["osm_id"], dict):
        data["osm_id"] = data["osm_id"]["value"]

    if (
        "shelf" in data
        and data["shelf"] is not None
        and "osm_id" in data["shelf"]
        and isinstance(data["shelf"]["osm_id"], dict)
    ):
        data["shelf"]["osm_id"] = data["shelf"]["osm_id"]["value"]

    return data
