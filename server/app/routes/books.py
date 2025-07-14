from app.utils.isbn_utils import normalize_isbn
from app.db.book_db import get_book_from_database, save_book_to_db
from app.dnb_api import fetch_book_from_dnb
from app.models.book import Book
from dataclasses import asdict
from flask import jsonify, Response, Request

def get_book(request: Request) -> Response:
    """Fetch book data by ISBN, first from local DB, then from DNB if not found."""
    isbn = request.args.get('isbn')
    if not isbn:
        return jsonify({"error": "ISBN parameter is required"}), 400

    # Normalize ISBN (remove spaces, dashes etc.)
    isbn = normalize_isbn(isbn)
    print(f"Normalized ISBN: {isbn}")  # TODO: add logger

    # 1. Try to get book from local DB
    book = get_book_from_database(isbn)
    if book:
        print(f"Book found in DB: {book}")  # TODO: add logger
        return jsonify(asdict(book))
    print(f"Book not found in DB for ISBN: {isbn}")  # TODO: add logger

    # 2. If not found, fetch from DNB and cache it
    book = fetch_book_from_dnb(isbn)
    print(f"Fetched book data from dnb: {book}")  # TODO: add logger
    if book.title != "Error fetching data" and book.title != "Unknown Title":
        save_book_to_db(book)

    return jsonify(asdict(book))