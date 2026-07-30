from flask import Flask

from app.db.database import db_cursor
from app.db.database_fuzzy_utils import (
    _edit_distance,
    _generate_threegrams,
    _tokenize,
    add_author_name,
    add_book_title,
)


def test_tokenize_handles_punctuation_and_inner_apostrophes() -> None:
    assert _tokenize("Hello, don't stop rock'n'roll! Ask_me-why-. -Summer of '69") == [
        "hello",
        "don't",
        "stop",
        "rock'n'roll",
        "ask",
        "me-why",
        "summer",
        "of",
        "69",
    ]


def test_generate_threegrams_pads_token_on_both_sides() -> None:
    assert _generate_threegrams("king") == ["$$k", "$ki", "kin", "ing", "ng$", "g$$"]


def test_edit_distance_matches_basic_examples() -> None:
    assert _edit_distance("dory", "harry") == 3
    assert _edit_distance("book", "book") == 0
    assert _edit_distance("", "abc") == 3


def test_add_book_title_and_author_name_populate_fuzzy_tables(app: Flask) -> None:
    with db_cursor(app.config["DB_PATH"]) as cursor:
        cursor.execute(
            "INSERT INTO books (isbn, title, author, dnb_id, cover_url) "
            "VALUES (?, ?, ?, ?, ?)",
            (
                "978-1-2345-6789-7",
                "A Book Title",
                "King, Stephen",
                "",
                None,
            ),
        )

    add_book_title("A Book Title", "978-1-2345-6789-7", app.config["DB_PATH"])
    add_author_name("King, Stephen", "978-1-2345-6789-7", app.config["DB_PATH"])

    with db_cursor(app.config["DB_PATH"]) as cursor:
        cursor.execute("SELECT token FROM tokens ORDER BY token_id ASC")
        assert [row[0] for row in cursor.fetchall()] == [
            "a",
            "book",
            "title",
            "king",
            "stephen",
        ]

        cursor.execute("SELECT COUNT(*) FROM book_title_tokens")
        assert cursor.fetchone()[0] == 3

        cursor.execute("SELECT COUNT(*) FROM author_name_tokens")
        assert cursor.fetchone()[0] == 2

        cursor.execute("SELECT COUNT(*) FROM threegrams")
        assert cursor.fetchone()[0] == sum(
            len(_generate_threegrams(token))
            for token in ["a", "book", "title", "king", "stephen"]
        )
