# TODO: Move all api logic to app/routes/catalog.py
from flask import Request, jsonify
from flask.typing import ResponseReturnValue

from app.db.database import db_cursor
from app.utils.geo_utils import haversine


def search_in_catalog_db(title: str, lat: float, lon: float) -> ResponseReturnValue:
    """Search for books by title and return entries with shelf info and distance."""

    with db_cursor() as c:
        c.execute(
            """
            SELECT cc.osm_id, cc.isbn, b.title, b.author,
            bs.latitude, bs.longitude, bs.name,
            b.dnb_isbn, bs.type, bs.address, bs.opening_hours, bs.operator, bs.website
            FROM current_catalog cc
            JOIN books b ON cc.isbn = b.isbn
            JOIN bookshelves bs ON cc.osm_id = bs.osm_id
            WHERE b.title LIKE ?
        """,
            (f"%{title}%",),
        )
        rows = c.fetchall()

    results = []
    for row in rows:
        shelf_lat = row[4]
        shelf_lon = row[5]
        if shelf_lat is None or shelf_lon is None:
            # Don't include results without coordinates  # TODO: change this behaviour?
            continue
        dist_km = haversine(lon, lat, shelf_lon, shelf_lat)
        # TODO: Change to named tuple or dict cursor to avoid error-prone indexing
        results.append(
            {
                "osm_id": row[0],
                "isbn": row[1],
                "title": row[2],
                "author": row[3],
                "shelf_name": row[6],
                "dnb_isbn": row[7],
                "type": row[8],
                "address": row[9],
                "opening_hours": row[10],
                "operator": row[11],
                "website": row[12],
                "latitude": shelf_lat,
                "longitude": shelf_lon,
                "distance_km": dist_km,
            }
        )
    return jsonify(results)
