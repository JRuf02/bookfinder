from flask import Flask
from flask.testing import FlaskClient
from http_constants.status import HttpStatus

from .api_test_utils import insert_test_shelf_into_db
from .fixtures import app, client  # noqa: F401


def test_fetch_shelf_metadata_invalid_osm_id(client: FlaskClient) -> None:
    response = client.get(
        "/api/shelf/metadata",
        query_string={
            "osm_id": "invalid_osm_id",
        },
    )
    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "osm_id missing or invalid"


def test_fetch_shelf_metadata_found_in_db(client: FlaskClient) -> None:
    insert_test_shelf_into_db(client.application)
    response = client.get(
        "/api/shelf/metadata",
        query_string={
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
        },
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == {
        "address": None,
        "latitude": 48.0998168,
        "longitude": 8.0546482,
        "name": "test shelf",
        "openingHours": None,
        "operator": None,
        "osmCheckDate": None,
        "osmId": "https://www.openstreetmap.org/node/11935877522",
        "osmLastUpdated": None,
        "type": None,
        "website": None,
    }


def test_fetch_shelf_metadata_not_found_in_db(client: FlaskClient) -> None:
    response = client.get(
        "/api/shelf/metadata",
        query_string={
            "osm_id": "https://www.openstreetmap.org/node/3093755951",
        },
    )
    assert response.status_code == HttpStatus.NOT_FOUND.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "Shelf not found"


def test_get_books_in_shelf_invalid_osm_id(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_books_in_shelf_no_books(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_books_in_shelf_with_books(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_books_in_shelf_valid_osm_id_but_not_in_db(client: FlaskClient) -> None:
    raise NotImplementedError


def test_insert_book_to_missing_shelf(client: FlaskClient) -> None:
    response = client.post(
        "/api/shelf/insert",
        json={
            # valid osm_id, but not in db yet
            "osm_id": "https://www.openstreetmap.org/node/9999805317",
            "isbn": "9783486587234",
        },
    )
    assert response.status_code == HttpStatus.NOT_FOUND.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert "does not exist" in response.json["message"]
    # TODO: Test if number of books in catalog is still 0


def test_insert_missing_book_to_missing_shelf(app: Flask) -> None:
    raise NotImplementedError


def test_insert_missing_book_to_shelf(app: Flask) -> None:
    client = app.test_client()
    insert_test_shelf_into_db(app)

    response = client.post(
        "/api/shelf/insert",
        json={
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
            "isbn": "9783486587234",
        },
    )
    assert response.status_code == 200
    assert response.json is not None
    assert response.json["status"] == "success"

    response = client.get(
        "/api/shelf/books?osm_id=https://www.openstreetmap.org/node/11935877522"
    )
    assert response.status_code == 200
    assert response.json is not None
    assert len(response.json) == 1
    assert response.json[0]["isbn"] == "978-3-486-58723-4"


def test_insert_book_with_non_ascii_title(client: FlaskClient) -> None:
    raise NotImplementedError


def test_insert_book_to_shelf(client: FlaskClient) -> None:
    raise NotImplementedError


def test_insert_book_to_shelf_already_in_shelf(client: FlaskClient) -> None:
    raise NotImplementedError


def test_insert_book_to_shelf_invalid_isbn(client: FlaskClient) -> None:
    raise NotImplementedError


def test_insert_book_to_shelf_invalid_osm_id(client: FlaskClient) -> None:
    raise NotImplementedError


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
