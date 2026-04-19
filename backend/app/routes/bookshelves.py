from flask import Request, jsonify
from flask.typing import ResponseReturnValue

from app.db.bookshelves_db import (
    get_all_bookshelves_from_db,
    get_nearby_bookshelves_from_db,
)
from app.utils.naming import as_json_dict


def get_all_bookshelves() -> ResponseReturnValue:
    """Get metadata of all bookshelves."""
    bookshelves = get_all_bookshelves_from_db()
    return jsonify(
        {
            "status": "success",
            "data": [as_json_dict(bookshelf) for bookshelf in bookshelves],
        }
    )


def get_nearby_bookshelves(request: Request) -> ResponseReturnValue:
    """Get nearby bookshelves based on latitude, longitude and radius."""
    lat = request.args.get("lat", type=float)  # None, if conversion to float fails
    lon = request.args.get("lon", type=float)
    radius = request.args.get("radius", default=5000.0, type=float)  # meters

    if lat is None or lon is None:
        return jsonify(
            {
                "status": "error",
                "message": "lat and lon missing or invalid.",
            }
        ), 400

    nearby_shelves = get_nearby_bookshelves_from_db(lat, lon, radius)

    return jsonify(
        {
            "status": "success",
            "data": [
                as_json_dict(bookshelf) for bookshelf in nearby_shelves
            ],  # TODO: use dict-able dataclass LocatedShelf
        }
    )
