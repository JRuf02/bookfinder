import sqlite3

# TODO: Move all api logic to app/routes/catalog.py
from flask import jsonify, Request, Response
import os
from app.utils.geo_utils import haversine

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "books.db")


def search_in_catalog_db(request: Request) -> Response:
    """Search for books by title and return entries with shelf info and distance."""
    # TODO: Normalize the title input
    title = request.args.get('title')
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    if not title:
        return jsonify({"error": "title is required"}), 400
    if lat is None or lon is None:
        return jsonify({"error": "lat and lon are required"}), 400

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT cc.osm_id, cc.isbn, b.title, b.author, bs.latitude, bs.longitude, bs.name, b.dnb_isbn, bs.type, bs.address, bs.opening_hours, bs.operator, bs.website
        FROM current_catalog cc
        JOIN books b ON cc.isbn = b.isbn
        JOIN bookshelves bs ON cc.osm_id = bs.osm_id
        WHERE b.title LIKE ?
    """, (f"%{title}%",))
    rows = c.fetchall()
    conn.close()
    results = []
    for row in rows:
        shelf_lat = row[4]
        shelf_lon = row[5]
        if shelf_lat is None or shelf_lon is None:
            # Don't include results without coordinates
            continue
        dist_km = haversine(lon, lat, shelf_lon, shelf_lat)
        results.append({
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
            "distance_km": dist_km
        })
    return jsonify(results)