"""Helper functions for the fuzzy prefix search database.

Provides functions to add book titles and author names to the database,
tokenizing them into single words and generating threegrams for each token.
Can be imported as a module, or run as a script to setup / reset the database.

Modeled after the q-gram approach from:
https://daphne.tf.uni-freiburg.de/ws2324/InformationRetrieval/svn/public/slides/lecture-07.pdf
"""

import argparse
import re
import sqlite3
from pathlib import Path
from typing import Literal

from app.db.database import db_cursor

TokenTable = Literal["book_title_tokens", "author_name_tokens"]

DB_PATH = Path(__file__).parent.parent / "fuzzysearch.db"
PADDING = "$$"  # "$" * (q - 1) for q-grams, we use q == 3


def _reset_tables() -> None:

    with db_cursor(DB_PATH) as c:
        c.execute("PRAGMA foreign_keys = ON")

        # For concurrent catalog searches and inserts,
        # allow database reading while a write is in progress.
        # Setting will be persisted in the database file.
        c.execute("PRAGMA journal_mode = WAL")

        c.execute("DROP TABLE IF EXISTS threegrams")
        c.execute("DROP TABLE IF EXISTS author_name_tokens")
        c.execute("DROP TABLE IF EXISTS book_title_tokens")
        c.execute("DROP TABLE IF EXISTS tokens")

        c.execute("""
            CREATE TABLE tokens (
                token_id INTEGER PRIMARY KEY AUTOINCREMENT,
                token TEXT UNIQUE NOT NULL
            )
        """)

        c.execute("""
            CREATE TABLE author_name_tokens (
                token_id INTEGER NOT NULL REFERENCES tokens(token_id),
                isbn TEXT NOT NULL
            )
        """)
        c.execute(
            "CREATE INDEX idx_author_name_tokens_token_id "
            "ON author_name_tokens(token_id)"
        )
        c.execute(
            "CREATE INDEX idx_author_name_tokens_isbn ON author_name_tokens(isbn)"
        )

        c.execute("""
            CREATE TABLE book_title_tokens (
                token_id INTEGER NOT NULL REFERENCES tokens(token_id),
                isbn TEXT NOT NULL
            )
        """)
        c.execute(
            "CREATE INDEX idx_book_title_tokens_token_id ON book_title_tokens(token_id)"
        )
        c.execute("CREATE INDEX idx_book_title_tokens_isbn ON book_title_tokens(isbn)")

        c.execute("""
            CREATE TABLE threegrams (
                threegram TEXT NOT NULL,
                token_id INTEGER NOT NULL REFERENCES tokens(token_id)
            )
        """)
        c.execute("CREATE INDEX idx_threegrams_threegram ON threegrams(threegram)")
        c.execute("CREATE INDEX idx_threegrams_token_id ON threegrams(token_id)")


def optimize_database() -> None:
    """Improve query performance by refreshing SQLite query planner statistics.

    Statistics are used by the query planner for deciding whether
    and how to use an index.
    Only updates statistics on tables that have changed a lot since the last run.
    Lightweight, safe to call periodically or on every connection close.
    """

    with db_cursor(DB_PATH) as c:
        c.execute("PRAGMA optimize")


def analyze_database() -> None:
    """Run a full ANALYZE, refreshing planner statistics for every table.

    More thorough (and more expensive) than optimize_database().
    Not intended to be run frequently, but can be useful after a large batch of inserts.
    """

    with db_cursor(DB_PATH) as c:
        c.execute("ANALYZE")


def _tokenize(text: str) -> list[str]:
    """Lowercase and split text into word tokens, stripping punctuation.

    Keeps apostrophes and hyphens that are within a word, removes other punctuation.

    >>> _tokenize("Hello, don't stop rock'n'roll! Ask_me-why-. -Summer of '69")
    ['hello', "don't", 'stop', "rock'n'roll", 'ask', "me-why", 'summer', 'of', '69']
    """

    return re.findall(r"[a-z0-9]+(?:['-][a-z0-9]+)*", text.lower())


def _generate_threegrams(token: str) -> list[str]:
    """Pad the token with $$ on both ends, then slide a 3-char window
    across it to produce all threegrams (including duplicates).

    The padding encodes "starts with" / "ends with", improving match quality.
    """

    padded = f"{PADDING}{token}{PADDING}"
    return [padded[i : i + 3] for i in range(len(padded) - 2)]


def _get_or_create_token_id(c: sqlite3.Cursor, token: str) -> int:
    """Get the token_id for a token, creating it if it doesn't exist.

    Example tokens: "harry", "potter", "stephen", "don't", "2006".
    """

    c.execute("INSERT OR IGNORE INTO tokens (token) VALUES (?)", (token,))
    c.execute("SELECT token_id FROM tokens WHERE token = ?", (token,))
    row = c.fetchone()
    return row[0]


_INSERT_TOKEN_QUERIES: dict[TokenTable, str] = {
    "book_title_tokens": (
        "INSERT INTO book_title_tokens (token_id, isbn) VALUES (?, ?)"
    ),
    "author_name_tokens": (
        "INSERT INTO author_name_tokens (token_id, isbn) VALUES (?, ?)"
    ),
}


def _add_token(
    c: sqlite3.Cursor, token: str, isbn: str, token_table: TokenTable
) -> None:
    """Add a token to the database (or get its ID if it already exists),
    link it to the given isbn, and ensure its threegrams exist.
    """

    is_new = (
        c.execute("SELECT 1 FROM tokens WHERE token = ?", (token,)).fetchone() is None
    )

    token_id = _get_or_create_token_id(c, token)

    # If a token appears multiple times in a single title or author name,
    # store each occurrence as its own row. Allow duplicates as they improve
    # the search ranking.
    c.execute(_INSERT_TOKEN_QUERIES[token_table], (token_id, isbn))

    # If the token already exists, no need to regenerate its threegrams.
    if is_new:
        c.executemany(
            "INSERT INTO threegrams (threegram, token_id) VALUES (?, ?)",
            [(gram, token_id) for gram in _generate_threegrams(token)],
        )


def add_book_title(title: str, isbn: str) -> None:
    """Parse a book title into tokens (and threegrams) and link them to the isbn."""
    with db_cursor(DB_PATH) as c:
        for token in _tokenize(title):
            _add_token(c, token, isbn, "book_title_tokens")


def add_author_name(name: str, isbn: str) -> None:
    """Parse an author name into tokens (and threegrams) and link them to the isbn."""
    with db_cursor(DB_PATH) as c:
        for token in _tokenize(name):
            _add_token(c, token, isbn, "author_name_tokens")


# TODO: lookup functions for fuzzy search (by author, by title, by author and title,
#       and by single term that's either author or title, but unspecified)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Set up or reset the SQLite database for fuzzy prefix search."
    )
    parser.add_argument(
        "-fr",
        "--force-reset",
        action="store_true",
        help="Reset the database without confirmation.",
    )
    args = parser.parse_args()

    if not args.force_reset:
        confirm = input(
            f"This will drop and recreate all tables in {DB_PATH}.\n"
            "Any data currently in the database will be lost. Continue? [y/N] "
        )
        if confirm.lower() != "y":
            print("Aborted.")
            raise SystemExit(0)

    _reset_tables()
    print("Tables reset.")
