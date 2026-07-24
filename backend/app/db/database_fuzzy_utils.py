"""Functions for the fuzzy search database.

Provides functions to add book titles and author names to the search tables of the
database, tokenizing them into single words and generating threegrams for each token.
Also provides functions to fuzzy-search books by title or author name,
using threegram overlap and edit distance to filter and rank results.

Modeled after the q-gram approach from:
https://daphne.tf.uni-freiburg.de/ws2324/InformationRetrieval/svn/public/slides/lecture-07.pdf
"""

import json
import re
import sqlite3
from pathlib import Path
from typing import Literal

from app.db.database import db_cursor

TokenTable = Literal["book_title_tokens", "author_name_tokens"]

PADDING = "$$"  # "$" * (q - 1) for q-grams, we use q == 3


def _tokenize(text: str) -> list[str]:
    """Lowercase and split text into word tokens, stripping punctuation.

    Keeps apostrophes and hyphens that are within a word, removes other punctuation.

    >>> _tokenize("Hello, don't stop rock'n'roll! Ask_me-why-. -Summer of '69")
    ['hello', "don't", 'stop', "rock'n'roll", 'ask', 'me-why', 'summer', 'of', '69']
    """

    return re.findall(r"[a-z0-9]+(?:['-][a-z0-9]+)*", text.lower())


def _generate_threegrams(token: str) -> list[str]:
    """Pad the token with $$ on both ends, then slide a 3-char window
    across it to produce all threegrams (including duplicates).

    The padding encodes "starts with" / "ends with", improving match quality.
    """

    # For fuzzy PREFIX search, the lecture suggests padding left side only,
    # but we pad both sides to improve match quality for short tokens.
    # TODO: implement fuzzy prefix search for autocomplete suggestions,
    #       use standard fuzzy search for catalog search. Untangle.
    #       Differences: query token padding and similarity computation.
    #       Prefix:  sim = (shared grams / grams in query_token)
    #       Standard:sim = (shared grams / max(grams in query_token, grams in db_token))
    padded = f"{PADDING}{token}{PADDING}"
    return [padded[i : i + 3] for i in range(len(padded) - 2)]


def _edit_distance(a: str, b: str) -> int:
    """Return the Levenshtein edit distance between two strings.

    Based on the algorithm presented in the lecture slides:
    https://daphne.tf.uni-freiburg.de/ws2324/InformationRetrieval/svn/public/slides/lecture-07.pdf
    """

    if a == b:
        return 0
    if len(a) == 0:
        return len(b)
    if len(b) == 0:
        return len(a)

    if len(a) > len(b):
        a, b = b, a

    previous_row = list(range(len(b) + 1))  # add column for empty word
    for i, char_a in enumerate(a, start=1):
        current_row = [i]
        for j, char_b in enumerate(b, start=1):
            insertion_cost = current_row[j - 1] + 1
            deletion_cost = previous_row[j] + 1
            substitution_cost = previous_row[j - 1] + (char_a != char_b)
            current_row.append(min(insertion_cost, deletion_cost, substitution_cost))
        previous_row = current_row

    return previous_row[-1]


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
def add_book_title(title: str, isbn: str, db_path: Path | None = None) -> None:
    """Parse a book title into tokens (and threegrams) and link them to the isbn.

    Isbn must already exist in the 'books' table (as book_title_tokens.isbn is
    a foreign key from books.isbn).
    Call this after inserting the book, within the same transaction if possible.

    db_path is only needed when running outside of a Flask app context, e.g.
    in a standalone CLI script. Otherwise, db_cursor() will use the default
    database path from current_app.config['DB_PATH'].
    """
    with db_cursor(db_path) as c:
        for token in _tokenize(title):
            _add_token(c, token, isbn, "book_title_tokens")


# TODO: Use this function in the backend code whenever inserting something
#       into the table 'books'.
def add_author_name(name: str, isbn: str, db_path: Path | None = None) -> None:
    """Parse an author name into tokens (and threegrams) and link them to the isbn.

    Isbn must already exist in the 'books' table (author_name_tokens.isbn is
    a foreign key from books.isbn).
    Call this after inserting the book, within the same transaction if possible.

    db_path is only needed when running outside of a Flask app context, e.g.
    in a standalone CLI script. Otherwise, db_cursor() will use the default
    database path from current_app.config['DB_PATH'].
    """
    with db_cursor(db_path) as c:
        for token in _tokenize(name):
            _add_token(c, token, isbn, "author_name_tokens")


def _find_matching_tokens(
    c: sqlite3.Cursor, query_token: str, max_edit_dist: int = 2
) -> list[tuple[int, str, int]]:
    """Find tokens with maximum edit distance of max_edit_dist from query_token.

    Filter by q-gram overlap first, then compute the actual
    edit distance only for the remaining candidates.

    Returns (token_id, token, edit_distance) tuples, best matches first.
    """

    query_grams = _generate_threegrams(query_token)
    query_gram_count = len(query_grams)

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
        if abs(len(token) - len(query_token)) > max_edit_dist:
            continue

        db_token_threegram_count = len(token) - 2  # len(token) - q + 1 for q-grams
        min_required_overlap = (
            max(query_gram_count, db_token_threegram_count) - 3 * max_edit_dist
        )
        if overlap < min_required_overlap:
            continue

        edit_distance = _edit_distance(query_token, token)
        if edit_distance <= max_edit_dist:
            results.append((token_id, token, edit_distance))
    return results


_SEARCH_ISBN_QUERIES: dict[TokenTable, str] = {
    "book_title_tokens": "SELECT isbn FROM book_title_tokens WHERE token_id = ?",
    "author_name_tokens": "SELECT isbn FROM author_name_tokens WHERE token_id = ?",
}


def _search(
    c: sqlite3.Cursor, query: str, token_table: TokenTable, max_edit_dist: int
) -> dict[str, float]:
    """Fuzzy-match each query token against all tokens in the token_table.
    Accumulate edit-distance-based scores per isbn, for each query token.
    Sum up the scores of all query tokens, so a book matching more of them ranks higher.
    Higher scores indicate better matches.

    Returns
    -------
    - dict[str, float]: A dictionary mapping isbn -> total score

    """

    isbn_scores: dict[str, float] = {}

    for query_token in _tokenize(query):
        for token_id, _token, edit_distance in _find_matching_tokens(
            c, query_token, max_edit_dist
        ):
            rows = c.execute(_SEARCH_ISBN_QUERIES[token_table], (token_id,)).fetchall()
            for (isbn,) in rows:
                # Arbitrary scoring function, accumulating scores for each query token
                isbn_scores[isbn] = isbn_scores.get(isbn, 0.0) + (
                    1 / (1 + edit_distance)
                )

    # TODO: Get 3gram overlap from _find_matching_tokens and also return it,
    #       as ED score tie braker
    return isbn_scores


# TODO: Set max_edit_dist based on query length
def search_authors(
    query: str, max_edit_dist: int = 2, db_path: Path | None = None
) -> list[tuple[str, float]]:
    """Return (isbn, score) pairs for author names fuzzy-matching query,
    best matches first.

    db_path is only needed when running outside of a Flask app context, e.g.
    in a standalone CLI script. Otherwise, db_cursor() will use the default
    database path from current_app.config['DB_PATH'].
    """

    with db_cursor(db_path) as c:
        isbn_scores = _search(c, query, "author_name_tokens", max_edit_dist)

    return sorted(isbn_scores.items(), key=lambda pair: pair[1], reverse=True)


# TODO: Set max_edit_dist based on query length
def search_titles(
    query: str, max_edit_dist: int = 2, db_path: Path | None = None
) -> list[tuple[str, float]]:
    """Return (isbn, score) pairs for book titles fuzzy-matching query,
    best matches first.

    db_path is only needed when running outside of a Flask app context, e.g.
    in a standalone CLI script. Otherwise, db_cursor() will use the default
    database path from current_app.config['DB_PATH'].
    """

    with db_cursor(db_path) as c:
        isbn_scores = _search(c, query, "book_title_tokens", max_edit_dist)

    return sorted(isbn_scores.items(), key=lambda pair: pair[1], reverse=True)


# TODO: Fuzzysearch results should be post-processed by filtering by edit distance
#       and by existance in current_catalog, then compute and add distances.
#       Efficient PED computations and list merging: pip install ad-freiburg-qgram-utils
#       Sorting could be done by edit distance, then by 3gram overlap and by popularity.

# TODO: implement search by author AND title together, and search by a single
#       unspecified term that could be either an author or a title word.
#       And use the new search in the API endpoints instead of the old catalog search.
