import logging

from flask import Request, jsonify
from flask.typing import ResponseReturnValue

from app.db.book_db import save_book_to_db
from app.db.database_utils import book_already_in_database
from app.models.book import Book
from app.models.identifiers import Isbn
from app.routes.books import get_book
from app.utils.naming import as_json_dict

logger = logging.getLogger(__name__)


def manually_add_book(request: Request) -> ResponseReturnValue:
    """Add a book to the table 'books' of the database.

    This endpoint is intended to be used when a book is neither found in the local
    database, nor in the DNB (this could be the case for a book that wasn't published
    in Germany).
    Checks if the ISBN already exists in the database or DNB, and if not, adds the book
    with the provided metadata.
    If the metadata from database or DNB is different from the provided metadata for
    the given ISBN, the DNB metadata is used and a warning is returned.

    Request body (JSON):
    - isbn: ISBN of the book (required, either ISBN-10 or ISBN-13)
    - title: Title of the book (required)
    - author: Author of the book (required)

    Returns:
    - 200 OK with book data if the book was successfully added or already exists
    - 200 OK with "warning" and real metadata if different data found for the given ISBN
    - 400 Bad Request if the input data is invalid or incomplete

    """

    # Validate and parse input
    data = request.get_json(silent=True) or {}
    isbn = Isbn.parse(data.get("isbn"))
    title = data.get("title")
    author = data.get("author")

    if not isbn:
        return jsonify({"status": "error", "message": "Invalid or missing ISBN"}), 400

    if not title:
        return jsonify({"status": "error", "message": "Missing title"}), 400

    if not author:
        return jsonify({"status": "error", "message": "Missing author"}), 400

    # Fetch book metadata from local database or DNB
    book = get_book(isbn)  # Inserts book into DB if not yet in DB but found in DNB

    if not book:
        # If book not found in DB or DNB, create a new book with the provided metadata
        book = Book(isbn=isbn, title=title, author=author, dnb_id="", cover_url=None)
        save_book_to_db(book)
        return jsonify({"status": "success", "data": as_json_dict(book)}), 200

    # If book found, check if metadata matches
    if book.title != title or book.author != author:
        logger.warning(
            "Provided metadata for ISBN %s does not match existing data.",
            str(isbn),
        )
        # Book should already be in database (but better safe than sorry)
        if not book_already_in_database(book):
            save_book_to_db(book)

        return jsonify(
            {
                "status": "warning",
                "message": (
                    "Book already exists with different metadata. "
                    "Using existing metadata."
                ),
                "data": as_json_dict(book),
            }
        ), 200

    # Book should already be in database (but better safe than sorry)
    if not book_already_in_database(book):
        save_book_to_db(book)

    return jsonify({"status": "success", "data": as_json_dict(book)}), 200
