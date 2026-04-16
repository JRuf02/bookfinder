import sqlite3
from collections.abc import Generator
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).parent / ".." / ".." / "books.db"


@contextmanager
def db_cursor() -> Generator[sqlite3.Cursor, None, None]:
    conn = sqlite3.connect(DB_PATH)
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


def init_db() -> None:
    """Initialize the SQLite database."""
    with db_cursor() as c:
        c.execute("""
            CREATE TABLE IF NOT EXISTS books (
                isbn TEXT PRIMARY KEY,
                title TEXT,
                author TEXT,
                dnb_isbn TEXT,
                dnb_id TEXT,
                cover_url TEXT,
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
                osm_id TEXT,
                isbn TEXT,
                time_of_entry DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(osm_id) REFERENCES bookshelves(osm_id),
                FOREIGN KEY(isbn) REFERENCES books(isbn)
            )
        """)
