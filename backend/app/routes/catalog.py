from flask import Request, jsonify
from flask.typing import ResponseReturnValue
from http_constants.status import HttpStatus

from app.db.catalog_db import search_in_catalog_db
from app.models.coordinates import GeoCoordinateError, GeoCoordinates
from app.utils.naming import as_json_dict


def search_in_catalog(request: Request) -> ResponseReturnValue:
    """Search for books in the catalog (by title) and
    compute distance from given coordinates.
    """

    title = request.args.get("title")
    author = request.args.get("author")

    author = author.strip() if author is not None else None
    title = title.strip() if title is not None else None

    coords = GeoCoordinates.parse(
        raw_latitude=request.args.get("lat", type=float),
        raw_longitude=request.args.get("lon", type=float),
    )

    if isinstance(coords, GeoCoordinateError):
        return jsonify(
            {
                "status": "error",
                "message": f"Invalid user coordinates: {coords.message}",
            }
        ), HttpStatus.BAD_REQUEST.value

    if title == "":
        title = None

    if author == "":
        author = None

    if not title and not author:
        return jsonify(
            {"status": "error", "message": "Title or author must be given."}
        ), HttpStatus.BAD_REQUEST.value

    search_results = search_in_catalog_db(title, author, coords)

    return jsonify(
        {
            "status": "success",
            "data": [as_json_dict(result) for result in search_results],
        }
    )
