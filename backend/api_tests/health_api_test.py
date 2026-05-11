from flask.testing import FlaskClient


def test_request_example(mocked_client: FlaskClient) -> None:
    response = mocked_client.get("/api/health")
    assert response.status_code == 200
