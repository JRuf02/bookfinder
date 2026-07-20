"""Helper functions for the fuzzy prefix search database.

Provides functions to add book titles and author names to the database,
tokenizing them into single words and generating threegrams for each token.
Can be imported as a module, or run as a script to setup / reset the database.

Modeled after the q-gram approach from:
https://daphne.tf.uni-freiburg.de/ws2324/InformationRetrieval/svn/public/slides/lecture-07.pdf
"""

import argparse
import json
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

        # For concurrent catalog searches and inserts:
        # Allow database reading while a write is in progress.
        # Setting will be persisted in the database file, no need to set it again.
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

        c.execute("""
            CREATE TABLE book_title_tokens (
                token_id INTEGER NOT NULL REFERENCES tokens(token_id),
                isbn TEXT NOT NULL
            )
        """)
        c.execute(
            "CREATE INDEX idx_book_title_tokens_token_id ON book_title_tokens(token_id)"
        )

        c.execute("""
            CREATE TABLE threegrams (
                threegram TEXT NOT NULL,
                token_id INTEGER NOT NULL REFERENCES tokens(token_id)
            )
        """)
        c.execute("CREATE INDEX idx_threegrams_threegram ON threegrams(threegram)")


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


# TODO: Use this function in the backend code whenever inserting something
#       into the table 'books'.
def add_book_title(title: str, isbn: str) -> None:
    """Parse a book title into tokens (and threegrams) and link them to the isbn."""
    with db_cursor(DB_PATH) as c:
        for token in _tokenize(title):
            _add_token(c, token, isbn, "book_title_tokens")


# TODO: Use this function in the backend code whenever inserting something
#       into the table 'books'.
def add_author_name(name: str, isbn: str) -> None:
    """Parse an author name into tokens (and threegrams) and link them to the isbn."""
    with db_cursor(DB_PATH) as c:
        for token in _tokenize(name):
            _add_token(c, token, isbn, "author_name_tokens")


def _find_similar_tokens(
    c: sqlite3.Cursor, query_token: str, min_similarity: float = 0.5
) -> list[tuple[int, str, float]]:
    """Find tokens that have at least the given threegram overlap with query_token.
    Minimum overlap is given by min_similarity = (shared grams / grams in query_token).

    Returns (token_id, token, similarity) tuples, best matches first.
    """

    query_grams = _generate_threegrams(query_token)

    rows = c.execute(
        """
        SELECT t.token_id, t.token, COUNT(*) AS overlap
        FROM threegrams tg
        JOIN tokens t ON t.token_id = tg.token_id
        JOIN json_each(?) AS qg ON qg.value = tg.threegram
        GROUP BY tg.token_id
        ORDER BY overlap DESC
        """,
        (json.dumps(query_grams),),
    ).fetchall()

    results = []
    for token_id, token, overlap in rows:
        similarity = overlap / len(query_grams)
        if similarity >= min_similarity:
            results.append((token_id, token, similarity))
    return results


_SEARCH_ISBN_QUERIES: dict[TokenTable, str] = {
    "book_title_tokens": "SELECT isbn FROM book_title_tokens WHERE token_id = ?",
    "author_name_tokens": "SELECT isbn FROM author_name_tokens WHERE token_id = ?",
}


def _search(
    c: sqlite3.Cursor, query: str, token_table: TokenTable, min_similarity: float
) -> dict[str, float]:
    """Fuzzy-match each query token against all tokens in the token_table.
    Accumulate fuzzy scores (threegram-overlap) per isbn, for each query token.
    Sum up the scores of all query tokens, so a book matching more of them ranks higher.

    Returns
    -------
    - dict[str, float]: A dictionary mapping isbn -> total score

    """

    isbn_scores: dict[str, float] = {}

    for q_token in _tokenize(query):
        for token_id, _token, similarity in _find_similar_tokens(
            c, q_token, min_similarity
        ):
            rows = c.execute(_SEARCH_ISBN_QUERIES[token_table], (token_id,)).fetchall()
            for (isbn,) in rows:
                isbn_scores[isbn] = isbn_scores.get(isbn, 0.0) + similarity

    return isbn_scores


# TODO: Replace old catalog serach api endpoint with this new fuzzy logic
#       (This file is still not used anywhere in the backend code)
def search_authors(query: str, min_similarity: float = 0.5) -> list[tuple[str, float]]:
    """Return (isbn, score) pairs for author names fuzzy-matching query,
    best matches first.
    """

    with db_cursor(DB_PATH) as c:
        isbn_scores = _search(c, query, "author_name_tokens", min_similarity)

    return sorted(isbn_scores.items(), key=lambda pair: pair[1], reverse=True)


# TODO: Replace old catalog serach api endpoint with this new fuzzy logic
#       (This file is still not used anywhere in the backend code)
def search_titles(query: str, min_similarity: float = 0.5) -> list[tuple[str, float]]:
    """Return (isbn, score) pairs for book titles fuzzy-matching query,
    best matches first.
    """

    with db_cursor(DB_PATH) as c:
        isbn_scores = _search(c, query, "book_title_tokens", min_similarity)

    return sorted(isbn_scores.items(), key=lambda pair: pair[1], reverse=True)


# TODO: implement search by author AND title together, and search by a single
#       unspecified term that could be either an author or a title word.
#       And use the new search in the API endpoints instead of the old catalog search.


# TODO: Unclutter this script & CLI and check whether reset / standalone script
#       for fuzzy is even needed or if reset_bookshelves.py is enough.
#       Maybe just keep the search CLI for testing / debugging?
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Set up / reset the fuzzy search database, or try out a search."
    )
    parser.add_argument(
        "-fr",
        "--force-reset",
        action="store_true",
        help="Reset the database without confirmation.",
    )
    parser.add_argument(
        "-a",
        "--author",
        metavar="QUERY",
        help="Fuzzy-search authors for QUERY and print matching isbns.",
    )
    parser.add_argument(
        "-t",
        "--title",
        metavar="QUERY",
        help="Fuzzy-search titles for QUERY and print matching isbns.",
    )
    args = parser.parse_args()

    if args.author:
        for isbn, score in search_authors(args.author):
            print(f"{score:.2f}  {isbn}")
        raise SystemExit(0)

    if args.title:
        for isbn, score in search_titles(args.title):
            print(f"{score:.2f}  {isbn}")
        raise SystemExit(0)

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
