from flask.testing import FlaskClient

from app.db.database import db_cursor

from .fixtures import app, client


def test_search_in_catalog_none_title(client: FlaskClient) -> None:
    raise NotImplementedError


def test_search_in_catalog_title_contains_non_ascii_characters(
    client: FlaskClient,
) -> None:
    raise NotImplementedError


def test_search_in_catalog_title_empty_title_string(client: FlaskClient) -> None:
    raise NotImplementedError


def test_search_in_catalog_no_coordinates(client: FlaskClient) -> None:
    raise NotImplementedError


def test_search_in_catalog_nonfinite_coordinates(client: FlaskClient) -> None:
    raise NotImplementedError


def test_search_in_catalog_extreme_coordinates(client: FlaskClient) -> None:
    raise NotImplementedError


def test_search_in_catalog_book_not_in_catalog(client: FlaskClient) -> None:
    raise NotImplementedError


def test_search_in_catalog_empty_catalog(client: FlaskClient) -> None:
    raise NotImplementedError


def test_search_in_catalog_book_in_catalog(client: FlaskClient) -> None:
    raise NotImplementedError
