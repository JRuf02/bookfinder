.PHONY: help build setup run-dev run-prod test lint clean

SUBDIRS := backend frontend

help:
	@echo "Available targets:"
	@echo "TODO: implement help target as wished here:"
	@echo "https://ad-wiki.informatik.uni-freiburg.de/teaching/Reproducibility"

build:
	make -C frontend build
	make -C backend build

setup:
	make -C frontend setup
	make -C backend setup

run-dev:
	@set -e; \
	trap 'kill "$$frontend_pid" 2>/dev/null || true' EXIT; \
	$(MAKE) -C frontend run-dev & frontend_pid=$$!; \
	$(MAKE) -C backend run-dev

run-prod:
	make -C backend run-prod & \
	caddy run --config /workspaces/bookfinder/reverse-proxy/Caddyfile

test:
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir test || exit $$?; \
	done

lint:
	make -C backend lint
	make -C frontend lint

clean:
	make -C backend clean
	make -C frontend clean