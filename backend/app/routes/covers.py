from flask import Request, jsonify
from flask.typing import ResponseReturnValue

from app.dnb_api import fetch_cover_from_dnb


def get_cover_by_dnb_isbn(request: Request) -> ResponseReturnValue:
    """Call with dnb isbn format and size."""
    isbn = request.args.get("isbn")
    size = request.args.get("size", "l")

    if not isbn:
        return jsonify({"error": "ISBN parameter is required"}), 400

    # Proxy the cover image request to DNB
    return fetch_cover_from_dnb(isbn, size)
