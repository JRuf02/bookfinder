from flask import Flask
from flask.testing import FlaskClient
from http_constants.status import HttpStatus

from app.models.book import Book
from app.models.identifiers import Isbn

from .api_test_utils import (
    get_number_of_books_in_table_books,
    get_number_of_entries_in_table_current_catalog,
    get_number_of_shelves_in_table_bookshelves,
    insert_test_book_into_books_table_in_db,
    insert_test_book_into_shelf_in_db,
    insert_test_shelf_into_db,
)
from .fixtures import app, client  # noqa: F401


def test_remove_book_from_missing_shelf(client: FlaskClient) -> None:
    raise NotImplementedError


def test_remove_missing_book_from_missing_shelf(app: Flask) -> None:
    raise NotImplementedError


def test_remove_missing_book_from_shelf(app: Flask) -> None:
    raise NotImplementedError


def test_remove_book_from_shelf(client: FlaskClient) -> None:
    raise NotImplementedError


def test_remove_book_from_shelf_not_containing_book(client: FlaskClient) -> None:
    raise NotImplementedError


def test_remove_book_from_shelf_invalid_isbn(client: FlaskClient) -> None:
    raise NotImplementedError


def test_remove_book_from_shelf_invalid_osm_id(client: FlaskClient) -> None:
    raise NotImplementedError
