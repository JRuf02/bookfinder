TEST_CMD = pytest -q --doctest-modules --verbose
CHECKSTYLE_CMD = ruff check --no-fix --config /workspaces/isbn-scanner/.ruff.toml

help:
	@echo "Not implemented yet"

all: compile test checkstyle run

run:
	source /workspaces/isbn-scanner-venv/.venv/bin/activate && \
	python server.py && \
	deactivate

compile:
	@echo "Nothing to compile for Python"

test:
	source /workspaces/isbn-scanner-venv/.venv/bin/activate && \
	$(TEST_CMD) /workspaces/isbn-scanner/backend && \
	deactivate

checkstyle:
	source /workspaces/isbn-scanner-venv/.venv/bin/activate && \
	$(CHECKSTYLE_CMD) /workspaces/isbn-scanner/backend && \
	deactivate

clean:
	rm -f *.pyc
	rm -rf __pycache__