from flask.testing import FlaskClient


def test_get_book_with_invalid_isbn(mocked_client: FlaskClient) -> None:
    response = mocked_client.get("/api/book", query_string={"isbn": "9783458723--4"})
    assert response.status_code == 400
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "Invalid or missing ISBN"


def test_get_book_not_in_db(mocked_client: FlaskClient) -> None:
    response = mocked_client.get(
        "/api/book", query_string={"isbn": "978-3-453-43690-9"}
    )
    assert response.status_code == 200
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] is not None
    expected = {
        "author": "King, Stephen",
        "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
        "dnbId": "1028147899",
        "isbn": "978-3-453-43690-9",
        "title": "Sprengstoff",
    }
    assert response.json["data"] == expected


def test_get_book_not_in_db_not_in_dnb(mocked_client: FlaskClient) -> None:
    response = mocked_client.get(
        "/api/book", query_string={"isbn": "978-1-5266-2658-5"}
    )
    assert response.status_code == 404
    assert response.json is not None
    assert response.json["status"] == "error"
    assert response.json["message"] == "Book not found"


def test_get_book_in_db(mocked_client: FlaskClient) -> None:
    # Add book to DB once
    response = mocked_client.get(
        "/api/book", query_string={"isbn": "978-3-453-43690-9"}
    )
    assert response.status_code == 200
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] is not None
    expected = {
        "author": "King, Stephen",
        "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
        "dnbId": "1028147899",
        "isbn": "978-3-453-43690-9",
        "title": "Sprengstoff",
    }
    assert response.json["data"] == expected

    # Try to get the book again (this time from database, not DNB)
    response = mocked_client.get(
        "/api/book", query_string={"isbn": "978-3-453-43690-9"}
    )
    assert response.status_code == 200
    assert response.json is not None
    assert response.json["status"] == "success"
    assert response.json["data"] is not None
    expected = {
        "author": "King, Stephen",
        "coverUrl": "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-453-43690-9&size=l",
        "dnbId": "1028147899",
        "isbn": "978-3-453-43690-9",
        "title": "Sprengstoff",
    }
    assert response.json["data"] == expected
