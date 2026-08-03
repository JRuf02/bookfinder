"""Standalone script to set up and update the bookshelves table in the SQLite database.

Creates the bookshelves table if it doesn't exist yet,
then updates its rows from a CSV file containing bookshelf information.

Bookshelves no longer present in the CSV are only removed from the table if no
current_catalog entry references them. Otherwise, they are kept and reported.

Can be run from the backend directory via 'make update-bookshelves'.
"""

import argparse
import csv
import json
import re
from pathlib import Path

from app.db.database import db_cursor

CSV_PATH = Path(__file__).parent / "osm-bookcases-ger-qlever-2026-08-03.csv"
DB_PATH = Path(__file__).parent.parent / "books.db"


def parse_shape(shape: str) -> tuple[float | None, float | None]:
    """Extract longitude and latitude from shape column."""
    if shape.startswith("POINT("):
        coords = shape[6:-1].split()
        if len(coords) == 2:  # noqa: PLR2004
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


def _update_bookshelves() -> None:
    with db_cursor(DB_PATH) as c:
        # Ensure the bookshelves table exists
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

        # Read CSV and update rows
        csv_osm_ids: set[str] = set()
        with CSV_PATH.open(newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                osm_id = row.get("osm_id") or None
                if osm_id is None:
                    continue  # can't update without primary key
                csv_osm_ids.add(osm_id)

                shape = str(row.get("shape", ""))
                lat, lon = parse_shape(shape) if shape else (None, None)
                c.execute(
                    """
                    INSERT INTO bookshelves (
                        osm_id, name, latitude, longitude, address, type, operator,
                        website, opening_hours, osm_check_date, osm_last_updated
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(osm_id) DO UPDATE SET
                        name             = excluded.name,
                        latitude         = excluded.latitude,
                        longitude        = excluded.longitude,
                        address          = excluded.address,
                        type             = excluded.type,
                        operator         = excluded.operator,
                        website          = excluded.website,
                        opening_hours    = excluded.opening_hours,
                        osm_check_date   = excluded.osm_check_date,
                        osm_last_updated = excluded.osm_last_updated
                """,
                    (
                        row.get("osm_id"),
                        row.get("name") or None,
                        lat,
                        lon,
                        None,  # address is usually not included in the CSV
                        row.get("type") or None,
                        row.get("operator") or None,
                        row.get("website") or None,
                        row.get("opening_hours") or None,
                        row.get("osm_check_date") or None,
                        row.get("osm_last_updated") or None,
                    ),
                )

        # Find shelves in the DB that are not in the CSV
        c.execute("SELECT osm_id FROM bookshelves")
        db_osm_ids = {r["osm_id"] for r in c.fetchall()}
        stale_ids = db_osm_ids - csv_osm_ids

        # delete shelves that are not in the CSV and not referenced in current_catalog
        deleted, kept_referenced = [], []
        if stale_ids:
            c.execute(
                "SELECT DISTINCT osm_id FROM current_catalog "
                "WHERE osm_id IN (SELECT value FROM json_each(?))",
                (json.dumps(list(stale_ids)),),
            )
            referenced_ids = {r["osm_id"] for r in c.fetchall()}

            deletable_ids = stale_ids - referenced_ids
            kept_referenced = sorted(referenced_ids)

            if deletable_ids:
                c.execute(
                    "DELETE FROM bookshelves WHERE osm_id IN "
                    "(SELECT value FROM json_each(?))",
                    (json.dumps(list(deletable_ids)),),
                )
                deleted = sorted(deletable_ids)

    print("Table bookshelves updated from CSV:")
    print(f"|--- CSV path:         {CSV_PATH}")
    print(f"|--- Database path:    {DB_PATH}")
    print(f"|--- Updated/Inserted: {len(csv_osm_ids)} shelves")
    if deleted:
        print(f"|--- Removed:          {len(deleted)} shelves")
    if kept_referenced:
        print(
            f"|--- WARNING: {len(kept_referenced)} shelves missing from the new CSV "
            "were kept because current_catalog still references them:"
        )
        for osm_id in kept_referenced:
            print(f"     - {osm_id}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Create/update the bookshelves table of the SQLite "
        "database with data from a CSV file."
    )
    parser.add_argument(
        "-f",
        "--force",
        action="store_true",
        help="Skip the confirmation prompt.",
    )
    args = parser.parse_args()

    if args.force:
        print("Updating bookshelves table...")
        _update_bookshelves()
    else:
        inp = input(
            f"This will update the bookshelves table with data from {CSV_PATH}.\n"
            "Existing rows not referenced elsewhere and missing from the CSV "
            "will be removed.\nAre you sure? (yes/no): "
        )
        if inp.strip().lower() == "yes":
            print("Updating bookshelves table...")
            _update_bookshelves()
