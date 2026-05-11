"""Check that the external DNB API is working as expected by my backend."""

from flask.testing import FlaskClient


def test_dnb_api_response(client: FlaskClient) -> None:
    """Test that the external DNB API is reachable."""

    raise NotImplementedError
    response = client.get("dnburl")
    assert response.status_code == 200
    assert response.data == b"data"
