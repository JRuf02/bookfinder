from flask import Request, Response, jsonify
from flask.typing import ResponseReturnValue
from http_constants.status import HttpStatus

from app.db.covers_db import get_cover_from_db
from app.models.identifiers import Isbn


def get_cover_by_isbn(request: Request) -> ResponseReturnValue:
    """Call with dnb isbn format and size."""
    isbn = Isbn.parse(request.args.get("isbn"))
    size = request.args.get("size", "l").lower()

    if not isbn:
        return jsonify(
            {"status": "error", "message": "ISBN parameter not provided or invalid"}
        ), HttpStatus.BAD_REQUEST.value

    # Validate size parameter
    if size not in ["s", "m", "l"]:
        return jsonify({"status": "error", "message": "Invalid size parameter"}), HttpStatus.BAD_REQUEST.value

    cover = get_cover_from_db(isbn, size)

    if cover is None:
        return jsonify(
            {"status": "error", "message": "Failed to fetch cover image"}
        ), HttpStatus.SERVICE_UNAVAILABLE.value

    # Flask response with image data
    return Response(
        cover[0],
        status=HttpStatus.OK.value,
        content_type=cover[1],
    )
