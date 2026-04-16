"""Flask backend for the book sharing web app."""

import logging

from app.db.database import init_db
from app.routes.books import get_book
from app.routes.bookshelves import get_all_bookshelves, get_nearby_bookshelves
from app.routes.catalog import search_in_catalog
from app.routes.covers import get_cover_by_dnb_isbn
from app.routes.shelf import (
    get_books_in_shelf,
    get_shelf_metadata,
    insert_book_to_shelf,
    remove_book_from_shelf,
)
from flask import Flask, jsonify, request
from flask.typing import ResponseReturnValue
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route("/api/health", methods=["GET"])
def health_check() -> ResponseReturnValue:
    return jsonify({"status": "ok"}, 200)


@app.route("/api/books", methods=["GET"])
def get_book_api() -> ResponseReturnValue:
    return get_book(request)


@app.route("/api/covers", methods=["GET"])
def get_cover_api() -> ResponseReturnValue:
    return get_cover_by_dnb_isbn(request)


@app.route("/api/bookshelves", methods=["GET"])
def get_all_bookshelves_api() -> ResponseReturnValue:
    return get_all_bookshelves()


@app.route("/api/bookshelves/nearby", methods=["GET"])
def get_nearby_bookshelves_api() -> ResponseReturnValue:
    return get_nearby_bookshelves(request)


@app.route("/api/shelf/metadata", methods=["GET"])
def get_shelf_metadata_api() -> ResponseReturnValue:
    return get_shelf_metadata(request)


@app.route("/api/shelf/books", methods=["GET"])
def get_books_in_shelf_api() -> ResponseReturnValue:
    return get_books_in_shelf(request)


@app.route("/api/catalog/search", methods=["GET"])
def search_in_catalog_api() -> ResponseReturnValue:
    return search_in_catalog(request)


@app.route("/api/shelf/insert", methods=["POST"])
def insert_book_to_shelf_api() -> ResponseReturnValue:
    return insert_book_to_shelf(request)


@app.route("/api/shelf/remove", methods=["POST"])
def remove_book_from_shelf_api() -> ResponseReturnValue:
    return remove_book_from_shelf(request)


if __name__ == "__main__":
    # Set up root logger
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
        datefmt="%H:%M:%S",  # remove to also log date and ms
    )
    # Initialize the database
    init_db()
    # Start the server
    app.run(host="0.0.0.0", port=5000, debug=True)
