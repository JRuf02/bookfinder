from flask import Request, jsonify
from flask.typing import ResponseReturnValue
from http_constants.status import HttpStatus

from app.db.catalog_db import search_in_catalog_by_isbn, search_in_catalog_db
from app.models.coordinates import GeoCoordinateError, GeoCoordinates
from app.models.identifiers import Isbn
from app.utils.naming import as_json_dict


def search_in_catalog(request: Request) -> ResponseReturnValue:
    """Search for books in the catalog (by title and / or author) and
    compute distance to the shelf if given user coordinates.

    Request parameters:
    - title: Book title (optional, but at least title or author must be given)
    - author: Book author (optional, but at least title or author must be given)
    - lat: User latitude (optional, required if lon given)
    - lon: User longitude (optional, required if lat given)
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


def single_term_search_in_catalog(request: Request) -> ResponseReturnValue:
    """Search for books in the catalog by a single search term, which is matched
    against title, author and ISBN).
    If the search term is a valid ISBN, it is searched as ISBN only.
    The request can also contain user coordinates to compute distance to the shelf
    of each search result.

    Request parameters:
    - q: Search term (required)
    - lat: User latitude (optional, required if lon given)
    - lon: User longitude (optional, required if lat given)
    """

    if request.args.get("author") or request.args.get("title"):
        return jsonify(
            {
                "status": "error",
                "message": "Author and title parameters are not allowed.",
            }
        ), HttpStatus.BAD_REQUEST.value

    search_term = request.args.get("q")

    if not search_term or search_term.strip() == "":
        return jsonify(
            {
                "status": "error",
                "message": "Missing query parameter: 'q' (Search term).",
            }
        ), HttpStatus.BAD_REQUEST.value

    search_term = search_term.strip()

    user_lat = request.args.get("lat", type=float)
    user_lon = request.args.get("lon", type=float)
    user_coords = GeoCoordinates.parse(raw_latitude=user_lat, raw_longitude=user_lon)
    if isinstance(user_coords, GeoCoordinateError):
        return jsonify(
            {
                "status": "error",
                "message": f"Invalid user coordinates: {user_coords.message}",
            }
        ), HttpStatus.BAD_REQUEST.value

    isbn = Isbn.parse(search_term)

    if isbn:
        # Search term is a valid ISBN
        search_results = search_in_catalog_by_isbn(isbn, user_coords)
    else:
        search_results = search_in_catalog_db(search_term, search_term, user_coords)

    return jsonify(
        {
            "status": "success",
            "data": [as_json_dict(result) for result in search_results],
        }
    )
