from flask.testing import FlaskClient

from .fixtures import app, client  # noqa: F401


def test_get_all_bookshelves_empty(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_all_bookshelves_with_data(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_nearby_bookshelves_no_location(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_nearby_bookshelves_invalid_location(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_nearby_bookshelves_no_radius(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_nearby_bookshelves_invalid_radius(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_nearby_bookshelves_no_shelves(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_nearby_bookshelves_no_nearby_shelves(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_nearby_bookshelves_with_nearby_shelves(client: FlaskClient) -> None:
    raise NotImplementedError
