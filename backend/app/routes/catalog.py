from flask import Request, jsonify
from flask.typing import ResponseReturnValue

from app.db.catalog_db import search_in_catalog_db


def search_in_catalog(request: Request) -> ResponseReturnValue:
    """Search for books in the catalog (by title) and
    compute distance from given coordinates.
    """
    # TODO: Normalize the title input
    title = request.args.get("title")
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    if not title:
        return jsonify({"status": "error", "message": "title is required"}), 400
    if lat is None or lon is None:
        return jsonify(
            {"status": "error", "message": "lat and lon are required"}
        ), 400  # TODO: change to optional?
    return search_in_catalog_db(title, lat, lon)
