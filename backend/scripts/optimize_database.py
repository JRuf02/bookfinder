"""Standalone CLI for refreshing SQLite query planner statistics.

This helps speed up database queries by improving the query planner's
decisions on whether and how to use indexes.

Can be run from the backend directory via 'make optimize-db'.
"""

import argparse
from pathlib import Path

from app.db.database_utils import analyze_database, optimize_database

DB_PATH = Path(__file__).parent.parent / "books.db"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Optimize the SQLite database for better query performance."
    )
    parser.add_argument(
        "-db",
        "--db-path",
        type=Path,
        default=DB_PATH,
        help=f"Path to the SQLite database file (default: {DB_PATH}).",
    )
    parser.add_argument(
        "-a",
        "--analyze",
        action="store_true",
        help="Run ANALYZE instead of PRAGMA optimize. More thorough but takes longer.",
    )
    args = parser.parse_args()

    print(f"Using database at: {args.db_path}")
    if args.analyze:
        print("Running ANALYZE...")
        analyze_database(args.db_path)
    else:
        print("Running PRAGMA optimize...")
        optimize_database(args.db_path)
    print("Database maintenance complete.")
