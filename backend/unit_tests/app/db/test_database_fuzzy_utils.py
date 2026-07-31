from flask import Flask

from app.db.database import db_cursor
from app.db.database_fuzzy_utils import (
    _edit_distance,
    _generate_threegrams,
    _tokenize,
    add_author_name,
    add_book_title,
)


def test_tokenize() -> None:
    assert _tokenize(
        "Hello hello, don't stop Rock'n'Roll! Ask_me-why-. -Summer of '69"
    ) == [
        "hello",
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


def test_generate_threegrams() -> None:
    assert _generate_threegrams("kinging") == [
        "$$k",
        "$ki",
        "kin",
        "ing",
        "ngi",
        "gin",
        "ing",
        "ng$",
        "g$$",
    ]
    assert _generate_threegrams("a") == [
        "$$a",
        "$a$",
        "a$$",
    ]
    assert _generate_threegrams("") == []


def test_edit_distance() -> None:
    assert _edit_distance("dory", "harry") == 3
    assert _edit_distance("book", "book") == 0
    assert _edit_distance("", "abc") == 3
    assert _edit_distance("abc", "") == 3
    assert _edit_distance("", "") == 0


def test_add_book_title_and_author_name_populate_fuzzy_tables(app: Flask) -> None:
    with db_cursor(app.config["DB_PATH"]) as cursor:
        cursor.execute(
            "INSERT INTO books (isbn, title, author, dnb_id, cover_url) "
            "VALUES (?, ?, ?, ?, ?)",
            (
                "978-1-2345-6789-7",
                "A Book with a Title",
                "King, Stephen",
                "",
                None,
            ),
        )

    add_book_title("A Book with a Title", "978-1-2345-6789-7", app.config["DB_PATH"])
    add_author_name("King, Stephen", "978-1-2345-6789-7", app.config["DB_PATH"])

    with db_cursor(app.config["DB_PATH"]) as cursor:
        # Tokens table contains unique tokens from book title and author name
        cursor.execute("SELECT token FROM tokens ORDER BY token_id ASC")
        assert [row[0] for row in cursor.fetchall()] == [
            "a",
            "book",
            "with",
            "title",
            "king",
            "stephen",
        ]

        # Token to ISBN link tables contain all (token, isbn) pairs, incl. duplicates
        cursor.execute("SELECT COUNT(*) FROM book_title_tokens")
        assert cursor.fetchone()[0] == 5  # including duplicates

        cursor.execute("SELECT COUNT(*) FROM author_name_tokens")
        assert cursor.fetchone()[0] == 2

        # Threegrams table contains all threegrams generated from the unique tokens
        cursor.execute("SELECT COUNT(*) FROM threegrams")
        assert cursor.fetchone()[0] == sum(
            len(_generate_threegrams(token))
            for token in ["a", "book", "with", "title", "king", "stephen"]
        )
