from app.dnb_api import fetch_cover_from_dnb
from flask import Request, jsonify
from flask.typing import ResponseReturnValue


def get_cover(request: Request) -> ResponseReturnValue:
    """Should be called with dnb isbn format."""
    isbn = request.args.get("isbn")
    size = request.args.get("size", "l")

    if not isbn:
        return jsonify({"error": "ISBN parameter is required"}), 400

    # Proxy the cover image request to DNB
    return fetch_cover_from_dnb(isbn, size)
