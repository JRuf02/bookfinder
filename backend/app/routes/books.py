import logging

from flask import Request, jsonify
from flask.typing import ResponseReturnValue

from app.db.book_db import get_book_from_database, save_book_to_db
from app.dnb_api import fetch_book_from_dnb
from app.models.book import Book
from app.utils.isbn_utils import normalize_isbn
from app.utils.naming import as_json_dict

logger = logging.getLogger(__name__)


def get_book_api_logic(request: Request) -> ResponseReturnValue:
    """API endpoint to fetch book data by ISBN."""
    isbn = request.args.get("isbn")
    if not isbn:
        return jsonify(
            {"status": "error", "message": "ISBN parameter is required"}
        ), 400
    # TODO: if not valid isbn, return error message, else create normalized and checked isbn type
    book = get_book(isbn)
    if not book:
        return jsonify({"status": "error", "message": "Book not found"}), 404
    return jsonify({"status": "success", "data": as_json_dict(book)})


def get_book(isbn: str) -> Book | None:
    """Fetch book data by normalized ISBN, first from local DB, then from DNB if not found."""

    # Normalize ISBN (remove spaces, dashes etc.)
    isbn = normalize_isbn(isbn)
    logger.debug("Normalized ISBN: %s", isbn)

    # 1. Try to get book from local DB
    book = get_book_from_database(isbn)
    if book:
        logger.debug("Book found in DB: %s", book)
        return book
    logger.debug("Book not found in DB for ISBN: %s", isbn)

    # 2. If not found, fetch from DNB and cache it
    book = fetch_book_from_dnb(isbn)
    logger.debug("Fetched book data from dnb: %s", book)
    if book.title not in {"Error fetching data", "Unknown Title"}:
        # TODO: Give the frontend a way to add title etc manually!
        #       (especially if unknown title, but cover image found!)
        save_book_to_db(book)

    return book
