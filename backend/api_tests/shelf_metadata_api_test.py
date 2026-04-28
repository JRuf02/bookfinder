from flask.testing import FlaskClient
from http_constants.status import HttpStatus

from .api_test_utils import insert_test_shelf_into_db
from .fixtures import app, client  # noqa: F401


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
