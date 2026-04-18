from flask import Request, jsonify
from flask.typing import ResponseReturnValue

from app.dnb_api import fetch_cover_from_dnb
from app.models.identifiers import Isbn


def get_cover_by_isbn(request: Request) -> ResponseReturnValue:
    """Call with dnb isbn format and size."""
    isbn = Isbn.parse(request.args.get("isbn"))
    size = request.args.get("size", "l")

    if not isbn:
        return jsonify(
            {"status": "error", "message": "isbn parameter not provided or invalid"}
        ), 400

    # Proxy the cover image request to DNB
    return fetch_cover_from_dnb(isbn, size)
