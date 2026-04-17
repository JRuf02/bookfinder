from app.db.database import db_cursor

from .fixtures import app, client


def test_request_example(client):
    response = client.get("/api/health")
    assert response.status_code == 200


def test_insert_book_to_missing_shelf(client):
    response = client.post(
        "/api/shelf/insert",
        json={
            "osm_id": "https://www.openstreetmap.org/node/9999805317",  # valid, but not in db yet
            "isbn": "9783486587234",
        },
    )
    assert response.status_code == 404
    assert response.json["status"] == "error"
    assert "does not exist" in response.json["message"]
    # TODO: Test if number of books in catalog is still 0


def test_insert_missing_book_to_shelf(app):
    client = app.test_client()
    with db_cursor(app.config["DB_PATH"]) as c:
        c.execute(
            """
            INSERT OR REPLACE INTO bookshelves (
                osm_id, name, latitude, longitude, address, type, operator,
                website, opening_hours, osm_check_date, osm_last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "https://www.openstreetmap.org/node/11935877522",
                "test shelf",
                48.099817,
                8.054648,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ),
        )

    response = client.post(
        "/api/shelf/insert",
        json={
            "osm_id": "https://www.openstreetmap.org/node/11935877522",
            "isbn": "9783486587234",
        },
    )
    assert response.status_code == 200
    assert response.json["status"] == "success"

    response = client.get(
        "/api/shelf/books?osm_id=https://www.openstreetmap.org/node/11935877522"
    )
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]["isbn"] == "9783486587234"


def test_insert_book_to_shelf(client):
    pass  # TODO
