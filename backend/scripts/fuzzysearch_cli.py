"""Command line interface for the fuzzy search database.

Can be used to try out fuzzy search on the database locally,
without needing a web server.

Can be run from the backend directory via 'make fuzzysearch'.
"""

import argparse
import sys
from pathlib import Path

from app.db.book_db import get_book_from_database
from app.db.database_fuzzy_utils import search_authors, search_titles
from app.models.identifiers import Isbn

# TODO: remove code duplication between interactive and argument modes
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Perform fuzzy search on the database locally."
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
    parser.add_argument(
        "-i",
        "--interactive",
        action="store_true",
        help="Run in interactive mode, to manually enter search queries.",
    )
    parser.add_argument(
        "-med",
        "--max-edit-dist",
        type=int,
        default=2,
        help="Maximum edit distance for fuzzy search matches (default: 2).",
    )
    # db_path is needed because the CLI can't access current_app.config['DB_PATH']
    parser.add_argument(
        "-db",
        "--db-path",
        type=Path,
        required=True,
        help=("Path to the SQLite database file."),
    )
    args = parser.parse_args()

    print(f"\nUsing database at: {args.db_path}")

    if args.interactive:
        print("\nEntering interactive mode. Type 'exit' to quit.")
        while True:
            query = input("Enter search query (author or title): ")
            if query.lower() == "exit":
                break
            print(f"\n === Results for '{query}' === ")
            print("\nAuthor matches:")
            num_matches = 0
            for isbn, score in search_authors(
                query, max_edit_dist=args.max_edit_dist, db_path=args.db_path
            ):
                parsed_isbn = Isbn.parse(isbn)
                if parsed_isbn is None:
                    print(f"Warning: Invalid ISBN '{isbn}' found in database.")
                    continue
                book = get_book_from_database(parsed_isbn, db_path=args.db_path)
                author = book.author if book else None
                title = book.title if book else None
                print(f"{score:.2f}  {isbn}  {author} ({title})")
                num_matches += 1
            print(f"Found {num_matches} books with matching authors.")
            print("\nTitle matches:")
            num_matches = 0
            for isbn, score in search_titles(
                query, max_edit_dist=args.max_edit_dist, db_path=args.db_path
            ):
                parsed_isbn = Isbn.parse(isbn)
                if parsed_isbn is None:
                    print(f"Warning: Invalid ISBN '{isbn}' found in database.")
                    continue
                book = get_book_from_database(parsed_isbn, db_path=args.db_path)
                title = book.title if book else None
                author = book.author if book else None
                print(f"{score:.2f}  {isbn}  {title} ({author})")
                num_matches += 1
            print(f"Found {num_matches} books with matching titles.\n")
        sys.exit(0)  # Exit the script after interactive mode

    if args.author:
        print(f"Searching books with author '{args.author}'...")
        num_matches = 0
        for isbn, score in search_authors(
            args.author, max_edit_dist=args.max_edit_dist, db_path=args.db_path
        ):
            parsed_isbn = Isbn.parse(isbn)
            if parsed_isbn is None:
                print(f"Warning: Invalid ISBN '{isbn}' found in database.")
                continue
            book = get_book_from_database(parsed_isbn, db_path=args.db_path)
            author = book.author if book else None
            title = book.title if book else None
            print(f"{score:.2f}  {isbn}  {author} ({title})")
            num_matches += 1
        print(f"Found {num_matches} books with matching authors.")

    if args.title:
        print(f"Searching books with title '{args.title}'...")
        num_matches = 0
        for isbn, score in search_titles(
            args.title, max_edit_dist=args.max_edit_dist, db_path=args.db_path
        ):
            parsed_isbn = Isbn.parse(isbn)
            if parsed_isbn is None:
                print(f"Warning: Invalid ISBN '{isbn}' found in database.")
                continue
            book = get_book_from_database(parsed_isbn, db_path=args.db_path)
            title = book.title if book else None
            author = book.author if book else None
            print(f"{score:.2f}  {isbn}  {title} ({author})")
            num_matches += 1
        print(f"Found {num_matches} books with matching titles.")

    if not args.author and not args.title:
        print("No search query provided. Use --author or --title to search.")
        sys.exit(1)
