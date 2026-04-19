from flask import Flask

from app.db.database import db_cursor


def insert_test_shelf_into_db(app: Flask) -> None:
    with db_cursor(app.config["DB_PATH"]) as c:
        c.execute(
            """
            INSERT OR REPLACE INTO bookshelves (
                osm_id, name, latitude, longitude, address, type, operator,
                website, opening_hours, osm_check_date, osm_last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "https://www.openstreetmap.org/node/11935877522",
                "test shelf",
                48.099817,
                8.054648,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ),
        )
