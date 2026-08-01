.PHONY: help all run build certs test lint clean

help:
	@echo "Available targets:"
	@echo "TODO: implement help target as wished here:"
	@echo "https://ad-wiki.informatik.uni-freiburg.de/teaching/Reproducibility"

all: build test lint

run:
	npm run dev
	@echo "TODO: implement run-prod/run-dev target"

build:
	npm run build

certs:
	@chmod +x /workspaces/bookfinder/frontend/certs/generate-certs.sh
	/workspaces/bookfinder/frontend/certs/generate-certs.sh

setup: certs build

test:
	@echo "Nothing to test for frontend"

lint:
	@echo "TODO: check why this target is not working"
	npm run lint

clean:
	@echo "TODO: implement or remove this target"
