from dataclasses import dataclass


@dataclass
class Shelf:
    """Data class to represent shelf information."""

    osm_id: str
    name: str
    latitude: float
    longitude: float
    address: str
    type: str
    operator: str
    website: str
    opening_hours: str
    osm_check_date: str
    osm_last_updated: str
