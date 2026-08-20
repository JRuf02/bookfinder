# SQLite3 DB & Python API

## Database schema

The database `backend/books.db` consists of the following seven tables:

**table books:**

- isbn (primary key)
- title
- author
- dnb_id
- cover_url
- total_insertions
- avg_days_until_takeout
- time_of_entry

**table bookshelves:**

- osm_id (primary key)
- name
- latitude
- longitude
- address
- type
- operator
- website
- opening_hours
- osm_check_date
- osm_last_updated
- time_of_entry

**table current_catalog:**

- entry_id (primary key, autoincrement)
- osm_id -> bookshelves.osm_id
- isbn -> books.isbn
- time_of_entry

**fuzzy search tables:**

- tokens: token_id, token
- author_name_tokens: token_id, isbn
- book_title_tokens: token_id, isbn
- threegrams: threegram, token_id

Indexes are created for current catalog lookups and fuzzy-search lookups (`idx_current_catalog_osm_id`, `idx_current_catalog_isbn`, `idx_author_name_tokens_token_id`, `idx_book_title_tokens_token_id`, `idx_threegrams_threegram`).

## Show the tables

### In VS Code

Open the db file in vs code with the `qwtel.sqlite-viewer` extension (preinstalled if you run this project via the devcontainer).

### In a standalone Docker container

Example commands, please alter as needed.

```
cd backend
apk update && apk add sqlite
sqlite3 books.db
.headers on
.mode column
SELECT * FROM current_catalog;
```

Or quickly (not as nicely formatted):

```
sqlite3 backend/books.db "SELECT * FROM current_catalog;"
```

## Insert or remove books into/from the DB via the API

Change the table:

```
curl -X POST http://localhost:5000/api/shelf/insert -H "Content-Type: application/json" -d '{"osm_id": "123456", "isbn": "9781234567890"}'
```

```
curl -X POST http://localhost:5000/api/shelf/remove -H "Content-Type: application/json" -d '{"osm_id": "123456", "isbn": "9781234567890"}'
```

### Other sample api requests

```
http://127.0.0.1:5000/api/shelf/metadata?osm_id=https://www.openstreetmap.org/node/6073946680

http://127.0.0.1:5000/api/bookshelves/nearby?lat=48.0518572&lon=7.9032527

http://127.0.0.1:5000/api/shelf/books?osm_id=https://www.openstreetmap.org/node/6073946680

http://127.0.0.1:5000/api/catalog/search?lat=48.05&lon=7.90&title=Harry
```

More endpoints are listed in `documentation/system-diagrams-and-api-endpoints/api-parameters.md`.

## API Tests

Each API endpoint has been thoroughly tested via the `pytest` framework. The tests can be found in `backend/api_tests/`. Run `make test` within the backend directory to run all tests.

## Test a single file, with detailed diffs

```
cd backend
source /workspaces/bookfinder-venv/.venv/bin/activate
PYTHONPATH=/workspaces/bookfinder/backend pytest -vv api_tests/cover_api_test.py
```
