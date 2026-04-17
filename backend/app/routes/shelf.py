from flask import Request, jsonify
from flask.typing import ResponseReturnValue

from app.db.shelf_db import (
    get_books_in_shelf_from_db,
    get_shelf_metadata_from_db,
    insert_book_to_shelf_in_db,
    remove_book_from_shelf_in_db,
)


def get_shelf_metadata(request: Request) -> ResponseReturnValue:
    """Fetch metadata of the given shelf."""
    # TODO: Move api logic from db/shelf_db.py to here
    return get_shelf_metadata_from_db(request)


def get_books_in_shelf(request: Request) -> ResponseReturnValue:
    """Fetch all books from the given shelf."""
    # TODO: Move api logic from db/shelf_db.py to here
    return get_books_in_shelf_from_db(request)


def insert_book_to_shelf(request: Request) -> ResponseReturnValue:
    """Insert a book into the given shelf."""
    # TODO: Use function from utils to normalize ISBN / check if the db function
    #       uses it already
    data = request.json
    osm_id = data.get("osm_id")
    isbn = data.get("isbn")
    if not osm_id or not isbn:
        return jsonify({"error": "osm_id and isbn are required"}), 400
    # TODO: check if shelf and book exist
    insert_book_to_shelf_in_db(
        osm_id, isbn
    )  # todo: get a return value for success/failure
    # TODO: Only return success if book was actually inserted successfully
    return jsonify(
        {"status": "success", "message": f"Book {isbn} inserted to shelf {osm_id}."}
    )


def remove_book_from_shelf(request: Request) -> ResponseReturnValue:
    """Remove a book from the given shelf."""
    # TODO: Use function from utils to normalize ISBN / check if the db function
    #       uses it already
    data = request.json
    osm_id = data.get("osm_id")
    isbn = data.get("isbn")
    if not osm_id or not isbn:
        return jsonify({"error": "osm_id and isbn are required"}), 400
    # TODO: check if shelf and book exist
    remove_book_from_shelf_in_db(osm_id, isbn)  # todo check if successful
    # TODO: Only return success if book was actually removed successfully
    return jsonify(
        {"status": "success", "message": f"Book {isbn} removed from shelf {osm_id}."}
    )
