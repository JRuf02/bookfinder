import time

from flask.testing import FlaskClient
from http_constants.status import HttpStatus

from app.models.book import Book
from app.models.identifiers import Isbn

from .api_test_utils import (
    assert_fuzzy_search_tables_contain_only_book,
    get_number_of_books_in_table_books,
    get_number_of_entries_in_table_current_catalog,
    get_number_of_shelves_in_table_bookshelves,
    get_time_of_entry_of_book_in_shelf,
    insert_test_book_into_shelf_in_db,
    insert_test_shelf_into_db,
)


def test_remove_book_from_completely_missing_shelf(client: FlaskClient) -> None:
    """Remove a book from a shelf that has a valid osm_id,
    but does not exist in the database at all.
    """

    # Add a real shelf to ensure it does not get deleted
    insert_test_shelf_into_db(
        app=client.application,
        osm_id="https://www.openstreetmap.org/node/11935877522",
    )
    insert_test_book_into_shelf_in_db(
        app=client.application,
        osm_id="https://www.openstreetmap.org/node/11935877522",
    )

    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1

    response = client.post(
        "/api/shelf/remove",
        json={
            # valid osm_id, but neither in bookshelves nor in current_catalog
            "osm_id": "https://www.openstreetmap.org/node/111111",
            "isbn": "978-3-453-43690-9",
        },
    )

    assert response.status_code == HttpStatus.NOT_FOUND.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert (
        response.json["message"]
        == "Shelf with OSM ID https://www.openstreetmap.org/node/111111 does not exist."
    )

    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1


def test_remove_missing_book_from_missing_shelf(client: FlaskClient) -> None:
    """Test removing a book that is missing in the local database,
    from a shelf that is also missing in the local database.
    """
    response = client.post(
        "/api/shelf/remove",
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
    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 0


def test_remove_missing_book_from_shelf(client: FlaskClient) -> None:
    """Test removing a book that is missing in the local database."""

    insert_test_shelf_into_db(client.application)  # node/11935877522

    # Other books that are really in the shelf should not be removed
    insert_test_book_into_shelf_in_db(client.application)  # 978-3-453-43690-9

    response = client.post(
        "/api/shelf/remove",
        json={
            # valid osm_id, shelf in the db
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
            "isbn": "978-3-551-35401-3",  # valid isbn, but not in db yet
        },
    )

    assert response.status_code == HttpStatus.NOT_FOUND.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert (
        response.json["message"]
        == "Book with ISBN 978-3-551-35401-3 not found in shelf https://www.openstreetmap.org/node/11935877522."
    )

    # Number of books in catalog and in the books table should not change
    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1


def test_remove_book_from_shelf_book_twice_in_shelf(client: FlaskClient) -> None:
    """Test removing a book from a shelf that contains the same book twice."""

    insert_test_shelf_into_db(client.application)  # node/11935877522

    # Insert the same book twice into the same shelf
    insert_test_book_into_shelf_in_db(client.application)  # 978-3-453-43690-9
    time.sleep(1)  # ensure different timestamps for the two entries
    insert_test_book_into_shelf_in_db(client.application)  # 978-3-453-43690-9

    times_of_entry = get_time_of_entry_of_book_in_shelf(
        client.application,
        osm_id="https://www.openstreetmap.org/node/11935877522",
        isbn="978-3-453-43690-9",
    )
    assert len(times_of_entry) == 2
    assert times_of_entry[0] < times_of_entry[1]

    assert get_number_of_entries_in_table_current_catalog(client.application) == 2
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1

    response = client.post(
        "/api/shelf/remove",
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
        == "Book 978-3-453-43690-9 removed from shelf https://www.openstreetmap.org/node/11935877522."
    )

    # Book should have been removed only once from the shelf
    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1

    # If two identical books are in the shelf, the older one should be removed.
    new_times_of_entry = get_time_of_entry_of_book_in_shelf(
        client.application,
        osm_id="https://www.openstreetmap.org/node/11935877522",
        isbn="978-3-453-43690-9",
    )
    assert len(new_times_of_entry) == 1
    assert new_times_of_entry[0] == times_of_entry[1]


def test_remove_book_from_shelf_containing_only_that_book(
    client: FlaskClient,
) -> None:
    """Test removing a book from a shelf that contains only that book."""

    insert_test_shelf_into_db(client.application)  # node/11935877522
    insert_test_book_into_shelf_in_db(client.application)  # 978-3-453-43690-9

    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1
    assert_fuzzy_search_tables_contain_only_book(
        client.application,
        Book(
            isbn=Isbn("978-3-453-43690-9"),
            title="Sprengstoff",
            author="King, Stephen",
            dnb_id="1028147899",
        ),
    )

    response = client.post(
        "/api/shelf/remove",
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
        == "Book 978-3-453-43690-9 removed from shelf https://www.openstreetmap.org/node/11935877522."
    )

    # Only remove the book entity from its shelf aka from current_catalog
    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    # Keep book metadata
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1
    assert_fuzzy_search_tables_contain_only_book(
        client.application,
        Book(
            isbn=Isbn("978-3-453-43690-9"),
            title="Sprengstoff",
            author="King, Stephen",
            dnb_id="1028147899",
        ),
    )


def test_remove_book_from_shelf_other_books_in_shelf(
    client: FlaskClient,
) -> None:
    """Test removing a book from a shelf that also contains other books."""

    insert_test_shelf_into_db(client.application)  # node/11935877522
    insert_test_book_into_shelf_in_db(client.application)  # 978-3-453-43690-9

    other_book = Book(
        isbn=Isbn("978-3-551-35401-3"),
        title="Harry Potter und der Stein der Weisen",
        author="Rowling, J.K.",
        dnb_id="12345",
    )
    insert_test_book_into_shelf_in_db(client.application, other_book)

    assert get_number_of_entries_in_table_current_catalog(client.application) == 2
    assert get_number_of_books_in_table_books(client.application) == 2
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1

    response = client.post(
        "/api/shelf/remove",
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
        == "Book 978-3-453-43690-9 removed from shelf https://www.openstreetmap.org/node/11935877522."
    )

    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 2
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1

    response = client.get(
        "/api/shelf/books",
        query_string={"osm_id": "https://www.openstreetmap.org/node/11935877522"},
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert len(response.json["data"]) == 1
    assert response.json["data"][0]["book"] == {
        "isbn": "978-3-551-35401-3",
        "title": "Harry Potter und der Stein der Weisen",
        "author": "Rowling, J.K.",
        "dnbId": "12345",
        "coverUrl": None,
    }
    assert response.json["data"][0]["entityId"] == 2


def test_remove_book_from_shelf_not_containing_book(client: FlaskClient) -> None:
    """Test removing a book from a shelf that does not contain the book."""

    insert_test_shelf_into_db(
        client.application,
        osm_id="https://www.openstreetmap.org/node/11935877522",
    )
    insert_test_shelf_into_db(
        client.application,
        osm_id="https://www.openstreetmap.org/node/3093755951",
    )

    # The book is in another shelf, but not in the shelf we want to remove it from
    insert_test_book_into_shelf_in_db(
        client.application,
        osm_id="https://www.openstreetmap.org/node/11935877522",
    )  # 978-3-453-43690-9

    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 2

    response = client.post(
        "/api/shelf/remove",
        json={
            "osm_id": "https://www.openstreetmap.org/node/3093755951",
            "isbn": "978-3-453-43690-9",
        },
    )

    assert response.status_code == HttpStatus.NOT_FOUND.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert (
        response.json["message"]
        == "Book with ISBN 978-3-453-43690-9 not found in shelf https://www.openstreetmap.org/node/3093755951."
    )
    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 2


def test_remove_book_from_shelf_invalid_isbn(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)  # node/11935877522
    insert_test_book_into_shelf_in_db(client.application)  # 978-3-453-43690-9

    response = client.post(
        "/api/shelf/remove",
        json={
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
            "isbn": "978-3-453-43690-9-1234-567",  # invalid isbn
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "isbn not provided or invalid"

    # Number of books in catalog and in the books table should still be 1
    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1


def test_remove_book_from_shelf_missing_isbn(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)  # node/11935877522
    insert_test_book_into_shelf_in_db(client.application)

    response = client.post(
        "/api/shelf/remove",
        json={
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "isbn not provided or invalid"

    # Number of books in catalog and in the books table should still be 1
    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1


def test_remove_book_from_shelf_invalid_osm_id(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)  # node/11935877522
    insert_test_book_into_shelf_in_db(client.application)  # 978-3-453-43690-9

    response = client.post(
        "/api/shelf/remove",
        json={
            "osm_id": "https://www.youtube.com/watch?v=3San3uKKHgg",
            "isbn": "978-3-453-43690-9",
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "osm_id not provided or invalid"

    # Number of books in catalog and in the books table should still be 1
    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1


def test_remove_book_from_shelf_missing_osm_id(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)  # node/11935877522
    insert_test_book_into_shelf_in_db(client.application)  # 978-3-453-43690-9

    response = client.post(
        "/api/shelf/remove",
        json={
            "isbn": "978-3-453-43690-9",
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "osm_id not provided or invalid"

    # Number of books in catalog and in the books table should still be 1
    assert get_number_of_entries_in_table_current_catalog(client.application) == 1
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 1
