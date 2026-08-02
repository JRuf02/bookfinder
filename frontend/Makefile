.PHONY: help all run-dev run-prod build certs test lint clean

help:
	@echo "Available targets:"
	@echo "TODO: implement help target as wished here:"
	@echo "https://ad-wiki.informatik.uni-freiburg.de/teaching/Reproducibility"

all: build test lint
	@echo "TODO: check what this target should do / if it is needed."

run-dev:
	npm run dev

run-prod:
	@echo "Starting frontend in production mode..."
	@echo "Don't forget to also start the backend server if needed!"
	caddy run --config /workspaces/bookfinder/reverse-proxy/Caddyfile

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
