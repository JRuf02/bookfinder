from collections.abc import Generator
from pathlib import Path
from tempfile import TemporaryDirectory

import pytest
from flask import Flask
from flask.testing import FlaskClient

from app.db.database import init_db
from server import create_app


@pytest.fixture
def app() -> Generator[Flask, None, None]:
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
    return app.test_client()
