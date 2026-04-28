from app.db.database import db_cursor
from app.models.identifiers import OsmId


def check_if_shelf_exists(osm_id: OsmId) -> bool:
    """Check if a shelf with the given osm_id exists
    in the bookshelves table of the database.
    """
    with db_cursor() as c:
        c.execute(
            "SELECT 1 FROM bookshelves WHERE osm_id = ? LIMIT 1",
            (str(osm_id),),
        )
        return c.fetchone() is not None
