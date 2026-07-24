import logging

from flask import Request, jsonify
from flask.typing import ResponseReturnValue

from app.db.book_db import (
    get_book_from_database,
    get_book_popularity_from_db,
    save_book_to_db,
)
from app.db.database_utils import isbn_already_in_database
from app.dnb_api import fetch_book_from_dnb
from app.models.book import Book
from app.models.identifiers import Isbn
from app.utils.naming import as_json_dict

logger = logging.getLogger(__name__)


def get_book_api_logic(request: Request) -> ResponseReturnValue:
    """Get book metadata by ISBN.

    Request parameters:
    - isbn: ISBN of the book to fetch data for (required)
    """

    # Validate and parse input
    isbn = Isbn.parse(request.args.get("isbn"))

    if not isbn:
        return jsonify({"status": "error", "message": "Invalid or missing ISBN"}), 400

    # Fetch book metadata
    book = get_book(isbn)

    if not book:
        return jsonify({"status": "error", "message": "Book not found"}), 404

    return jsonify({"status": "success", "data": as_json_dict(book)}), 200


def get_book(isbn: Isbn) -> Book | None:
    """Fetch book metadata by normalized ISBN, first from local DB,
    then from DNB if not found in local DB. Store fetched data in local DB.
    """

    # 1. Try to get book from local DB
    book = get_book_from_database(isbn)
    if book:
        logger.debug("Book found in DB: %s", book)
        return book
    logger.debug("Book not found in DB for ISBN: %s", str(isbn))

    # 2. If not found, fetch from DNB and cache it
    book = fetch_book_from_dnb(isbn)

    if book is None:
        logger.debug("Book not found in DNB for ISBN: %s", str(isbn))
        return None

    logger.debug("Fetched book data from dnb: %s", book)

    # TODO: Give the frontend a way to add title etc manually!
    #       (especially if unknown title, but cover image found!)
    save_book_to_db(book)

    return book


def get_book_popularity(request: Request) -> ResponseReturnValue:
    """Return the average time books with the given ISBN remained on a shelf before
    being taken out, the current number of books with that ISBN on shelves,
    the total number of books with that ISBN since the beginning of the project, and
    the average time the books with this ISBN that are still on shelves have been on it.

    Request parameters:
    - isbn: ISBN of the book to fetch average shelf time for (required)

    Returns:
    - JSON response with shelf times and other related data as a BookPopularity object.

    """
    # Validate and parse input
    isbn = Isbn.parse(request.args.get("isbn"))

    if not isbn:
        return jsonify({"status": "error", "message": "Invalid or missing ISBN"}), 400

    if not isbn_already_in_database(isbn):
        return jsonify(
            {"status": "error", "message": "Book not found in database"}
        ), 404

    # Get average value from database
    popularity = get_book_popularity_from_db(isbn)

    return jsonify({"status": "success", "data": as_json_dict(popularity)}), 200
