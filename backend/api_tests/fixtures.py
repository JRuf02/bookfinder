from pathlib import Path
from tempfile import TemporaryDirectory

import pytest

from app.db.database import init_db
from server import create_app


@pytest.fixture
def app():
    app = create_app()
    with TemporaryDirectory() as temp_dir:
        app.config.update(
            {
                "TESTING": True,
                # "DB_PATH": Path(temp_dir) / "test_books.db", # TODO
                "DB_PATH": Path("test_books.db"),  # TODO: switch back to temp
            }
        )

        # other setup
        if app.config["DB_PATH"].exists():
            app.config["DB_PATH"].unlink()  # Remove existing test DB
        init_db(app.config["DB_PATH"])

        yield app

        # clean up / reset resources


@pytest.fixture
def client(app):
    return app.test_client()
