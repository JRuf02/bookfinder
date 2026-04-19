from dataclasses import dataclass

from app.models.identifiers import OsmId


@dataclass
class Shelf:
    """Data class to represent shelf information."""

    osm_id: OsmId
    name: str
    latitude: float
    longitude: float
    address: str
    type: str
    operator: str
    website: str
    opening_hours: str
    osm_check_date: str  # TODO: use datetime.date
    osm_last_updated: str  # TODO: use datetime.date


@dataclass
class LocatedShelf:
    """Data class to represent a shelf with distance information."""

    shelf: Shelf
    distance_meters: float
