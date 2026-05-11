from flask.testing import FlaskClient


def test_request_example(client: FlaskClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
