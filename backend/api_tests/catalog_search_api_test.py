from flask.testing import FlaskClient
from http_constants.status import HttpStatus

from api_tests.api_test_utils import (
    insert_test_book_into_shelf_in_db,
    insert_test_shelf_into_db,
)
from api_tests.catalog_api_test_utils import (
    assert_correct_test_book_entity_in_response_data,
)
from app.models.book import Book
from app.models.identifiers import Isbn


def test_search_in_catalog_title_none_author_none(client: FlaskClient) -> None:
    response = client.get(
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
    client: FlaskClient,
) -> None:
    response = client.get(
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
    client: FlaskClient,
) -> None:
    response = client.get(
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


def test_search_in_catalog_no_author(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application)

    response = client.get(
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
    assert_correct_test_book_entity_in_response_data(
        response, distance_meters=14536.422
    )


def test_search_in_catalog_author_given_title_none(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application)

    response = client.get(
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
    assert_correct_test_book_entity_in_response_data(response)


def test_search_in_catalog_title_empty_string(client: FlaskClient) -> None:

    test_book = Book(
        isbn=Isbn("978-3-486-58723-4"),
        title="Test Book",
        author="Author, Test",  # DNB format for author name
        dnb_id="12345",
    )

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application, test_book)

    response = client.get(
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
    assert len(response.json["data"]) == 1

    assert response.json["data"][0].keys() == {
        "book",
        "locatedShelf",
        "entityId",
        "inShelfSince",
    }
    assert response.json["data"][0]["book"] == {
        "author": "Author, Test",
        "coverUrl": None,
        "dnbId": "12345",
        "isbn": "978-3-486-58723-4",
        "title": "Test Book",
    }
    assert response.json["data"][0]["locatedShelf"] == {
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
    }
    assert response.json["data"][0]["entityId"] == 1
    assert response.json["data"][0]["inShelfSince"] is not None


def test_search_in_catalog_title_contains_non_ascii_characters(
    client: FlaskClient,
) -> None:

    test_book = Book(
        isbn=Isbn("978-3-486-58723-4"),
        title="😀äöüß?3e",
        author="Test Author",
        dnb_id="12345",
    )

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application, test_book)

    response = client.get(
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
    assert len(response.json["data"]) == 1

    assert response.json["data"][0].keys() == {
        "book",
        "locatedShelf",
        "entityId",
        "inShelfSince",
    }
    assert response.json["data"][0]["book"] == {
        "author": "Test Author",
        "coverUrl": None,
        "dnbId": "12345",
        "isbn": "978-3-486-58723-4",
        "title": "😀äöüß?3e",
    }
    assert response.json["data"][0]["locatedShelf"] == {
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
    }
    assert response.json["data"][0]["entityId"] == 1
    assert response.json["data"][0]["inShelfSince"] is not None


def test_search_in_catalog_nonfinite_coordinates(client: FlaskClient) -> None:
    response = client.get(
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


def test_search_in_catalog_extreme_coordinates(client: FlaskClient) -> None:
    response = client.get(
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


def test_search_in_catalog_book_not_in_catalog(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application)  # Stephen King

    response = client.get(
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


def test_search_in_catalog_empty_catalog(client: FlaskClient) -> None:
    response = client.get(
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
    client: FlaskClient,
) -> None:

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application)  # Stephen King

    response = client.get(
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
    client: FlaskClient,
) -> None:

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application)

    response = client.get(
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
    assert_correct_test_book_entity_in_response_data(
        response, distance_meters=113935.914
    )


def test_search_in_catalog_by_author_and_title_without_coordinates(
    client: FlaskClient,
) -> None:

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application)

    response = client.get(
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
    assert_correct_test_book_entity_in_response_data(response)


def test_search_in_catalog_author_name_formats(client: FlaskClient) -> None:
    """Search for 'Stephen King' or 'stephen king' should find books with author
    'King, Stephen' and 'Stephen Edwin King', but not 'Anna'.
    'King, S.E.' and 'Steven Spielberg' should also be found, but ranked lower.
    """

    test_book_1 = Book(
        isbn=Isbn("978-3-486-58723-4"),
        title="Test Book 1",
        author="King, Stephen",  # DNB format for author name
        dnb_id="12345",
    )

    # Other formats for the same author name,
    # should still find the book when searching for "stephen king"
    test_book_2 = Book(
        isbn=Isbn("978-3-473-58522-9"),
        title="Test Book 2",
        author="Stephen Edwin King",
        dnb_id="12346",
    )

    test_book_3 = Book(
        isbn=Isbn("978-3-473-58526-7"),
        title="Test Book 3",
        author="King, S.E.",
        dnb_id="12347",
    )

    # Should be returned, but at the and of the search results due to low author score
    test_book_4 = Book(
        isbn=Isbn("978-3-15-000001-4"),
        title="Test Book 4",
        author="Steven Spielberg",
        dnb_id="12348",
    )

    test_book_5 = Book(
        isbn=Isbn("978-3-15-000002-1"),
        title="Test Book 5",
        author="Anna",  # Should not be found when searching for "stephen king"
        dnb_id="12349",
    )

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application, test_book_1)
    insert_test_book_into_shelf_in_db(client.application, test_book_2)
    insert_test_book_into_shelf_in_db(client.application, test_book_3)
    insert_test_book_into_shelf_in_db(client.application, test_book_4)
    insert_test_book_into_shelf_in_db(client.application, test_book_5)

    response = client.get(
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
    assert len(response.json["data"]) == 4

    # Ensure that each result is a proper BookEntity.
    for i in range(4):
        assert response.json["data"][i].keys() == {
            "book",
            "locatedShelf",
            "entityId",
            "inShelfSince",
        }
        assert response.json["data"][i]["entityId"] == i + 1
        assert response.json["data"][i]["inShelfSince"] is not None

        # Check that the LocatedShelf is correct.
        assert response.json["data"][i]["locatedShelf"] == {
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
        }

    # Ensure that the books are ranked in the expected order.
    assert response.json["data"][0]["book"]["author"] == "King, Stephen"
    assert response.json["data"][1]["book"]["author"] == "Stephen Edwin King"
    assert response.json["data"][2]["book"]["author"] == "King, S.E."
    assert response.json["data"][3]["book"]["author"] == "Steven Spielberg"

    # Check that the book details are correct (we only test the second and fourth book).
    assert response.json["data"][1]["book"] == {
        "author": "Stephen Edwin King",
        "coverUrl": None,
        "dnbId": "12346",
        "isbn": "978-3-473-58522-9",
        "title": "Test Book 2",
    }

    assert response.json["data"][3]["book"] == {
        "author": "Steven Spielberg",
        "coverUrl": None,
        "dnbId": "12348",
        "isbn": "978-3-15-000001-4",
        "title": "Test Book 4",
    }
