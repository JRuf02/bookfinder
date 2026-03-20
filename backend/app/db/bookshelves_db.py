import os
import sqlite3

from app.utils.geo_utils import haversine

# TODO: Move all api logic to app/routes/bookshelves.py
from flask import Request, Response, jsonify

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "books.db")


def get_all_bookshelves_from_db() -> Response:
    """Fetch all bookshelves from the database."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT osm_id, name, latitude, longitude, address, type, operator, website, opening_hours, osm_check_date, osm_last_updated
        FROM bookshelves
    """)
    rows = c.fetchall()
    conn.close()
    shelves = [
        {
            "osm_id": row[0],
            "name": row[1],
            "latitude": row[2],
            "longitude": row[3],
            "address": row[4],
            "type": row[5],
            "operator": row[6],
            "website": row[7],
            "opening_hours": row[8],
            "osm_check_date": row[9],
            "osm_last_updated": row[10],
        }
        for row in rows
    ]
    return jsonify(shelves)


def get_nearby_bookshelves_from_db(req: Request) -> Response:
    """Fetch bookshelves in a given radius from the database."""
    lat = req.args.get("lat", type=float)
    lon = req.args.get("lon", type=float)
    radius = req.args.get("radius", default=5000, type=float)  # meters

    print("lat:", lat, "lon:", lon, "radius:", radius)  # TODO: Remove/use debugger
    print(type(lat), type(lon), type(radius))

    if lat is None or lon is None:
        return jsonify({"error": "lat and lon are required"}), 400

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT osm_id, name, latitude, longitude, address, type, operator, website, opening_hours, osm_check_date, osm_last_updated
        FROM bookshelves
    """)
    rows = c.fetchall()
    conn.close()
    nearby = []
    for row in rows:
        shelf_lat = row[2]
        shelf_lon = row[3]
        if shelf_lat is None or shelf_lon is None:
            continue
        dist_km = haversine(lon, lat, shelf_lon, shelf_lat)
        dist_m = dist_km * 1000
        if dist_m <= radius:
            shelf = {
                "osm_id": row[0],
                "name": row[1],
                "latitude": shelf_lat,
                "longitude": shelf_lon,
                "address": row[4],
                "type": row[5],
                "operator": row[6],
                "website": row[7],
                "opening_hours": row[8],
                "osm_check_date": row[9],
                "osm_last_updated": row[10],
                "distance_m": dist_m,
            }
            nearby.append(shelf)
    print(
        f"Found {len(nearby)} nearby bookshelves within {radius} meters."
    )  # TODO: Remove/use debugger
    return jsonify(nearby)
