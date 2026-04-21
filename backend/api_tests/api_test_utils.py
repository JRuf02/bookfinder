from flask import Flask

from app.db.database import db_cursor


def insert_test_shelf_into_db(
    app: Flask,
    lat: float = 48.0998168,
    lon: float = 8.0546482,
    osm_id: str = "https://www.openstreetmap.org/node/11935877522",
) -> None:
    with db_cursor(app.config["DB_PATH"]) as c:
        c.execute(
            """
            INSERT OR REPLACE INTO bookshelves (
                osm_id, name, latitude, longitude, address, type, operator,
                website, opening_hours, osm_check_date, osm_last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                osm_id,
                "test shelf",
                lat,
                lon,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ),
        )
