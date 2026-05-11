from flask.testing import FlaskClient
from http_constants.status import HttpStatus

from api_tests.api_test_utils import (
    insert_test_book_into_shelf_in_db,
    insert_test_shelf_into_db,
)
from app.models.book import Book
from app.models.identifiers import Isbn


def test_search_in_catalog_title_none_author_none(mocked_client: FlaskClient) -> None:
    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": None,
            "lon": None,
            "title": None,
            "author": None,
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == ("Title or author must be given.")


def test_search_in_catalog_title_and_author_not_given(
    mocked_client: FlaskClient,
) -> None:
    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": None,
            "lon": None,
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == ("Title or author must be given.")


def test_search_in_catalog_title_and_author_empty_str(
    mocked_client: FlaskClient,
) -> None:
    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": None,
            "lon": None,
            "title": "",
            "author": "",
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == ("Title or author must be given.")


def test_search_in_catalog_no_author(mocked_client: FlaskClient) -> None:

    insert_test_shelf_into_db(mocked_client.application)
    insert_test_book_into_shelf_in_db(mocked_client.application)

    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": "48.012345",
            "lon": "8.2",
            "title": "Spre",
        },  # will be interpreted as author = None
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == [
        {
            "book": {
                "author": "King, Stephen",
                "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
                "dnbId": "1028147899",
                "isbn": "978-3-453-43690-9",
                "title": "Sprengstoff",
            },
            "locatedShelf": {
                "distanceMeters": 14536.422,
                "shelf": {
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
                },
            },
        }
    ]


def test_search_in_catalog_author_given_title_none(mocked_client: FlaskClient) -> None:

    insert_test_shelf_into_db(mocked_client.application)
    insert_test_book_into_shelf_in_db(mocked_client.application)

    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": None,
            "lon": None,
            "author": "Ste",
            "title": None,
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == [
        {
            "book": {
                "author": "King, Stephen",
                "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
                "dnbId": "1028147899",
                "isbn": "978-3-453-43690-9",
                "title": "Sprengstoff",
            },
            "locatedShelf": {
                "distanceMeters": None,
                "shelf": {
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
                },
            },
        }
    ]


def test_search_in_catalog_title_empty_string(mocked_client: FlaskClient) -> None:

    test_book = Book(
        isbn=Isbn("978-3-486-58723-4"),
        title="Test Book",
        author="Author, Test",  # DNB format for author name
        dnb_id="12345",
    )

    insert_test_shelf_into_db(mocked_client.application)
    insert_test_book_into_shelf_in_db(mocked_client.application, test_book)

    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": None,
            "lon": None,
            "title": "",
            "author": "Author, Test",
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == [
        {
            "book": {
                "isbn": "978-3-486-58723-4",
                "title": "Test Book",
                "author": "Author, Test",
                "coverUrl": None,
                "dnbId": "12345",
            },
            "locatedShelf": {
                "shelf": {
                    "osmId": "https://www.openstreetmap.org/node/11935877522",
                    "name": "test shelf",
                    "latitude": 48.0998168,
                    "longitude": 8.0546482,
                    "address": None,
                    "type": None,
                    "operator": None,
                    "website": None,
                    "openingHours": None,
                    "osmCheckDate": None,
                    "osmLastUpdated": None,
                },
                "distanceMeters": None,
            },
        }
    ]


def test_search_in_catalog_title_contains_non_ascii_characters(
    mocked_client: FlaskClient,
) -> None:

    test_book = Book(
        isbn=Isbn("978-3-486-58723-4"),
        title="😀äöüß?3e",
        author="Test Author",
        dnb_id="12345",
    )

    insert_test_shelf_into_db(mocked_client.application)
    insert_test_book_into_shelf_in_db(mocked_client.application, test_book)

    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": None,
            "lon": None,
            "title": "😀äöüß?3e",
            "author": None,
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == [
        {
            "book": {
                "isbn": "978-3-486-58723-4",
                "title": "😀äöüß?3e",
                "author": "Test Author",
                "coverUrl": None,
                "dnbId": "12345",
            },
            "locatedShelf": {
                "shelf": {
                    "osmId": "https://www.openstreetmap.org/node/11935877522",
                    "name": "test shelf",
                    "latitude": 48.0998168,
                    "longitude": 8.0546482,
                    "address": None,
                    "type": None,
                    "operator": None,
                    "website": None,
                    "openingHours": None,
                    "osmCheckDate": None,
                    "osmLastUpdated": None,
                },
                "distanceMeters": None,
            },
        }
    ]


def test_search_in_catalog_nonfinite_coordinates(mocked_client: FlaskClient) -> None:
    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": float("NaN"),
            "lon": float("inf"),
            "title": "Test",
            "author": None,
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == (
        "Invalid user coordinates: Latitude must be a finite number."
    )


def test_search_in_catalog_extreme_coordinates(mocked_client: FlaskClient) -> None:
    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": 50.3,
            "lon": 203.4,  # Invalid longitude
            "title": "Test",
            "author": None,
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == (
        "Invalid user coordinates: Longitude must be between -180 and 180. Got 203.4."
    )


def test_search_in_catalog_book_not_in_catalog(mocked_client: FlaskClient) -> None:

    insert_test_shelf_into_db(mocked_client.application)
    insert_test_book_into_shelf_in_db(mocked_client.application)  # Stephen King

    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": None,
            "lon": None,
            "author": None,
            "title": "Eragon",  # Not in catalog
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == []


def test_search_in_catalog_empty_catalog(mocked_client: FlaskClient) -> None:
    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": None,
            "lon": None,
            "author": None,
            "title": "Eragon",  # Not in catalog
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == []


def test_search_in_catalog_with_coordinates_book_not_in_catalog(
    mocked_client: FlaskClient,
) -> None:

    insert_test_shelf_into_db(mocked_client.application)
    insert_test_book_into_shelf_in_db(mocked_client.application)  # Stephen King

    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": 49,
            "lon": 8,
            "author": None,
            "title": "Eragon",  # Not in catalog
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == []


def test_search_in_catalog_by_author_and_title_with_coordinates(
    mocked_client: FlaskClient,
) -> None:

    insert_test_shelf_into_db(mocked_client.application)
    insert_test_book_into_shelf_in_db(mocked_client.application)

    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": 49.1234567891,
            "lon": 8.1234567891,
            "title": "spre",
            # Should be found even if author name in db is "King, Stephen"
            "author": "Stephen king",
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    # TODO: Improve search implementation to find the following book.
    #       Currently, this test is expected to fail (King, Stephen vs. Stephen king).
    assert response.json["data"] == [
        {
            "book": {
                "author": "King, Stephen",
                "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
                "dnbId": "1028147899",
                "isbn": "978-3-453-43690-9",
                "title": "Sprengstoff",
            },
            "locatedShelf": {
                "distanceMeters": None,  # TODO: Set distance
                "shelf": {
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
                },
            },
        }
    ]


def test_search_in_catalog_by_author_and_title_without_coordinates(
    mocked_client: FlaskClient,
) -> None:

    insert_test_shelf_into_db(mocked_client.application)
    insert_test_book_into_shelf_in_db(mocked_client.application)

    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": None,
            "lon": None,
            "title": "spre",
            # Should be found even if author name in db is "King, Stephen"
            "author": "Stephen king",
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    # TODO: Improve search implementation to find the following book.
    #       Currently, this test is expected to fail (King, Stephen vs. Stephen king).
    assert response.json["data"] == [
        {
            "book": {
                "author": "King, Stephen",
                "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
                "dnbId": "1028147899",
                "isbn": "978-3-453-43690-9",
                "title": "Sprengstoff",
            },
            "locatedShelf": {
                "distanceMeters": None,
                "shelf": {
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
                },
            },
        }
    ]


def test_search_in_catalog_author_name_formats(mocked_client: FlaskClient) -> None:
    """Search for 'Stephen King' or 'stephen king' should find books with author
    'King, Stephen' and 'Stephen Edwin King', but not 'Stephen Spielberg'.
    """

    test_book_1 = Book(
        isbn=Isbn("978-3-486-58723-4"),
        title="Test Book 1",
        author="King, Stephen",  # DNB format for author name
        dnb_id="12345",
    )

    # Other formats for the same author name,
    # should still find the book when searching for "test author"
    test_book_2 = Book(
        isbn=Isbn("978-3-473-58522-9"),
        title="Test Book 2",
        author="Stephen Edwin King",
        dnb_id="12346",
    )

    test_book_3 = Book(
        isbn=Isbn("978-3-473-58526-7"),
        title="Test Book 3",
        author="Stephen E. King",
        dnb_id="12347",
    )

    test_book_4 = Book(
        isbn=Isbn("978-3-15-000001-4"),
        title="Test Book 4",
        author="Stephen Spielberg",  # Should not be returned
        dnb_id="12348",
    )

    insert_test_shelf_into_db(mocked_client.application)
    insert_test_book_into_shelf_in_db(mocked_client.application, test_book_1)
    insert_test_book_into_shelf_in_db(mocked_client.application, test_book_2)
    insert_test_book_into_shelf_in_db(mocked_client.application, test_book_3)
    insert_test_book_into_shelf_in_db(mocked_client.application, test_book_4)

    response = mocked_client.get(
        "/api/catalog/search",
        query_string={
            "lat": None,
            "lon": None,
            "title": None,
            # Natural format for author, should still find the book
            "author": "stephen king",
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    # TODO: Improve search implementation to find the following books.
    #       Currently, this test is expected to fail.
    assert response.json["data"] == [
        {
            "book": {
                "isbn": "978-3-486-58723-4",
                "title": "Test Book 1",
                "author": "King, Stephen",
                "coverUrl": None,
                "dnbId": "12345",
            },
            "locatedShelf": {
                "shelf": {
                    "osmId": "https://www.openstreetmap.org/node/11935877522",
                    "name": "test shelf",
                    "latitude": 48.0998168,
                    "longitude": 8.0546482,
                    "address": None,
                    "type": None,
                    "operator": None,
                    "website": None,
                    "openingHours": None,
                    "osmCheckDate": None,
                    "osmLastUpdated": None,
                },
                "distanceMeters": None,
            },
        },
        {
            "book": {
                "isbn": "978-3-473-58522-9",
                "title": "Test Book 2",
                "author": "Stephen Edwin King",
                "coverUrl": None,
                "dnbId": "12346",
            },
            "locatedShelf": {
                "shelf": {
                    "osmId": "https://www.openstreetmap.org/node/11935877522",
                    "name": "test shelf",
                    "latitude": 48.0998168,
                    "longitude": 8.0546482,
                    "address": None,
                    "type": None,
                    "operator": None,
                    "website": None,
                    "openingHours": None,
                    "osmCheckDate": None,
                    "osmLastUpdated": None,
                },
                "distanceMeters": None,
            },
        },
        {
            "book": {
                "isbn": "978-3-473-58526-7",
                "title": "Test Book 3",
                "author": "Stephen E. King",
                "coverUrl": None,
                "dnbId": "12347",
            },
            "locatedShelf": {
                "shelf": {
                    "osmId": "https://www.openstreetmap.org/node/11935877522",
                    "name": "test shelf",
                    "latitude": 48.0998168,
                    "longitude": 8.0546482,
                    "address": None,
                    "type": None,
                    "operator": None,
                    "website": None,
                    "openingHours": None,
                    "osmCheckDate": None,
                    "osmLastUpdated": None,
                },
                "distanceMeters": None,
            },
        },
    ]
