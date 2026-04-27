from flask import Flask
from flask.testing import FlaskClient
from http_constants.status import HttpStatus

from app.models.book import Book
from app.models.identifiers import Isbn

from .api_test_utils import insert_test_book_into_shelf_in_db, insert_test_shelf_into_db
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
    response = client.get(
        "/api/shelf/books",
        query_string={"osm_id": "popelstreetmap.org/node/11935877522"},
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "osm_id missing or invalid"


def test_get_books_in_shelf_no_books(client: FlaskClient) -> None:
    insert_test_shelf_into_db(
        client.application, osm_id="https://www.openstreetmap.org/node/11935877522"
    )

    response = client.get(
        "/api/shelf/books",
        query_string={"osm_id": "https://www.openstreetmap.org/node/11935877522"},
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == []


def test_get_books_in_shelf_with_books(client: FlaskClient) -> None:
    test_book_1 = Book(
        isbn=Isbn("978-3-453-43690-9"),
        title="Sprengstoff",
        author="King, Stephen",
        dnb_id="1028147899",
        cover_url="https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
    )

    test_book_2 = Book(
        isbn=Isbn("978-3-15-000001-4"),
        title="Faust",
        author="Goethe, Johann Wolfgang von",
        dnb_id="1027780482",
    )

    test_book_3 = Book(
        isbn=Isbn("978-3-473-58526-7"),
        title="Test Book 3",
        author="Author, Example",
        dnb_id="12347",
    )

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(
        client.application,
        test_book_1,
        osm_id="https://www.openstreetmap.org/node/11935877522",
    )
    insert_test_book_into_shelf_in_db(
        client.application,
        test_book_2,
        osm_id="https://www.openstreetmap.org/node/11935877522",
    )
    insert_test_book_into_shelf_in_db(
        client.application,
        test_book_3,
        osm_id="https://www.openstreetmap.org/node/3093755951",  # other shelf
    )

    response = client.get(
        "/api/shelf/books",
        query_string={"osm_id": "https://www.openstreetmap.org/node/11935877522"},
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == [
        {
            "isbn": "978-3-453-43690-9",
            "title": "Sprengstoff",
            "author": "King, Stephen",
            "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
            "dnbId": "1028147899",
        },
        {
            "isbn": "978-3-15-000001-4",
            "title": "Faust",
            "author": "Goethe, Johann Wolfgang von",
            "coverUrl": None,
            "dnbId": "1027780482",
        },
    ]


def test_get_books_in_shelf_valid_osm_id_but_not_in_db(client: FlaskClient) -> None:
    response = client.get(
        "/api/shelf/books",
        query_string={"osm_id": "https://www.openstreetmap.org/node/11935877522"},
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == []  # TODO: Maybe return 404 instead? -> hard


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
    assert response.json["status"] == "success"
    assert len(response.json["data"]) == 1
    assert response.json["data"][0]["isbn"] == "978-3-486-58723-4"


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
