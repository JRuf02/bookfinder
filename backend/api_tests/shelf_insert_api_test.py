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


def test_insert_book_to_missing_shelf(mocked_client: FlaskClient) -> None:

    insert_test_book_into_books_table_in_db(mocked_client.application)

    response = mocked_client.post(
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
    assert "Shelf with OSM ID " in response.json["message"]
    assert " does not exist" in response.json["message"]
    # Number of books in the catalog should still be 0
    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 0
    )
    # We added the book manually to the books (metadata) table
    assert get_number_of_books_in_table_books(mocked_client.application) == 1
    # No shelves should be added to the shelf table
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 0


def test_insert_missing_book_to_missing_shelf(mocked_client: FlaskClient) -> None:
    """Test inserting a book that is missing in the local database,
    into a shelf that is also missing in the local database.
    """

    response = mocked_client.post(
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
    assert "Shelf with OSM ID " in response.json["message"]
    assert " does not exist" in response.json["message"]
    # Number of books in catalog and in the books table should still be 0
    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 0
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 0


def test_insert_missing_book_to_shelf(mocked_app: Flask) -> None:
    """Test inserting a book that is missing in the books table of the local database,
    but can be found in the DNB.
    """

    mocked_client = mocked_app.test_client()
    insert_test_shelf_into_db(mocked_app)

    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 0
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 1

    response = mocked_client.post(
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

    response = mocked_client.get(
        "/api/shelf/books?osm_id=https://www.openstreetmap.org/node/11935877522"
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert len(response.json["data"]) == 1
    assert response.json["data"][0]["isbn"] == "978-3-486-58723-4"

    # Book should now be added to the current_catalog and to the books table.
    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 1
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 1


def test_insert_missing_non_dnb_book_to_shelf(mocked_app: Flask) -> None:
    """Test inserting a book that is missing in the books table of the local database,
    that can also not be found in the DNB.
    """
    mocked_client = mocked_app.test_client()
    insert_test_shelf_into_db(mocked_app)

    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 0
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 1

    response = mocked_client.post(
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

    response = mocked_client.get(
        "/api/shelf/books?osm_id=https://www.openstreetmap.org/node/11935877522"
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert len(response.json["data"]) == 0

    # Book should not have been added.
    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 0
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 1


def test_insert_book_with_non_ascii_title(mocked_client: FlaskClient) -> None:

    non_ascii_book = Book(
        isbn=Isbn("978-1-5266-2658-5"),
        title="Téstbûck with nön-ÄSCII chäräctérs 😀äöüß?3e",
        author="Authör, Exämple",
        dnb_id="1234567890",
    )

    insert_test_shelf_into_db(mocked_client.application)
    insert_test_book_into_books_table_in_db(
        app=mocked_client.application, book=non_ascii_book
    )

    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 0
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 1

    response = mocked_client.post(
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

    response = mocked_client.get(
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
    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 1
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 1


def test_insert_book_to_shelf_other_books_already_in_shelf(
    mocked_client: FlaskClient,
) -> None:

    already_in_shelf_book = Book(
        isbn=Isbn("978-1-5266-2658-5"),
        title="Harry Potter and the Test Book that is already in the Shelf",
        author="Rowling, J.K.",
        dnb_id="1234567890",
    )

    insert_test_shelf_into_db(mocked_client.application)
    insert_test_book_into_shelf_in_db(
        app=mocked_client.application, book=already_in_shelf_book
    )

    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 1
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 1

    response = mocked_client.post(
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

    response = mocked_client.get(
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
    ] or response.json["data"] == [  # TODO? define ordering for api/shelf/books?
        {
            "author": "King, Stephen",
            "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
            "dnbId": "1028147899",
            "isbn": "978-3-453-43690-9",
            "title": "Sprengstoff",
        },
        {
            "author": "Rowling, J.K.",
            "coverUrl": None,
            "dnbId": "1234567890",
            "isbn": "978-1-5266-2658-5",
            "title": "Harry Potter and the Test Book that is already in the Shelf",
        },
    ]

    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 2
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 2
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 1


def test_insert_book_to_shelf_same_book_already_in_shelf(
    mocked_client: FlaskClient,
) -> None:

    insert_test_shelf_into_db(mocked_client.application)

    # insert book the first time
    response = mocked_client.post(
        "/api/shelf/insert",
        json={
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
            "isbn": "978-3-453-43690-9",
        },
    )
    assert response.status_code == HttpStatus.OK.value

    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 1
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 1

    # insert same book again
    response = mocked_client.post(
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

    response = mocked_client.get(
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

    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 2
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 1


def test_insert_book_to_shelf_invalid_isbn(mocked_client: FlaskClient) -> None:

    insert_test_shelf_into_db(mocked_client.application)

    response = mocked_client.post(
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
    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 0
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 1


def test_insert_book_to_shelf_missing_isbn(mocked_client: FlaskClient) -> None:

    insert_test_shelf_into_db(mocked_client.application)

    response = mocked_client.post(
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
    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 0
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 1


def test_insert_book_to_shelf_invalid_osm_id(mocked_client: FlaskClient) -> None:

    insert_test_shelf_into_db(mocked_client.application)

    response = mocked_client.post(
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

    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 0
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 1


def test_insert_book_to_shelf_missing_osm_id(mocked_client: FlaskClient) -> None:

    response = mocked_client.post(
        "/api/shelf/insert",
        json={
            "isbn": "978-3-45-8-3-43690-9",
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "osm_id not provided or invalid"

    assert (
        get_number_of_entries_in_table_current_catalog(mocked_client.application) == 0
    )
    assert get_number_of_books_in_table_books(mocked_client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(mocked_client.application) == 0
