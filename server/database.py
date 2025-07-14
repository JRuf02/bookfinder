import sqlite3
import os
from book import Book


def init_db() -> None:
    """Initialize the SQLite database."""
    db_path = os.path.join(os.path.dirname(__file__), "books.db")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
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
    conn.commit()
    conn.close()