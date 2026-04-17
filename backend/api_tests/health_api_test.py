from flask.testing import FlaskClient

from app.db.database import db_cursor

from .fixtures import app, client


def test_request_example(client: FlaskClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
