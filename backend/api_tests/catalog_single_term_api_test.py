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


def test_search_in_catalog_query_none(client: FlaskClient) -> None:
    response = client.get(
        "/api/catalog/search/single-term",
        query_string={
            "q": None,
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == ("Missing query parameter: 'q' (Search term).")


def test_search_in_catalog_empty_query(client: FlaskClient) -> None:
    response = client.get(
        "/api/catalog/search/single-term",
        query_string={
            "q": "",  # empty string will be treated as missing query parameter
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == ("Missing query parameter: 'q' (Search term).")


def test_search_in_catalog_no_query(client: FlaskClient) -> None:
    response = client.get("/api/catalog/search/single-term")

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == ("Missing query parameter: 'q' (Search term).")


def test_search_in_catalog_no_query_but_user_coords_given(
    client: FlaskClient,
) -> None:
    response = client.get(
        "/api/catalog/search/single-term",
        query_string={
            "lat": 48.012345,
            "lon": 8.2,
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == ("Missing query parameter: 'q' (Search term).")


def test_search_in_catalog_wrong_parameters(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application)

    response = client.get(
        "/api/catalog/search/single-term",
        query_string={
            "lat": "48.012345",
            "lon": "8.2",
            "title": "Spre",
            "q": "Spre",
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == ("Author and title parameters are not allowed.")


def test_search_in_catalog_query_given_coords_not(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application)

    response = client.get(
        "/api/catalog/search/single-term",
        query_string={"q": "Kong"},
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert_correct_test_book_entity_in_response_data(response)


def test_search_in_catalog_query_given_coords_none(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application)

    response = client.get(
        "/api/catalog/search/single-term",
        query_string={"q": "stephen king", "lat": None, "lon": None},
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert_correct_test_book_entity_in_response_data(response)


def test_search_in_catalog_query_space_string(client: FlaskClient) -> None:

    response = client.get(
        "/api/catalog/search/single-term",
        query_string={
            "lat": None,
            "lon": None,
            "q": " ",  # will be stripped and treated as missing query parameter
        },
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == ("Missing query parameter: 'q' (Search term).")


def test_search_in_catalog_query_contains_non_ascii_characters(
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
        "/api/catalog/search/single-term",
        query_string={
            "lat": None,
            "lon": None,
            "q": "😀äöüß?3e",
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
        "/api/catalog/search/single-term",
        query_string={"lat": float("NaN"), "lon": float("inf"), "q": "Test"},
    )

    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == (
        "Invalid user coordinates: Latitude must be a finite number."
    )


def test_search_in_catalog_extreme_coordinates(client: FlaskClient) -> None:
    response = client.get(
        "/api/catalog/search/single-term",
        query_string={
            "lat": 50.3,
            "lon": 203.4,  # Invalid longitude
            "q": "Test",
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
        "/api/catalog/search/single-term",
        query_string={
            "lat": None,
            "lon": None,
            "q": "Eragon",  # Not in catalog
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == []


def test_search_in_catalog_empty_catalog(client: FlaskClient) -> None:
    response = client.get(
        "/api/catalog/search/single-term",
        query_string={
            "lat": None,
            "lon": None,
            "q": "Eragon",  # Not in catalog
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
        "/api/catalog/search/single-term",
        query_string={
            "lat": 49,
            "lon": 8,
            "q": "Eragon",  # Not in catalog
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == []


def test_search_in_catalog_by_query_with_coordinates(
    client: FlaskClient,
) -> None:

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application)

    response = client.get(
        "/api/catalog/search/single-term",
        query_string={
            "lat": 49.1234567891,
            "lon": 8.1234567891,
            "q": "spre",
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert_correct_test_book_entity_in_response_data(
        response, distance_meters=113935.914
    )


def test_search_in_catalog_by_query_without_coordinates(
    client: FlaskClient,
) -> None:

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application)

    response = client.get(
        "/api/catalog/search/single-term",
        query_string={
            "lat": None,
            "lon": None,
            "q": "spre",
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert_correct_test_book_entity_in_response_data(response)


def test_search_in_catalog_q_is_isbn_but_no_book_with_that_isbn_in_catalog(
    client: FlaskClient,
) -> None:
    """Test that if the search term is a valid ISBN, it is only matched against the ISBN
    of books in the catalog, not against title or author.
    """

    book_with_title_similar_to_searched_isbn = Book(
        isbn=Isbn("978-3-0369-5954-2"),
        title="978-3-486-58723-4",
        author="Test Author",
        dnb_id="12345",
    )  # Should not be returned when q == "978-3-486-58723-4" (ISBN does not match)

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(
        client.application, book_with_title_similar_to_searched_isbn
    )

    response = client.get(
        "/api/catalog/search/single-term",
        query_string={
            "lat": None,
            "lon": None,
            "q": "978-3-486-58723-4",  # Valid ISBN but not in catalog
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == []


def test_search_in_catalog_q_is_isbn_and_book_with_isbn_in_catalog(
    client: FlaskClient,
) -> None:

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application)  # 978-3-453-43690-9

    response = client.get(
        "/api/catalog/search/single-term",
        query_string={
            "lat": None,
            "lon": None,
            "q": "978-3-453-43690-9",  # Valid ISBN and in catalog
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert_correct_test_book_entity_in_response_data(response)


def test_search_in_catalog_by_isbn_with_coordinates(
    client: FlaskClient,
) -> None:

    insert_test_shelf_into_db(client.application)
    insert_test_book_into_shelf_in_db(client.application)  # 978-3-453-43690-9

    response = client.get(
        "/api/catalog/search/single-term",
        query_string={
            "lat": 49.1234567891,
            "lon": 8.1234567891,
            "q": "978-3-453-43690-9",  # Valid ISBN and in catalog
        },
    )

    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert_correct_test_book_entity_in_response_data(
        response, distance_meters=113935.914
    )
