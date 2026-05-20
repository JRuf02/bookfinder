from flask.testing import FlaskClient
from http_constants.status import HttpStatus

from app.models.book import Book
from app.models.identifiers import Isbn

from .api_test_utils import (
    insert_test_book_into_shelf_in_db,
    insert_test_shelf_into_db,
)


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
        client.application,
        osm_id="https://www.openstreetmap.org/node/11935877522",
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
    assert len(response.json["data"]) == 2

    for i in range(2):
        assert response.json["data"][i].keys() == {
            "book",
            "locatedShelf",
            "entityId",
            "inShelfSince",
        }
        assert response.json["data"][i]["locatedShelf"] is None
        assert response.json["data"][i]["entityId"] == 2 - i
        assert response.json["data"][i]["inShelfSince"] is not None

    assert response.json["data"][1]["book"] == {
        "author": "King, Stephen",
        "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
        "dnbId": "1028147899",
        "isbn": "978-3-453-43690-9",
        "title": "Sprengstoff",
    }

    # most recently inserted book should be first in the list
    assert response.json["data"][0]["book"] == {
        "author": "Goethe, Johann Wolfgang von",
        "coverUrl": None,
        "dnbId": "1027780482",
        "isbn": "978-3-15-000001-4",
        "title": "Faust",
    }


def test_get_books_in_shelf_valid_osm_id_but_not_in_db(
    client: FlaskClient,
) -> None:
    response = client.get(
        "/api/shelf/books",
        query_string={"osm_id": "https://www.openstreetmap.org/node/11935877522"},
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == []  # TODO: Maybe return 404 instead? -> hard
