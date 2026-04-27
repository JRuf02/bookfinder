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

# TODO: Split into smaller files


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

    insert_test_book_into_books_table_in_db(client.application)

    response = client.post(
        "/api/shelf/insert",
        json={
            # valid osm_id, but not in db yet
            "osm_id": "https://www.openstreetmap.org/node/9999805317",
            "isbn": "978-3-453-43690-9",
        },
    )
    assert response.status_code == HttpStatus.NOT_FOUND.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert "Shelf with osm_id " in response.json["message"]
    assert " does not exist" in response.json["message"]
    # Number of books in the catalog should still be 0
    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    # We added the book manually to the books (metadata) table
    assert get_number_of_books_in_table_books(client.application) == 1
    # No shelves should be added to the shelf table
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 0


def test_insert_missing_book_to_missing_shelf(client: FlaskClient) -> None:
    """Test inserting a book that is missing in the local database,
    into a shelf that is also missing in the local database.
    """

    response = client.post(
        "/api/shelf/insert",
        json={
            # valid osm_id, but not in db yet
            "osm_id": "https://www.openstreetmap.org/node/9999805317",
            "isbn": "978-3-453-43690-9",  # valid isbn, but not in db yet
        },
    )
    assert response.status_code == HttpStatus.NOT_FOUND.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert "Shelf with osm_id " in response.json["message"]
    assert " does not exist" in response.json["message"]
    # Number of books in catalog and in the books table should still be 0
    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 0


def test_insert_missing_book_to_shelf(app: Flask) -> None:
    """Test inserting a book that is missing in the books table of the local database,
    but can be found in the DNB.
    """

    client = app.test_client()
    insert_test_shelf_into_db(app)

    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1

    response = client.post(
        "/api/shelf/insert",
        json={
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
            "isbn": "9783486587234",  # valid isbn, but not in db yet
        },
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert (
        response.json["message"]
        == "Book 978-3-486-58723-4 inserted into shelf https://www.openstreetmap.org/node/11935877522."
    )

    response = client.get(
        "/api/shelf/books?osm_id=https://www.openstreetmap.org/node/11935877522"
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert len(response.json["data"]) == 1
    assert response.json["data"][0]["isbn"] == "978-3-486-58723-4"

    # Book should now be added to the current_catalog and to the books table.
    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1


def test_insert_missing_non_dnb_book_to_shelf(app: Flask) -> None:
    """Test inserting a book that is missing in the books table of the local database,
    that can also not be found in the DNB.
    """
    client = app.test_client()
    insert_test_shelf_into_db(app)

    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1

    response = client.post(
        "/api/shelf/insert",
        json={
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
            "isbn": "978-1-5266-2658-5",  # valid isbn, but not in the DNB catalog
        },
    )
    assert response.status_code == HttpStatus.NOT_FOUND.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "Book metadata not found"

    response = client.get(
        "/api/shelf/books?osm_id=https://www.openstreetmap.org/node/11935877522"
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert len(response.json["data"]) == 0

    # Book should not have been added.
    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1


def test_insert_book_with_non_ascii_title(client: FlaskClient) -> None:

    non_ascii_book = Book(
        isbn=Isbn("978-1-5266-2658-5"),
        title="Téstbûck with nön-ÄSCII chäräctérs 😀äöüß?3e",
        author="Authör, Exämple",
        dnb_id="1234567890",
    )

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_books_table_in_db(app=client.application, book=non_ascii_book)

    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1

    response = client.post(
        "/api/shelf/insert",
        json={
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
            "isbn": "978-1-5266-2658-5",
        },
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert (
        response.json["message"]
        == "Book 978-1-5266-2658-5 inserted into shelf https://www.openstreetmap.org/node/11935877522."
    )

    response = client.get(
        "/api/shelf/books?osm_id=https://www.openstreetmap.org/node/11935877522"
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert len(response.json["data"]) == 1
    assert response.json["data"][0]["isbn"] == "978-1-5266-2658-5"
    assert response.json["data"][0]["author"] == "Authör, Exämple"
    assert response.json["data"][0]["dnbId"] == "1234567890"
    assert response.json["data"][0]["coverUrl"] is None
    assert (
        response.json["data"][0]["title"]
        == "Téstbûck with nön-ÄSCII chäräctérs 😀äöüß?3e"
    )

    # Book should now be added to the current_catalog and still be in the books table.
    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1


def test_insert_book_to_shelf_other_books_already_in_shelf(client: FlaskClient) -> None:

    already_in_shelf_book = Book(
        isbn=Isbn("978-1-5266-2658-5"),
        title="Harry Potter and the Test Book that is already in the Shelf",
        author="Rowling, J.K.",
        dnb_id="1234567890",
    )

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(
        app=client.application, book=already_in_shelf_book
    )

    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1

    response = client.post(
        "/api/shelf/insert",
        json={
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
            "isbn": "978-3-453-43690-9",
        },
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert (
        response.json["message"]
        == "Book 978-3-453-43690-9 inserted into shelf https://www.openstreetmap.org/node/11935877522."
    )

    response = client.get(
        "/api/shelf/books?osm_id=https://www.openstreetmap.org/node/11935877522"
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert len(response.json["data"]) == 2
    assert response.json["data"] == [
        {
            "author": "Rowling, J.K.",
            "coverUrl": None,
            "dnbId": "1234567890",
            "isbn": "978-1-5266-2658-5",
            "title": "Harry Potter and the Test Book that is already in the Shelf",
        },
        {
            "author": "King, Stephen",
            "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
            "dnbId": "1028147899",
            "isbn": "978-3-453-43690-9",
            "title": "Sprengstoff",
        },
    ]

    assert get_number_of_entries_in_table_current_catalog(client.application) == 2
    assert get_number_of_books_in_table_books(client.application) == 2
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1


def test_insert_book_to_shelf_same_book_already_in_shelf(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)

    # insert book the first time
    response = client.post(
        "/api/shelf/insert",
        json={
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
            "isbn": "978-3-453-43690-9",
        },
    )
    assert response.status_code == HttpStatus.OK.value

    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1

    # insert same book again
    response = client.post(
        "/api/shelf/insert",
        json={
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
            "isbn": "978-3-453-43690-9",
        },
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert (
        response.json["message"]
        == "Book 978-3-453-43690-9 inserted into shelf https://www.openstreetmap.org/node/11935877522."
    )

    response = client.get(
        "/api/shelf/books?osm_id=https://www.openstreetmap.org/node/11935877522"
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert len(response.json["data"]) == 2
    assert response.json["data"] == [
        {
            "author": "King, Stephen",
            "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
            "dnbId": "1028147899",
            "isbn": "978-3-453-43690-9",
            "title": "Sprengstoff",
        },
        {
            "author": "King, Stephen",
            "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
            "dnbId": "1028147899",
            "isbn": "978-3-453-43690-9",
            "title": "Sprengstoff",
        },
    ]

    assert get_number_of_entries_in_table_current_catalog(client.application) == 2
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1


def test_insert_book_to_shelf_invalid_isbn(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)

    response = client.post(
        "/api/shelf/insert",
        json={
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
            "isbn": "978-3-45-8-3-43690-9",
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "isbn not provided or invalid"

    # Number of books in catalog and in the books table should still be 0
    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1


def test_insert_book_to_shelf_missing_isbn(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)

    response = client.post(
        "/api/shelf/insert",
        json={
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "isbn not provided or invalid"

    # Number of books in catalog and in the books table should still be 0
    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1


def test_insert_book_to_shelf_invalid_osm_id(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)

    response = client.post(
        "/api/shelf/insert",
        json={
            "osm_id": "https://www.youtube.com/watch?v=3San3uKKHgg",
            "isbn": "978-3-45-8-3-43690-9",
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "osm_id not provided or invalid"

    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1


def test_insert_book_to_shelf_missing_osm_id(client: FlaskClient) -> None:

    response = client.post(
        "/api/shelf/insert",
        json={
            "isbn": "978-3-45-8-3-43690-9",
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "osm_id not provided or invalid"

    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 0


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
