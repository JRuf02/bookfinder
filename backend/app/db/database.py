import sqlite3
from collections.abc import Generator
from contextlib import contextmanager
from pathlib import Path

from flask import current_app


@contextmanager
def db_cursor(db_path: Path | None = None) -> Generator[sqlite3.Cursor, None, None]:
    if db_path is None:
        db_path = Path(current_app.config["DB_PATH"])
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Named column access for readability
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()
    try:
        yield cursor
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def init_db(db_path: Path) -> None:
    """Initialize the SQLite database:
    catalog tables (books, bookshelves, current_catalog) and
    fuzzy search tables (tokens, threegrams, and their links to books).

    Safe to call on every app startup without wiping existing data.
    For a full reset (drop + recreate), use the standalone reset scripts instead.
    """

    with db_cursor(db_path) as c:
        # For concurrent catalog searches and inserts:
        # Allow database reading while a write is in progress.
        # Setting will be persisted in the database file, no need to set it again.
        c.execute("PRAGMA journal_mode = WAL")

        # --- Catalog tables ---------------------------------------------

        c.execute("""
            CREATE TABLE IF NOT EXISTS books (
                isbn TEXT PRIMARY KEY,
                title TEXT,
                author TEXT,
                dnb_id TEXT,
                cover_url TEXT,
                total_insertions INTEGER DEFAULT 0,
                avg_days_until_takeout INTEGER DEFAULT NULL,
                time_of_entry DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        c.execute("""
            CREATE TABLE IF NOT EXISTS bookshelves (
                osm_id TEXT PRIMARY KEY,
                name TEXT,
                latitude REAL,
                longitude REAL,
                address TEXT,
                type TEXT,
                operator TEXT,
                website TEXT,
                opening_hours TEXT,
                osm_check_date TEXT,
                osm_last_updated DATETIME,
                time_of_entry DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        c.execute("""
            CREATE TABLE IF NOT EXISTS current_catalog (
                entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
                osm_id TEXT REFERENCES bookshelves(osm_id),
                isbn TEXT REFERENCES books(isbn),
                time_of_entry DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        c.execute(
            "CREATE INDEX IF NOT EXISTS idx_current_catalog_osm_id "
            "ON current_catalog(osm_id)"
        )
        c.execute(
            "CREATE INDEX IF NOT EXISTS idx_current_catalog_isbn "
            "ON current_catalog(isbn)"
        )

        # --- Fuzzy search tables -----------------------------------------

        c.execute("""
            CREATE TABLE IF NOT EXISTS tokens (
                token_id INTEGER PRIMARY KEY AUTOINCREMENT,
                token TEXT UNIQUE NOT NULL
            )
        """)

        c.execute("""
            CREATE TABLE IF NOT EXISTS author_name_tokens (
                token_id INTEGER NOT NULL REFERENCES tokens(token_id),
                isbn TEXT NOT NULL REFERENCES books(isbn)
            )
        """)
        c.execute(
            "CREATE INDEX IF NOT EXISTS idx_author_name_tokens_token_id "
            "ON author_name_tokens(token_id)"
        )

        c.execute("""
            CREATE TABLE IF NOT EXISTS book_title_tokens (
                token_id INTEGER NOT NULL REFERENCES tokens(token_id),
                isbn TEXT NOT NULL REFERENCES books(isbn)
            )
        """)
        c.execute(
            "CREATE INDEX IF NOT EXISTS idx_book_title_tokens_token_id "
            "ON book_title_tokens(token_id)"
        )

        c.execute("""
            CREATE TABLE IF NOT EXISTS threegrams (
                threegram TEXT NOT NULL,
                token_id INTEGER NOT NULL REFERENCES tokens(token_id)
            )
        """)
        c.execute(
            "CREATE INDEX IF NOT EXISTS idx_threegrams_threegram "
            "ON threegrams(threegram)"
        )


def optimize_database(db_path: Path) -> None:
    """Improve query performance by refreshing SQLite query planner statistics.

    Statistics are used by the query planner for deciding whether
    and how to use an index.
    Only updates statistics on tables that have changed a lot since the last run.
    Lightweight, safe to call periodically or on every connection close.
    """

    with db_cursor(db_path) as c:
        c.execute("PRAGMA optimize")


def analyze_database(db_path: Path) -> None:
    """Run a full ANALYZE, refreshing planner statistics for every table.

    More thorough (and more expensive) than optimize_database().
    Not intended to be run frequently, but can be useful after a large batch of inserts.
    """

    with db_cursor(db_path) as c:
        c.execute("ANALYZE")
