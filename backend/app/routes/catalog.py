from app.db.catalog_db import search_in_catalog_db
from flask import Request, Response


def search_in_catalog(request: Request) -> Response:
    """Search for books in the catalog (by title) and compute distance from given coordinates."""
    # TODO: Move api logic from db/catalog_db.py here
    return search_in_catalog_db(request)
