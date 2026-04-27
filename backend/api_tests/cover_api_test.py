from flask.testing import FlaskClient

from .fixtures import app, client  # noqa: F401
from http_constants.status import HttpStatus
from PIL import Image
from io import BytesIO


def test_get_cover_with_invalid_isbn(client: FlaskClient) -> None:
    response = client.get(
        "/api/cover",
        query_string={
            "isbn": "invalid_isbn",
            "size": "l",
        },
    )
    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "ISBN parameter not provided or invalid"


def test_get_cover_with_invalid_size(client: FlaskClient) -> None:
    response = client.get(
        "/api/cover",
        query_string={
            "isbn": "978-3-551-35401-3",
            "size": "xl",
        },
    )
    assert response.status_code == HttpStatus.BAD_REQUEST.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "Invalid size parameter"


def test_get_cover_image_not_found_in_dnb(client: FlaskClient) -> None:
    response = client.get(
        "/api/cover",
        query_string={
            "isbn": "978-1-5266-2658-5",  # This book is not in the dnb
            "size": "l",
        },
    )
    assert response.status_code == HttpStatus.SERVICE_UNAVAILABLE.value
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "Failed to fetch cover image"


def test_get_cover_image_size_l(client: FlaskClient) -> None:
    response = client.get(
        "/api/cover",
        query_string={
            "isbn": "978-3-551-35401-3",
            "size": "l",
        },
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.data is not None
    assert response.content_type.startswith("image/jpeg")
    with Image.open(BytesIO(response.data)) as img:
        assert img.width > 0
        assert img.height > 0


def test_get_cover_image_size_m(client: FlaskClient) -> None:
    response = client.get(
        "/api/cover",
        query_string={
            "isbn": "978-3-551-35401-3",
            "size": "m",
        },
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.data is not None
    assert response.content_type.startswith("image/jpeg")
    with Image.open(BytesIO(response.data)) as img:
        assert img.width > 0
        assert img.height > 0


def test_get_cover_image_size_s(client: FlaskClient) -> None:
    response = client.get(
        "/api/cover",
        query_string={
            "isbn": "978-3-551-35401-3",
            "size": "s",
        },
    )
    assert response.status_code == HttpStatus.OK.value
    assert response.data is not None
    assert response.content_type.startswith("image/jpeg")
    with Image.open(BytesIO(response.data)) as img:
        assert img.width > 0
        assert img.height > 0
