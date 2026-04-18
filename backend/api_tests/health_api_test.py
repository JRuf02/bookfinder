from flask.testing import FlaskClient

from .fixtures import app, client  # noqa: F401


def test_request_example(client: FlaskClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
