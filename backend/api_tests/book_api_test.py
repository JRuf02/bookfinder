from flask.testing import FlaskClient

from app.db.database import db_cursor

from .fixtures import app, client


def test_get_book_with_invalid_isbn(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_book_not_in_db(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_book_not_in_db_not_in_dnb(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_book_in_db(client: FlaskClient) -> None:
    raise NotImplementedError
