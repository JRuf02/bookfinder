from flask import Request, jsonify
from flask.typing import ResponseReturnValue
from http_constants.status import HttpStatus

from app.db.bookshelves_db import (
    get_all_bookshelves_from_db,
    get_nearby_bookshelves_from_db,
)
from app.utils.naming import as_json_dict

MAX_LATITUDE = 90
MAX_LONGITUDE = 180


def get_all_bookshelves() -> ResponseReturnValue:
    """Get metadata of all bookshelves."""
    bookshelves = get_all_bookshelves_from_db()
    return jsonify(
        {
            "status": "success",
            "data": [as_json_dict(bookshelf) for bookshelf in bookshelves],
        }
    )


# TODO: Use or remove/rewrite endpoint
# TODO? Exchange radius for num nearby shelves?
def get_nearby_bookshelves(request: Request) -> ResponseReturnValue:
    """Get nearby bookshelves based on latitude, longitude and radius."""

    # TODO: Use GeoCoordinates.parse() here and in the db function

    lat = request.args.get("lat", type=float)  # None, if conversion to float fails
    lon = request.args.get("lon", type=float)
    radius = request.args.get("radius", default=5000.0, type=float)  # meters

    if lat is None or lon is None:
        return jsonify(
            {
                "status": "error",
                "message": "lat and lon missing or invalid.",
            }
        ), HttpStatus.BAD_REQUEST.value

    if not -MAX_LATITUDE <= lat <= MAX_LATITUDE:
        return jsonify(
            {
                "status": "error",
                "message": f"Latitude must be between -90 and 90. Got {lat}.",
            }
        ), HttpStatus.BAD_REQUEST.value

    if not -MAX_LONGITUDE <= lon <= MAX_LONGITUDE:
        return jsonify(
            {
                "status": "error",
                "message": f"Longitude must be between -180 and 180. Got {lon}.",
            }
        ), HttpStatus.BAD_REQUEST.value

    nearby_shelves = get_nearby_bookshelves_from_db(lat, lon, radius)

    return jsonify(
        {
            "status": "success",
            "data": [as_json_dict(bookshelf) for bookshelf in nearby_shelves],
        }
    )
