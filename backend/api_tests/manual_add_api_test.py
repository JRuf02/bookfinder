from flask.testing import FlaskClient
from http_constants.status import HttpStatus

from app.models.book import Book
from app.models.identifiers import Isbn

from .api_test_utils import (
    assert_fuzzy_search_tables_contain_only_book,
    assert_fuzzy_search_tables_empty,
    get_number_of_books_in_table_books,
    get_number_of_entries_in_table_current_catalog,
    get_number_of_shelves_in_table_bookshelves,
    insert_test_book_into_books_table_in_db,
)


def test_manually_add_book_missing_isbn(client: FlaskClient) -> None:
    response = client.post(
        "/api/manual-add",
        json={"title": "Test Book", "author": "Author, Test"},
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "Invalid or missing ISBN"

    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 0
    assert_fuzzy_search_tables_empty(client.application)


def test_manually_add_book_invalid_isbn(client: FlaskClient) -> None:
    response = client.post(
        "/api/manual-add",
        json={
            "isbn": "978-3-45-6-7-89876-9",
            "title": "Test Book",
            "author": "Author, Test",
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "Invalid or missing ISBN"

    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 0
    assert_fuzzy_search_tables_empty(client.application)


def test_manually_add_book_missing_title(client: FlaskClient) -> None:
    response = client.post(
        "/api/manual-add",
        json={"isbn": "978-1-5266-2658-5", "author": "Author, Test"},
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "Missing title"

    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 0
    assert_fuzzy_search_tables_empty(client.application)


def test_manually_add_book_missing_author(client: FlaskClient) -> None:
    response = client.post(
        "/api/manual-add",
        json={"isbn": "978-1-5266-2658-5", "title": "Test Book"},
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "Missing author"

    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 0
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 0
    assert_fuzzy_search_tables_empty(client.application)


def test_manually_add_book_book_not_in_db_and_not_in_dnb(client: FlaskClient) -> None:
    isbn = Isbn.parse("978-1-5266-2658-5")
    assert isbn is not None

    response = client.post(
        "/api/manual-add",
        json={
            "isbn": "978-1-5266-2658-5",
            "title": "Harry Potter 1 and the Philosopher's Stone.",
            "author": "J. K. Rowling",
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == {
        "isbn": "978-1-5266-2658-5",
        "title": "Harry Potter 1 and the Philosopher's Stone.",
        "author": "J. K. Rowling",
        "dnbId": "",
        "coverUrl": None,
    }

    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 0
    assert_fuzzy_search_tables_contain_only_book(
        client.application,
        Book(
            isbn=isbn,
            title="Harry Potter 1 and the Philosopher's Stone.",
            author="J. K. Rowling",
            dnb_id="",
            cover_url=None,
        ),
    )


def test_manually_add_book_existing_metadata_matches(client: FlaskClient) -> None:
    isbn = Isbn.parse("978-3-453-43690-9")
    assert isbn is not None

    insert_test_book_into_books_table_in_db(client.application)

    response = client.post(
        "/api/manual-add",
        json={
            "isbn": "978-3-453-43690-9",
            "title": "Sprengstoff",
            "author": "King, Stephen",
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == {
        "isbn": "978-3-453-43690-9",
        "title": "Sprengstoff",
        "author": "King, Stephen",
        "dnbId": "1028147899",
        "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
    }

    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 0
    assert_fuzzy_search_tables_contain_only_book(
        client.application,
        Book(
            isbn=isbn,
            title="Sprengstoff",
            author="King, Stephen",
            dnb_id="1028147899",
            cover_url="https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
        ),
    )


def test_manually_add_book_existing_metadata_differs(client: FlaskClient) -> None:
    isbn = Isbn.parse("978-3-453-43690-9")
    assert isbn is not None

    insert_test_book_into_books_table_in_db(client.application)

    response = client.post(
        "/api/manual-add",
        json={
            "isbn": "978-3-453-43690-9",
            "title": "Sprengstoff",
            "author": "Author, Different",
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "warning"
    assert (
        response.json["message"]
        == "Book already exists with different metadata. Using existing metadata."
    )
    assert response.json["data"] == {
        "isbn": "978-3-453-43690-9",
        "title": "Sprengstoff",
        "author": "King, Stephen",
        "dnbId": "1028147899",
        "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
    }

    assert get_number_of_entries_in_table_current_catalog(client.application) == 0
    assert get_number_of_books_in_table_books(client.application) == 1
    assert get_number_of_shelves_in_table_bookshelves(client.application) == 0
    assert_fuzzy_search_tables_contain_only_book(
        client.application,
        Book(
            isbn=isbn,
            title="Sprengstoff",
            author="King, Stephen",
            dnb_id="1028147899",
            cover_url="https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
        ),
    )
