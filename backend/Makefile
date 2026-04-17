TEST_CMD = pytest -q --doctest-modules --verbose

help:
	@echo "Not implemented yet"

all: compile test checkstyle-flake8 run

run:
	source /workspaces/isbn-scanner-venv/.venv/bin/activate && \
	python server.py && \
	deactivate

compile:
	@echo "Nothing to compile for Python"

test:
	source /workspaces/isbn-scanner-venv/.venv/bin/activate && \
	PYTHONPATH=/workspaces/isbn-scanner/backend $(TEST_CMD) /workspaces/isbn-scanner/backend && \
	deactivate

checkstyle:
	source /workspaces/isbn-scanner-venv/.venv/bin/activate && \
	ruff check --no-fix --config /workspaces/isbn-scanner/.ruff.toml /workspaces/isbn-scanner/backend && \
	deactivate

checkstyle-flake8:
	source /workspaces/isbn-scanner-venv/.venv/bin/activate && \
	ruff check --no-fix --select E4,E7,E9,F,W,C901 /workspaces/isbn-scanner/backend && \
	deactivate

checkstyle-strict:
	source /workspaces/isbn-scanner-venv/.venv/bin/activate && \
	ruff check --no-fix --select ALL --ignore D211,D213,TD,COM /workspaces/isbn-scanner/backend && \
	deactivate

clean:
	rm -f *.pyc
	rm -rf __pycache__