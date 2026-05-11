from collections.abc import Generator
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import parse_qs, urlparse

import pytest
from flask import Flask
from flask.testing import FlaskClient
from requests_mock.mocker import Mocker
from requests_mock.request import _RequestObjectProxy

from api_tests.assets.mock_xml import (
    MOCK_DNB_XML_KING,
    MOCK_DNB_XML_ROWLING_NOT_IN_DNB,
    MOCK_DNB_XML_SCHOENING,
)
from app.db.database import init_db
from server import create_app


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--use-real-dnb-api",
        action="store_true",
        default=False,
        help="Use the real DNB API instead of mocking it.",
    )


@pytest.fixture
def app(_mock_dnb_api: None) -> Generator[Flask, None, None]:
    """Create a Flask app instance for testing.
    Any calls to the DNB API (which is an external server) are mocked,
    to ensure testing our backend logic works even if the DNB server is down.
    If pytest is run with the --use-real-dnb-api option,
    the real DNB server will be called instead of mocking it.
    """

    app = create_app()

    with TemporaryDirectory() as temp_dir:
        app.config.update(
            {
                "TESTING": True,
                "DB_PATH": Path(temp_dir) / "test_books.db",
            }
        )

        # other setup
        if app.config["DB_PATH"].exists():
            app.config["DB_PATH"].unlink()  # Remove existing test DB
        init_db(app.config["DB_PATH"])

        yield app

        # clean up / reset resources


@pytest.fixture
def client(app: Flask) -> FlaskClient:
    """Create a Flask test client for testing the Flask app instance.
    Any calls to the DNB API (which is an external server) are mocked,
    to ensure testing our backend logic works even if the DNB server is down.
    If pytest is run with the --use-real-dnb-api option,
    the real DNB server will be called instead of mocking it.
    """
    return app.test_client()


def match_dnb_request_king(request: _RequestObjectProxy) -> bool:
    parsed = urlparse(request.url)
    qs = parse_qs(parsed.query)

    return (
        qs.get("version") == ["1.1"]
        and qs.get("operation") == ["searchRetrieve"]
        and qs.get("query") == ['"978-3-453-43690-9"']
        and qs.get("recordSchema") == ["MARC21-xml"]
        and qs.get("maximumRecords") == ["1"]
    )


def match_dnb_request_rowling_not_in_dnb(request: _RequestObjectProxy) -> bool:
    parsed = urlparse(request.url)
    qs = parse_qs(parsed.query)

    return (
        qs.get("version") == ["1.1"]
        and qs.get("operation") == ["searchRetrieve"]
        and qs.get("query") == ['"978-1-5266-2658-5"']
        and qs.get("recordSchema") == ["MARC21-xml"]
        and qs.get("maximumRecords") == ["1"]
    )


def match_dnb_request_schoening(request: _RequestObjectProxy) -> bool:
    parsed = urlparse(request.url)
    qs = parse_qs(parsed.query)

    return (
        qs.get("version") == ["1.1"]
        and qs.get("operation") == ["searchRetrieve"]
        and qs.get("query") == ['"978-3-486-58723-4"']
        and qs.get("recordSchema") == ["MARC21-xml"]
        and qs.get("maximumRecords") == ["1"]
    )


def match_dnb_request_cover_l(request: _RequestObjectProxy) -> bool:
    parsed = urlparse(request.url)
    qs = parse_qs(parsed.query)

    return qs.get("isbn") == ["978-3-551-35401-3"] and qs.get("size") == ["l"]


def match_dnb_request_cover_m(request: _RequestObjectProxy) -> bool:
    parsed = urlparse(request.url)
    qs = parse_qs(parsed.query)

    return qs.get("isbn") == ["978-3-551-35401-3"] and qs.get("size") == ["m"]


def match_dnb_request_cover_s(request: _RequestObjectProxy) -> bool:
    parsed = urlparse(request.url)
    qs = parse_qs(parsed.query)

    return qs.get("isbn") == ["978-3-551-35401-3"] and qs.get("size") == ["s"]


@pytest.fixture(scope="session")
def _mock_dnb_api(
    request: pytest.FixtureRequest,
) -> Generator[Mocker | None, None, None]:
    """Use mocker to be able to test backend logic even when the actual DNB server
    is down (DNB is an external server, so we can't control its uptime).

    Mocks the DNB (Deutsche Nationalbibliothek) API responses, except pytest is run
    with the --use-real-dnb-api option.
    """

    use_real_dnb_api = request.config.getoption("--use-real-dnb-api")
    if use_real_dnb_api:
        yield None
        return

    with Mocker(real_http=False) as mocker:
        mocker.register_uri(
            method="GET",
            url="https://services.dnb.de/sru/dnb",
            additional_matcher=match_dnb_request_king,
            status_code=200,
            headers={
                "Content-Type": "text/xml;charset=UTF-8",
            },
            text=MOCK_DNB_XML_KING,
        )

        mocker.register_uri(
            method="GET",
            url="https://services.dnb.de/sru/dnb",
            additional_matcher=match_dnb_request_rowling_not_in_dnb,
            status_code=200,
            headers={
                "Content-Type": "text/xml;charset=UTF-8",
            },
            text=MOCK_DNB_XML_ROWLING_NOT_IN_DNB,
        )

        mocker.register_uri(
            method="GET",
            url="https://services.dnb.de/sru/dnb",
            additional_matcher=match_dnb_request_schoening,
            status_code=200,
            headers={
                "Content-Type": "text/xml;charset=UTF-8",
            },
            text=MOCK_DNB_XML_SCHOENING,
        )

        path = (
            Path(__file__).parent / "api_tests" / "assets" / "978-3-551-35401-3-L.jpeg"
        )
        with path.open("rb") as f:
            image_bytes_l = f.read()

        path = (
            Path(__file__).parent / "api_tests" / "assets" / "978-3-551-35401-3-M.jpeg"
        )
        with path.open("rb") as f:
            image_bytes_m = f.read()

        path = (
            Path(__file__).parent / "api_tests" / "assets" / "978-3-551-35401-3-S.jpeg"
        )
        with path.open("rb") as f:
            image_bytes_s = f.read()

        mocker.register_uri(
            method="GET",
            url="https://portal.dnb.de/opac/mvb/cover",
            additional_matcher=match_dnb_request_cover_l,
            status_code=200,
            headers={
                "Content-Type": "image/jpeg",
            },
            content=image_bytes_l,
        )

        mocker.register_uri(
            method="GET",
            url="https://portal.dnb.de/opac/mvb/cover",
            additional_matcher=match_dnb_request_cover_m,
            status_code=200,
            headers={
                "Content-Type": "image/jpeg",
            },
            content=image_bytes_m,
        )

        mocker.register_uri(
            method="GET",
            url="https://portal.dnb.de/opac/mvb/cover",
            additional_matcher=match_dnb_request_cover_s,
            status_code=200,
            headers={
                "Content-Type": "image/jpeg",
            },
            content=image_bytes_s,
        )

        mocker.register_uri(
            method="GET",
            url="https://portal.dnb.de/opac/mvb/cover?isbn=978-1-5266-2658-5&size=l",
            status_code=404,
        )

        yield mocker
