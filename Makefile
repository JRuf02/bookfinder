.DEFAULT_GOAL := help

SUBDIRS := backend frontend

.PHONY: help help-build help-setup help-run-dev help-run-prod help-test help-lint help-clean \
	build setup run-dev run-prod test lint clean

help:
	@echo ""
	@echo "BookFinder Makefile"
	@echo ""
	@echo "This Makefile is a convenience wrapper for the frontend and backend Makefiles."
	@echo "It allows you to run the most common targets for frontend and backend with a single command."
	@echo ""
	@echo "You are most likely to be interested in using 'make <target>', where <target> is one of:"
	@echo ""
	@echo "  run-dev    Start the frontend and backend development servers."
	@echo "  run-prod   Start the frontend and backend production servers."
	@echo "  test       Run the frontend and backend tests."
	@echo "  lint       Run the frontend and backend linters."
	@echo ""
	@echo "Additional targets:"
	@echo "  setup      Build the frontend, generate TLS certificates, import bookshelves into the database."
	@echo "  build      Build the frontend bundle and refresh or create the backend bookshelf database."
	@echo "  clean      Remove generated cache and bytecode files."
	@echo ""
	@echo "For more information about each target, use 'make help-<target>' for any of the targets above."
	@echo ""
	@echo "More targets are available in the frontend and backend Makefiles,"
	@echo "which can be run with 'make -C frontend <target>' or 'make -C backend <target>'."
	@echo "To find out what targets are available there, run 'make -C frontend help' or 'make -C backend help'."
	@echo ""

build:
	make -C frontend build
	make -C backend build

help-build:
	@echo "About 'make build':"
	@echo "  Reads:    frontend/**,"
	@echo "            backend/scripts/update_bookshelves.py, backend/scripts/osm-bookcases-ger-qlever-XXXX-XX-XX.csv,"
	@echo "            backend/books.db"
	@echo "  Produces: frontend/dist/, updated backend/books.db (bookshelves table)"
	@echo "  Time:     around 15 s for rebuilds; < 2 min for first build"
	@echo "  Resources: a few hundred MB RAM while Vite compiles; 3 MB disk output"
	@echo "  Notes:    Frontend will be built using Vite; backend bookshelf database updated from the CSV file."
	@echo "            update the bookshelf database without rebuilding the frontend: 'make -C backend update-bookshelves'"
	@echo "            rebuild the frontend without updating the bookshelf database: 'make -C frontend build'"
	@echo "            If you want the app to be fully set up for running, use 'make setup' instead of 'make build'."

setup:
	make -C frontend setup
	make -C backend setup

help-setup:
	@echo "About 'make setup':"
	@echo "  Reads:    frontend/certs/generate-certs.sh, frontend/**"
	@echo "            backend/scripts/update_bookshelves.py, backend/scripts/osm-bookcases-ger-qlever-XXXX-XX-XX.csv,"
	@echo "            backend/books.db,"
	@echo "            backend/Makefile, frontend/Makefile"
	@echo "  Produces: frontend/certs/cert.pem, frontend/certs/key.pem, frontend/dist/, updated backend/books.db"
	@echo "  Time:     typically around 20 s; < 2 min for first build"
	@echo "  Resources: a few hundred MB RAM during the build steps; 3 MB disk output"
	@echo "  Notes:    Runs 'make build' for frontend and backend, then creates TLS certificates for HTTPS."
	@echo "            This target will be run automatically on container build, so you don't need to run it manually,"
	@echo "            unless you want to rebuild the frontend and refresh the bookshelf database."

run-dev:
	@set -e; \
	trap 'kill "$$frontend_pid" 2>/dev/null || true' INT TERM EXIT; \
	$(MAKE) -C frontend run-dev & frontend_pid=$$!; \
	$(MAKE) -C backend run-dev

help-run-dev:
	@echo "About 'make run-dev':"
	@echo "  Reads:    frontend/certs/cert.pem, frontend/certs/key.pem, frontend/**,"
	@echo "            backend/server.py, backend/app/**, backend/books.db,"
	@echo "            backend/Makefile, frontend/Makefile"
	@echo "  Produces: running frontend and backend dev server processes (debug mode & HMR enabled);"
	@echo "            changes to backend/books.db can be made via API calls"
	@echo "  Time:     < 10 s to start, then runs until interrupted"
	@echo "  Resources: a few hundred MB RAM for the two servers; negligible disk output"
	@echo "  Notes:    Serves the frontend through Vite and proxies /api requests to the Flask backend."
	@echo "            Hosts the web app at https://localhost:5173 and the backend at https://localhost:5000/api"

run-prod:
	@set -e; \
	trap 'kill "$$backend_pid" "$$caddy_pid" 2>/dev/null || true' INT TERM EXIT; \
	$(MAKE) -C backend run-prod & backend_pid=$$!; \
	caddy run --config /workspaces/bookfinder/reverse-proxy/Caddyfile & caddy_pid=$$!; \
	wait "$$backend_pid" "$$caddy_pid"

help-run-prod:
	@echo "About 'make run-prod':"
	@echo "  Reads:    frontend/dist/, frontend/certs/cert.pem, frontend/certs/key.pem,"
	@echo "            backend/server.py, backend/app/**,"
	@echo "            backend/books.db, reverse-proxy/Caddyfile,"
	@echo "            backend/Makefile"
	@echo "  Produces: running backend and Caddy production server processes;"
	@echo "            changes to backend/books.db can be made via API calls"
	@echo "  Time:     < 10 s to start, then runs until interrupted"
	@echo "  Resources: a few hundred MB RAM; negligible disk output"
	@echo "  Notes:    Serves the built frontend through Caddy and proxies /api requests"
	@echo "            to the backend via Gunicorn."
	@echo "            Hosts the web app at https://localhost"

test:
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir test || exit $$?; \
	done

help-test:
	@echo "About 'make test':"
	@echo "  Reads:    backend/api_tests/**, backend/unit_tests/**, backend/app/**, "
	@echo "            backend/Makefile, frontend/Makefile"
	@echo "  Produces: console output only"
	@echo "  Time:     < 1 min without cache, typically around 15 s"
	@echo "  Resources: a few hundred MB RAM at most; no persistent disk output"

lint:
	make -C backend lint
	make -C frontend lint

help-lint:
	@echo "About 'make lint':"
	@echo "  Reads:    backend/**, frontend/**,"
	@echo "  Produces: console output only"
	@echo "  Time:     < 10 s"
	@echo "  Resources: a few hundred MB RAM at most; no persistent disk output"
	@echo "  Notes:    backend lint uses Ruff; frontend lint uses ESLint."

clean:
	make -C backend clean
	make -C frontend clean

help-clean:
	@echo "About 'make clean':"
	@echo "  Reads:    generated Python cache files and bytecode, frontend/Makefile, backend/Makefile"
	@echo "  Produces: deletion of backend *.pyc files and backend __pycache__ directories"
	@echo "  Time:     < 1 s"
	@echo "  Resources: negligible"
	@echo "  Notes:    this target only removes generated cache files, not build artifacts such as frontend/dist."