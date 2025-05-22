TEST_CMD = python3 -m doctest
CHECKSTYLE_CMD = flake8

help:
	@echo "Not implemented yet"

install:
	python3 -m venv /workspaces/isbn-scanner/.venv && \
	. /workspaces/isbn-scanner/.venv/bin/activate && \
	pip install -r requirements.txt

all: compile test checkstyle run

run:
	. /workspaces/isbn-scanner/.venv/bin/activate && \
	python server.py

compile:
	@echo "Nothing to compile for Python"

test:
	. /workspaces/isbn-scanner/.venv/bin/activate && \
	$(TEST_CMD) *.py

checkstyle:
	. /workspaces/isbn-scanner/.venv/bin/activate && \
	$(CHECKSTYLE_CMD) *.py

clean:
	rm -f *.pyc
	rm -rf __pycache__