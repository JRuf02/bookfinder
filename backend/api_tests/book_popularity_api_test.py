from datetime import datetime, timedelta, timezone

import pytest
from flask.testing import FlaskClient

from api_tests.api_test_utils import (
    insert_test_book_into_shelf_in_db,
    insert_test_shelf_into_db,
)
from app.db.book_db import save_book_to_db
from app.db.database import db_cursor
from app.models.book import Book
from app.models.identifiers import Isbn


def test_get_book_popularity_with_invalid_isbn(client: FlaskClient) -> None:
    response = client.get("/api/book/popularity", query_string={"isbn": "invalid-isbn"})

    assert response.status_code == 400
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "Invalid or missing ISBN"


def test_get_book_popularity_for_book_not_in_db(client: FlaskClient) -> None:
    response = client.get(
        "/api/book/popularity", query_string={"isbn": "978-3-453-43690-9"}
    )

    assert response.status_code == 404
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "Book not found in database"


def test_get_book_popularity_for_book_without_entity_ever_on_shelf(
    client: FlaskClient,
) -> None:
    """Book has been added to the books table, but has never been added to any shelf.
    Popularity data should be the database defaults.
    """

    test_book = Book(
        isbn=Isbn("978-3-453-43690-9"),  # For shorter test, we skip Isbn.parse() here
        title="Sprengstoff",
        author="King, Stephen",
        dnb_id="1028147899",
        cover_url="https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
    )
    # Save the book to the database, but do not add it to any shelf (current_catalog).
    save_book_to_db(test_book, client.application.config["DB_PATH"])

    response = client.get(
        "/api/book/popularity",
        query_string={"isbn": "978-3-453-43690-9"},
    )

    assert response.status_code == 200
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] == {
        "isbn": "978-3-453-43690-9",
        "avgDaysUntilTakeout": None,
        "currentlyOnShelves": 0,
        "totalBooksSeen": 0,
        "avgDaysOnShelfForCurrentBooks": None,
    }


def test_get_book_popularity(client: FlaskClient) -> None:
    isbn = "978-3-453-43690-9"
    osm_id = "https://www.openstreetmap.org/node/11935877522"

    insert_test_shelf_into_db(client.application, osm_id=osm_id)
    insert_test_book_into_shelf_in_db(client.application, osm_id=osm_id)

    now = datetime.now(timezone.utc)
    one_day_ago = (now - timedelta(days=1)).replace(microsecond=0).isoformat()
    three_days_ago = (now - timedelta(days=3)).replace(microsecond=0).isoformat()

    with db_cursor(client.application.config["DB_PATH"]) as c:
        c.execute(
            """
            UPDATE books
            SET total_insertions = 4, avg_days_until_takeout = 6.5
            WHERE isbn = ?
            """,
            (isbn,),
        )
        c.execute(
            """
            UPDATE current_catalog
            SET time_of_entry = ?
            WHERE isbn = ? AND osm_id = ?
            """,
            (one_day_ago, isbn, osm_id),
        )
        c.execute(
            """
            INSERT INTO current_catalog (osm_id, isbn, time_of_entry)
            VALUES (?, ?, ?)
            """,
            (osm_id, isbn, three_days_ago),
        )

    response = client.get("/api/book/popularity", query_string={"isbn": isbn})

    assert response.status_code == 200
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"]["isbn"] == isbn
    assert response.json["data"]["avgDaysUntilTakeout"] == pytest.approx(6.5)
    assert response.json["data"]["currentlyOnShelves"] == 2
    assert response.json["data"]["totalBooksSeen"] == 4
    assert response.json["data"]["avgDaysOnShelfForCurrentBooks"] is not None
    assert response.json["data"]["avgDaysOnShelfForCurrentBooks"] >= 1.9
