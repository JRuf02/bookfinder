from flask.testing import FlaskClient

from app.db.database import db_cursor

from .fixtures import app, client


def test_get_cover_with_invalid_dnb_isbn(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_cover_with_invalid_size(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_cover_image_not_found_in_dnb(client: FlaskClient) -> None:
    raise NotImplementedError


def test_get_cover_image(client: FlaskClient) -> None:
    raise NotImplementedError
    # TODO: check if image is valid, by checking content-type header
    # AND trying to open it as an image: PIL.Image.open(BytesIO(response.data))
    # check resolution > 0x0, etc.
