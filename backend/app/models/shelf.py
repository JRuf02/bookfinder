from dataclasses import dataclass

from app.models.identifiers import OsmId


@dataclass
class Shelf:
    """Data class to represent shelf information."""

    osm_id: OsmId
    name: str | None
    latitude: float
    longitude: float
    address: str | None
    type: str | None
    operator: str | None
    website: str | None
    opening_hours: str | None
    osm_check_date: str | None
    osm_last_updated: str


@dataclass
class LocatedShelf:
    """Data class to represent a shelf with distance information."""

    shelf: Shelf
    distance_meters: float | None
