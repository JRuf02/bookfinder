from flask import Request
from flask.typing import ResponseReturnValue

from app.db.bookshelves_db import (
    get_all_bookshelves_from_db,
    get_nearby_bookshelves_from_db,
)


def get_all_bookshelves() -> ResponseReturnValue:
    """Get metadata of all bookshelves."""
    # TODO: Move all api logic from get_all_bookshelves_from_db to this function
    return get_all_bookshelves_from_db()


def get_nearby_bookshelves(request: Request) -> ResponseReturnValue:
    """Get nearby bookshelves based on latitude, longitude and radius."""
    # TODO: Move all api logic from get_nearby_bookshelves_from_db to this function
    return get_nearby_bookshelves_from_db(request)
