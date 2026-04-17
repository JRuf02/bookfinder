from flask import Request, jsonify
from flask.typing import ResponseReturnValue

from app.dnb_api import fetch_cover_from_dnb
from app.models.identifiers import DnbIsbn


def get_cover_by_dnb_isbn(request: Request) -> ResponseReturnValue:
    """Call with dnb isbn format and size."""
    dnb_isbn = DnbIsbn.parse(request.args.get("dnb_isbn"))
    size = request.args.get("size", "l")

    if not dnb_isbn:
        return jsonify(
            {"status": "error", "message": "dnb_isbn parameter not provided or invalid"}
        ), 400

    # Proxy the cover image request to DNB
    return fetch_cover_from_dnb(dnb_isbn, size)
