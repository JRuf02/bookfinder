import sqlite3
import csv
import os
import re

DB_PATH = os.path.join(os.path.dirname(__file__), "books.db")
CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "osm-bookcases-ger-qlever-2025-07-13.csv")


# TODO: WRITE TESTS FOR THIS!!!


def parse_shape(shape):
    """Extract longitude and latitude from shape column."""
    if shape.startswith("POINT("):
        coords = shape[6:-1].split()
        if len(coords) == 2:
            lon, lat = coords
            return float(lat), float(lon)
    elif shape.startswith("POLYGON("):
        # Take first coordinate of polygon
        match = re.search(r"\(\(([^)]+)\)\)", shape)
        if match:
            first_pair = match.group(1).split(",")[0].strip()
            lon, lat = first_pair.split()
            return float(lat), float(lon)
    return None, None

def _reset_bookshelves():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # Drop and recreate table
    c.execute("DROP TABLE IF EXISTS bookshelves")
    c.execute("""
        CREATE TABLE bookshelves (
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
    conn.commit()

    # Read CSV and insert rows
    with open(CSV_PATH, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            shape = row.get("shape", "")
            lat, lon = parse_shape(shape) if shape else (None, None)
            c.execute("""
                INSERT OR REPLACE INTO bookshelves (
                    osm_id, name, latitude, longitude, address, type, operator, website,
                    opening_hours, osm_check_date, osm_last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                row.get("osm_id") or None,
                row.get("name") or None,
                lat,
                lon,
                None,  # location not in CSV
                row.get("type") or None,
                row.get("operator") or None,
                row.get("website") or None,
                row.get("opening_hours") or None,
                row.get("osm_check_date") or None,
                row.get("osm_last_updated") or None
            ))
    conn.commit()
    conn.close()
    print("bookshelves table reset and filled from CSV.")

if __name__ == "__main__":
    inp = input("This will drop and recreate the bookshelves table. Are you sure? (yes/no): ")
    if inp.strip().lower() == "yes":
        print("Resetting bookshelves table...")
        _reset_bookshelves()