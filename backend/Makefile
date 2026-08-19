.PHONY: help help-update-bookshelves help-build help-setup help-run-dev help-run-prod \
	help-test help-test-dnb help-checkstyle help-checkstyle-flake8 help-checkstyle-strict \
	help-lint help-fuzzysearch help-optimize-db help-clean \
	update-bookshelves build setup run-dev run-prod test test-dnb checkstyle \
	checkstyle-flake8 checkstyle-strict lint fuzzysearch optimize-db clean

TEST_CMD = pytest -q --doctest-modules --verbose

help:
	@echo "BookFinder Backend Makefile"
	@echo ""
	@echo "You are most likely to be interested in using 'make <target>', where <target> is one of:"
	@echo ""
	@echo "  build      Populate/refresh the bookshelf database (nothing else to build for Python)."
	@echo "  setup      Same as 'build'; provided for consistency with the other Makefiles."
	@echo "  run-dev    Start the backend development server (Flask, server.py)."
	@echo "  run-prod   Start the backend production server (Gunicorn)."
	@echo "  test       Run the backend test suite."
	@echo "  lint       Run the backend linter (alias for 'checkstyle')."
	@echo ""
	@echo "Additional targets:"
	@echo "  update-bookshelves  Import the bookshelf CSV into the database."
	@echo "  optimize-db         Refresh SQLite query planner statistics."
	@echo "  test-dnb            Run the test suite against the real DNB API instead of mocks."
	@echo "  checkstyle          Run Ruff using the project's .ruff.toml config."
	@echo "  checkstyle-flake8   Run Ruff restricted to a flake8-equivalent rule set."
	@echo "  fuzzysearch         Start an interactive local fuzzy search CLI over books.db."
	@echo "  clean               Remove Python cache files and bytecode."
	@echo ""
	@echo "For more information about each target, use 'make help-<target>' for any of the targets above."

update-bookshelves:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	python3 -m scripts.update_bookshelves -f && \
	deactivate

help-update-bookshelves:
	@echo "About 'make update-bookshelves':"
	@echo "  Reads:    backend/scripts/update_bookshelves.py,"
	@echo "            backend/scripts/osm-bookcases-ger-qlever-XXXX-XX-XX.csv,"
	@echo "            backend/books.db"
	@echo "  Produces: updated backend/books.db (bookshelves table)"
	@echo "  Time:     typically < 5 seconds, depending on the size of the CSV file"
	@echo "  Resources: negligible RAM; small disk write to books.db (ca. 1 MB)"
	@echo "  Notes:    Creates the bookshelves table if it doesn't exist yet,"
	@echo "            then updates its rows from a CSV file containing bookshelf information."
	@echo "            Bookshelves no longer present in the CSV are only removed from the table if no"
	@echo "            current_catalog entry references them. Otherwise, they are kept and reported."

optimize-db:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	python3 -m scripts.optimize_database --db-path=/workspaces/bookfinder/backend/books.db && \
	deactivate

help-optimize-db:
	@echo "About 'make optimize-db':"
	@echo "  Reads:    backend/scripts/optimize_database.py, backend/app/db/database_utils.py, backend/books.db"
	@echo "  Produces: optimized SQLite database query planner statistics in books.db (via PRAGMA optimize)"
	@echo "  Time:     typically < 1 s for PRAGMA optimize; more thorough ANALYZE is available via the script"
	@echo "  Resources: negligible"
	@echo "  Notes:    runs the standalone database maintenance CLI for the backend database."

build: update-bookshelves
	@echo "Nothing else to build for Python."

help-build:
	@echo "About 'make build':"
	@echo "  Reads:    backend/scripts/update_bookshelves.py,"
	@echo "            backend/scripts/osm-bookcases-ger-qlever-XXXX-XX-XX.csv,"
	@echo "            backend/books.db"
	@echo "  Produces: updated backend/books.db (bookshelves table)"
	@echo "  Time:     typically < 5 seconds, depending on the size of the CSV file"
	@echo "  Resources: negligible RAM; small disk write to books.db (ca. 1 MB)"
	@echo "  Notes:    just runs 'make update-bookshelves'; there's no separate compile/bundle step"
	@echo "            for the Python backend, so this target exists mainly for symmetry with the"
	@echo "            frontend and top-level Makefiles."

setup: build

help-setup:
	@echo "About 'make setup':"
	@echo "  Reads:    backend/scripts/update_bookshelves.py,"
	@echo "            backend/scripts/osm-bookcases-ger-qlever-XXXX-XX-XX.csv,"
	@echo "            backend/books.db"
	@echo "  Produces: updated backend/books.db (bookshelves table)"
	@echo "  Time:     typically < 5 seconds, depending on the size of the CSV file"
	@echo "  Resources: negligible RAM; small disk write to books.db (ca. 1 MB)"
	@echo "  Notes:    identical to 'make build'; there are no TLS certs or other setup steps needed"
	@echo "            for the backend, unlike the frontend."

run-dev:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	python server.py && \
	deactivate

help-run-dev:
	@echo "About 'make run-dev':"
	@echo "  Reads:    backend/server.py, backend/app/**, backend/books.db"
	@echo "  Produces: running Flask development server process;"
	@echo "            changes to backend/books.db can be made via API calls"
	@echo "  Time:     seconds to start, then runs until interrupted"
	@echo "  Resources: well under 100 MB RAM; negligible disk output"
	@echo "  Notes:    starts server.py directly, using Flask's built-in dev server"
	@echo "            hosts the API at https://localhost:5000/api."
	@echo "            changes to backend/books.db can be made via API calls while it runs."

run-prod:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	gunicorn -w 4 -b 0.0.0.0:5001 'server:create_app()' && \
	deactivate

help-run-prod:
	@echo "About 'make run-prod':"
	@echo "  Reads:    backend/server.py, backend/app/**, backend/books.db"
	@echo "  Produces: running Gunicorn process (4 workers)"
	@echo "            changes to backend/books.db can be made via API calls"
	@echo "  Time:     seconds to start, then runs until interrupted"
	@echo "  Resources: a few hundred MB RAM across the 4 worker processes; negligible disk output"
	@echo "  Notes:    serves the app factory 'server:create_app()' via Gunicorn on 0.0.0.0:5001."
	@echo "            typically used together  with Caddy (see the top-level 'make run-prod'),"
	@echo "            which hosts the API at https://localhost/api."

test:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	PYTHONPATH=/workspaces/bookfinder/backend $(TEST_CMD) /workspaces/bookfinder/backend && \
	deactivate

help-test:
	@echo "About 'make test':"
	@echo "  Reads:    backend/conftest.py, backend/api_tests/**, backend/unit_tests/**, backend/**"
	@echo "  Produces: console output only"
	@echo "  Time:     typically around 15 s"
	@echo "  Resources: a few hundred MB RAM at most; no persistent disk output"
	@echo "  Notes:    runs 'pytest -q --doctest-modules --verbose' over the whole backend/ directory,"
	@echo "            so both unit/api tests and doctests are checked. External services such as"
	@echo "            the DNB API are mocked; use 'make test-dnb' to hit the real API instead."

test-dnb:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	PYTHONPATH=/workspaces/bookfinder/backend $(TEST_CMD) --use-real-dnb-api /workspaces/bookfinder/backend && \
	deactivate

help-test-dnb:
	@echo "About 'make test-dnb':"
	@echo "  Reads:    backend/conftest.py, backend/api_tests/**, backend/unit_tests/**, backend/**"
	@echo "  Produces: console output only"
	@echo "  Time:     typically < 30 s; depends on real DNB API response times"
	@echo "  Resources: a few hundred MB RAM at most; requires network access to the DNB API;
	@echo "            no persistent disk output"
	@echo "  Notes:    same test suite as 'make test', but passes '--use-real-dnb-api' so tests hit"
	@echo "            the live DNB API instead of mocks. Useful for catching integration issues,"
	@echo "            but may be slower or flakier due to network conditions or rate limits."

checkstyle:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	ruff check --no-fix --config /workspaces/bookfinder/.ruff.toml /workspaces/bookfinder/backend && \
	deactivate

help-checkstyle:
	@echo "About 'make checkstyle':"
	@echo "  Reads:    backend/**, .ruff.toml"
	@echo "  Produces: console output only"
	@echo "  Time:     < 3 s"
	@echo "  Resources: negligible"
	@echo "  Notes:    runs Ruff with the project's configured rule set from '.ruff.toml', without"
	@echo "            auto-fixing anything ('--no-fix'). This is what 'make lint' runs by default."

checkstyle-flake8:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	ruff check --no-fix --select E4,E7,E9,F,W,C901 /workspaces/bookfinder/backend && \
	deactivate

help-checkstyle-flake8:
	@echo "About 'make checkstyle-flake8':"
	@echo "  Reads:    backend/**"
	@echo "  Produces: console output only"
	@echo "  Time:     < 3 s"
	@echo "  Resources: negligible"
	@echo "  Notes:    runs Ruff with rules roughly equivalent to a default flake8 setup,"
	@echo "            ignoring the project's own '.ruff.toml' rule selection."

checkstyle-strict:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	ruff check --no-fix --select ALL --ignore D211,D213,TD,COM /workspaces/bookfinder/backend && \
	deactivate

help-checkstyle-strict:
	@echo "About 'make checkstyle-strict':"
	@echo "  Reads:    backend/**"
	@echo "  Produces: console output only"
	@echo "  Time:     < 5 s, but likely reports many more findings than 'make checkstyle'"
	@echo "  Resources: negligible"
	@echo "  Notes:    runs Ruff with every rule enabled ('--select ALL'), except for a few docstring"
	@echo "            and formatting rule groups (D211, D213, TD, COM) that are excluded. Useful for"
	@echo "            an occasional deep pass, not meant to be clean day-to-day."

lint: checkstyle

help-lint:
	@echo "About 'make lint':"
	@echo "  Reads:    backend/**, .ruff.toml"
	@echo "  Produces: console output only"
	@echo "  Time:     < 3 s"
	@echo "  Resources: negligible"
	@echo "  Notes:    alias for 'make checkstyle'."
	@echo "            see 'make help-checkstyle-flake8' for the other available rule set."

fuzzysearch:
	@echo "Starting local fuzzy search CLI..."
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	python3 -m scripts.fuzzysearch_cli -db /workspaces/bookfinder/backend/books.db -i && \
	deactivate

help-fuzzysearch:
	@echo "About 'make fuzzysearch':"
	@echo "  Reads:    backend/scripts/fuzzysearch_cli.py, backend/books.db"
	@echo "  Produces: interactive terminal session; no persistent files"
	@echo "  Time:     runs until you exit the CLI"
	@echo "  Resources: negligible"
	@echo "  Notes:    starts an interactive fuzzy search prompt over books.db, useful for"
	@echo "            manually checking search results without going through the API."
	@echo "            shows all results from the 'books' table, even if they are not on a shelf."

clean:
	rm -f *.pyc
	rm -rf __pycache__

help-clean:
	@echo "About 'make clean':"
	@echo "  Reads:    generated Python cache files and bytecode in backend/"
	@echo "  Produces: deletion of backend *.pyc files and the backend __pycache__ directory"
	@echo "  Time:     < 1 s"
	@echo "  Resources: negligible"
	@echo "  Notes:    only removes generated cache files;"
	@echo "            does not touch backend/books.db or any other build artifacts."