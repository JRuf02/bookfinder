from flask import Flask
from flask.testing import FlaskClient
from http_constants.status import HttpStatus

from api_tests.api_test_utils import insert_test_shelf_into_db

from .fixtures import app, client  # noqa: F401


def test_get_all_bookshelves_empty(client: FlaskClient) -> None:
    response = client.get("/api/bookshelves")
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == []


def test_get_all_bookshelves_with_data(app: Flask) -> None:
    insert_test_shelf_into_db(app)

    client = app.test_client()
    response = client.get("/api/bookshelves")
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == [
        {
            "address": None,
            "latitude": 48.099817,
            "longitude": 8.054648,
            "name": "test shelf",
            "openingHours": None,
            "operator": None,
            "osmCheckDate": None,
            "osmId": "https://www.openstreetmap.org/node/11935877522",
            "osmLastUpdated": None,
            "type": None,
            "website": None,
        }
    ]


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
