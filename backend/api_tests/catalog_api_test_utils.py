"""Utility functions for testing the catalog API endpoints."""


def assert_correct_test_book_entity_in_response_data(
    response,  # noqa: ANN001
    distance_meters: float | None = None,
) -> None:
    """Ensure the "data" field in the response JSON consists of only one BookEntity,
    and that it is the test book (Sprengstoff by Stephen King) in the test shelf.

    response: TestResponse (from werkzeug.test).
    No type annotation because default mime type for TestResponse is None.

    distance_meters: The distance that should be in the response.
    """

    assert response is not None
    assert response.json is not None

    print(f"Response JSON: {response.json}")
    assert len(response.json["data"]) == 1

    assert response.json["data"][0].keys() == {
        "book",
        "locatedShelf",
        "entityId",
        "inShelfSince",
    }
    assert response.json["data"][0]["book"] == {
        "author": "King, Stephen",
        "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
        "dnbId": "1028147899",
        "isbn": "978-3-453-43690-9",
        "title": "Sprengstoff",
    }
    assert response.json["data"][0]["locatedShelf"] == {
        "distanceMeters": distance_meters,
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
