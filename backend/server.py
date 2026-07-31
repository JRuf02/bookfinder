"""Flask backend for the book sharing web app.

This file sets up the Flask application, defines API routes,
and initializes the database connection.
It serves as the main entry point for the backend server.
"""

import logging
from pathlib import Path

from flask import Flask, jsonify, request
from flask.typing import ResponseReturnValue
from flask_cors import CORS

from app.db.database import init_db
from app.routes.books import get_book_api_logic, get_book_popularity
from app.routes.bookshelves import get_all_bookshelves, get_nearby_bookshelves
from app.routes.catalog import search_in_catalog, single_term_search_in_catalog
from app.routes.covers import get_cover_by_isbn
from app.routes.manual_add import manually_add_book
from app.routes.shelf import (
    get_books_in_shelf,
    get_shelf_metadata,
    insert_book_to_shelf,
    remove_book_from_shelf,
)


def create_app(logging_level: int = logging.INFO) -> Flask:  # noqa: C901

    # Set up root logger
    logging.basicConfig(
        level=logging_level,
        format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
        datefmt="%H:%M:%S",  # remove this to also log date and ms
    )

    app = Flask(__name__)

    CORS(app)  # Enable CORS for all routes

    app.config["DB_PATH"] = Path(__file__).parent / "books.db"

    @app.route("/api/health", methods=["GET"])
    def health_check() -> ResponseReturnValue:
        return jsonify({"status": "success"}, 200)

    @app.route("/api/book", methods=["GET"])
    def get_book_api() -> ResponseReturnValue:
        return get_book_api_logic(request)

    # TODO: Tests for this endpoint!
    @app.route("/api/book/popularity", methods=["GET"])
    def get_book_popularity_api() -> ResponseReturnValue:
        return get_book_popularity(request)

    @app.route("/api/cover", methods=["GET"])
    def get_cover_api() -> ResponseReturnValue:
        return get_cover_by_isbn(request)

    @app.route("/api/bookshelves", methods=["GET"])
    def get_all_bookshelves_api() -> ResponseReturnValue:
        return get_all_bookshelves()

    @app.route("/api/bookshelves/nearby", methods=["GET"])  # TODO: Use this endpoint!
    def get_nearby_bookshelves_api() -> ResponseReturnValue:
        return get_nearby_bookshelves(request)

    @app.route("/api/shelf/metadata", methods=["GET"])
    def get_shelf_metadata_api() -> ResponseReturnValue:
        return get_shelf_metadata(request)

    @app.route("/api/shelf/books", methods=["GET"])
    def get_books_in_shelf_api() -> ResponseReturnValue:
        return get_books_in_shelf(request)

    @app.route("/api/shelf/insert", methods=["POST"])
    def insert_book_to_shelf_api() -> ResponseReturnValue:
        return insert_book_to_shelf(request)

    @app.route("/api/shelf/remove", methods=["POST"])
    def remove_book_from_shelf_api() -> ResponseReturnValue:
        return remove_book_from_shelf(request)

    @app.route("/api/catalog/search", methods=["GET"])
    def search_in_catalog_api() -> ResponseReturnValue:
        return search_in_catalog(request)

    @app.route("/api/catalog/search/single-term", methods=["GET"])
    def single_term_search_in_catalog_api() -> ResponseReturnValue:
        return single_term_search_in_catalog(request)

    @app.route("/api/manual-add", methods=["POST"])
    def manually_add_book_api() -> ResponseReturnValue:
        return manually_add_book(request)

    # Initialize the database
    init_db(app.config["DB_PATH"])

    return app


if __name__ == "__main__":
    # Start dev server with debug logging
    app = create_app(logging_level=logging.DEBUG)
    app.run(host="0.0.0.0", port=5000, debug=True)
