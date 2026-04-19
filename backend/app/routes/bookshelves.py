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
    # TODO: Move all api logic from get_nearby_bookshelves_from_db to this function
    return get_nearby_bookshelves_from_db(request)
