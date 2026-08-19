import logging

from app.db.database import db_cursor
from app.models.identifiers import OsmId
from app.models.shelf import LocatedShelf, Shelf
from app.utils.geo_utils import haversine

logger = logging.getLogger(__name__)


def get_all_bookshelves_from_db() -> list[Shelf]:
    """Fetch all bookshelves from the database."""
    with db_cursor() as c:
        c.execute("""
            SELECT osm_id, name, latitude, longitude, address, type, operator, website,
                opening_hours, osm_check_date, osm_last_updated
            FROM bookshelves
        """)
        rows = c.fetchall()

    shelves = []
    for row in rows:
        osm_id = OsmId.parse(row[0])
        if osm_id is None:
            logger.error(
                "OSM id from database cannot be processed due to invalid format."
            )
            continue

        shelves.append(
            Shelf(
                osm_id=osm_id,
                name=row[1],
                latitude=float(row[2]),
                longitude=float(row[3]),
                address=row[4],
                type=row[5],
                operator=row[6],
                website=row[7],
                opening_hours=row[8],
                osm_check_date=row[9],
                osm_last_updated=row[10],
            )
        )

    return shelves


def get_nearby_bookshelves_from_db(
    lat: float, lon: float, radius: float
) -> list[LocatedShelf]:
    """Fetch bookshelves in a given radius (in meters) from the database."""

    # Idea for better performance: we could add a bbox to query here
    with db_cursor() as c:
        c.execute("""
            SELECT osm_id, name, latitude, longitude, address, type, operator, website,
                opening_hours, osm_check_date, osm_last_updated
            FROM bookshelves
        """)
        rows = c.fetchall()

    nearby_shelves = []
    for row in rows:
        shelf_lat = row[2]
        shelf_lon = row[3]
        if shelf_lat is None or shelf_lon is None:
            logger.error(
                "Bookshelf with OSM id %s has invalid coordinates and will be skipped.",
                row[0],
            )
            continue
        dist_m = haversine(lon, lat, shelf_lon, shelf_lat)
        if dist_m <= radius:
            osm_id = OsmId.parse(row[0])
            if osm_id is None:
                logger.error(
                    "OSM id from database cannot be processed due to invalid format."
                )
                continue
            shelf = Shelf(
                osm_id=osm_id,
                name=row[1],
                latitude=shelf_lat,
                longitude=shelf_lon,
                address=row[4],
                type=row[5],
                operator=row[6],
                website=row[7],
                opening_hours=row[8],
                osm_check_date=row[9],
                osm_last_updated=row[10],
            )
            located_shelf = LocatedShelf(shelf=shelf, distance_meters=dist_m)
            nearby_shelves.append(located_shelf)
    logger.info(
        "Found %s nearby bookshelves within %s meters.", len(nearby_shelves), radius
    )
    return nearby_shelves
