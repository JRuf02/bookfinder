from flask import Flask
from flask.testing import FlaskClient
from http_constants.status import HttpStatus

from api_tests.api_test_utils import insert_test_shelf_into_db

from .fixtures import app, client  # noqa: F401


def test_get_all_bookshelves_empty(client: FlaskClient) -> None:
    response = client.get("/api/bookshelves")
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == []


def test_get_all_bookshelves_with_data(app: Flask) -> None:
    insert_test_shelf_into_db(app)

    client = app.test_client()
    response = client.get("/api/bookshelves")
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == [
        {
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
    ]


def test_get_nearby_bookshelves_no_parameters(client: FlaskClient) -> None:
    response = client.get("/api/bookshelves/nearby", query_string={})
    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "lat and lon missing or invalid."


def test_get_nearby_bookshelves_no_location(client: FlaskClient) -> None:
    response = client.get("/api/bookshelves/nearby", query_string={"radius": "6000"})
    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "lat and lon missing or invalid."


def test_get_nearby_bookshelves_invalid_location(client: FlaskClient) -> None:
    response = client.get(
        "/api/bookshelves/nearby",
        query_string={"lat": "notafloat", "lon": "notafloat", "radius": "6000"},
    )
    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "lat and lon missing or invalid."


def test_get_nearby_bookshelves_extreme_location(client: FlaskClient) -> None:
    # lat and lon are valid floats, but not valid coordinates (lon > 180)
    response = client.get(
        "/api/bookshelves/nearby",
        query_string={"lat": "48.012345", "lon": "200.2", "radius": "6000"},
    )

    # TODO: Implement this behavior in the API
    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == (
        "Invalid coordinates. "
        "Latitude must be between -90 and 90, longitude between -180 and 180."
    )


def test_get_nearby_bookshelves_no_radius(client: FlaskClient) -> None:
    raise NotImplementedError
    insert_test_shelf_into_db(client.application)

    response = client.get(
        "/api/bookshelves/nearby",
        query_string={
            "lat": " 48.1120896",
            "lon": "8.0319702",
        },
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    # print(response.json["data"])
    # TODO: use dict-able dataclass LocatedShelf to avoid
    #       TypeError: asdict() should be called on dataclass instances
    # TODO: Fill with expected shelf data after implementing LocatedShelf:
    # assert response.json["data"] == []  # TODO: here, one shelf should be returned


def test_get_nearby_bookshelves_invalid_radius(client: FlaskClient) -> None:
    raise NotImplementedError
    insert_test_shelf_into_db(client.application)

    response = client.get(
        "/api/bookshelves/nearby",
        query_string={
            "lat": " 48.1120896",
            "lon": "8.0319702",
            "radius": "notafloat",  # invalid radius, should default to 5000.0
        },
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    # print(response.json["data"])
    # TODO: use dict-able dataclass LocatedShelf to avoid
    #       TypeError: asdict() should be called on dataclass instances
    # TODO: Fill with expected shelf data after implementing LocatedShelf:
    # assert response.json["data"] == []  # TODO: here, one shelf should be returned


def test_get_nearby_bookshelves_extreme_radius(client: FlaskClient) -> None:
    raise NotImplementedError
    # If radius is larger than earth, return all shelves in the database
    insert_test_shelf_into_db(client.application)

    response = client.get(
        "/api/bookshelves/nearby",
        query_string={
            "lat": " 48.1120896",
            "lon": "8.0319702",
            "radius": "50075000",  # earth circumference is 40,075,000 m
        },
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    # print(response.json["data"])
    # TODO: use dict-able dataclass LocatedShelf to avoid
    #       TypeError: asdict() should be called on dataclass instances
    # TODO: Fill with expected shelf data after implementing LocatedShelf:
    # assert response.json["data"] == []  # TODO: here, one shelf should be returned


def test_get_nearby_bookshelves_no_shelves_in_db(client: FlaskClient) -> None:
    response = client.get(
        "/api/bookshelves/nearby",
        query_string={
            "lat": " 48.1120896",
            "lon": "8.0319702",
        },
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == []


def test_get_nearby_bookshelves_no_shelves_within_radius(client: FlaskClient) -> None:

    insert_test_shelf_into_db(client.application)

    response = client.get(
        "/api/bookshelves/nearby",
        query_string={
            "lat": "48.26744120702259",
            "lon": "7.720756170633963",
            # radius will be 5000 by default, but we set it explicitly here for clarity
            "radius": "5000",
        },
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == []  # No shelves within radius


def test_get_nearby_bookshelves_with_nearby_shelves(client: FlaskClient) -> None:
    raise NotImplementedError  # TODO
