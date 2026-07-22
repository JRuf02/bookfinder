TEST_CMD = pytest -q --doctest-modules --verbose

help:
	@echo "Not implemented yet"

all: test checkstyle-flake8 run

run:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	python server.py && \
	deactivate

run-prod:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	gunicorn -w 4 -b 0.0.0.0:5001 'server:create_app()' && \
	deactivate

build: reset-bookshelves
	@echo "Nothing to build for Python."

test:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	PYTHONPATH=/workspaces/bookfinder/backend $(TEST_CMD) /workspaces/bookfinder/backend && \
	deactivate

test-dnb:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	PYTHONPATH=/workspaces/bookfinder/backend $(TEST_CMD) --use-real-dnb-api /workspaces/bookfinder/backend && \
	deactivate

checkstyle:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	ruff check --no-fix --config /workspaces/bookfinder/.ruff.toml /workspaces/bookfinder/backend && \
	deactivate

checkstyle-flake8:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	ruff check --no-fix --select E4,E7,E9,F,W,C901 /workspaces/bookfinder/backend && \
	deactivate

checkstyle-strict:
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	ruff check --no-fix --select ALL --ignore D211,D213,TD,COM /workspaces/bookfinder/backend && \
	deactivate

reset-bookshelves:
	@echo "Resetting bookshelves table in database..."
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	python3 -m scripts.reset_bookshelves -f && \
	deactivate

fuzzysearch:
	@echo "Starting local fuzzy search CLI..."
	source /workspaces/bookfinder-venv/.venv/bin/activate && \
	python3 -m scripts.fuzzysearch_cli -db /workspaces/bookfinder/backend/books.db -i && \
	deactivate

clean:
	rm -f *.pyc
	rm -rf __pycache__