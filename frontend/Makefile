.PHONY: help help-build help-certs help-setup help-run-dev help-run-prod help-test help-lint help-clean \
	build certs setup run-dev run-prod test lint clean

help:
	@echo "BookFinder Frontend Makefile"
	@echo ""
	@echo "You are most likely to be interested in using 'make <target>', where <target> is one of:"
	@echo ""
	@echo "  build      Build the frontend production bundle."
	@echo "  setup      Generate local TLS certs and build the frontend."
	@echo "  run-dev    Start the frontend development server (Vite, with HMR)."
	@echo "  run-prod   Start the frontend production server (Caddy)."
	@echo "  lint       Run the frontend linter."
	@echo ""
	@echo "Additional targets:"
	@echo "  certs      Generate / update local TLS certificates."
	@echo "  test       Placeholder; there are no frontend tests (trivial logic)."
	@echo "  clean      Remove build files."
	@echo ""
	@echo "For more information about each target, use 'make help-<target>' for any of the targets above."


build:
	npm run build

help-build:
	@echo "About 'make build':"
	@echo "  Reads:    frontend/src/**, frontend/public/**, frontend/index.html, frontend/images/**,"
	@echo "            frontend/package.json, frontend/package-lock.json,"
	@echo "            frontend/vite.config.ts, frontend/tsconfig.json"
	@echo "  Produces: frontend/dist/"
	@echo "  Time:     around 15 s"
	@echo "  Resources: a few hundred MB RAM while Vite compiles; a few MB disk output"
	@echo "  Notes:    runs the Vite production build ('npm run build')."

certs:
	@chmod +x /workspaces/bookfinder/frontend/certs/generate-certs.sh
	/workspaces/bookfinder/frontend/certs/generate-certs.sh

help-certs:
	@echo "About 'make certs':"
	@echo "  Reads:    frontend/certs/generate-certs.sh"
	@echo "  Produces: frontend/certs/cert.pem, frontend/certs/key.pem"
	@echo "  Time:     < 5 s"
	@echo "  Resources: negligible"
	@echo "  Notes:    generates self-signed TLS certificates used by the dev and prod servers for HTTPS."
	@echo "            overwrites any existing cert.pem/key.pem in frontend/certs/."

setup: certs build

help-setup:
	@echo "About 'make setup':"
	@echo "  Reads:    frontend/certs/generate-certs.sh, frontend/src/**, frontend/public/**,"
	@echo "            frontend/index.html, frontend/images/**,"
	@echo "            frontend/package.json, frontend/package-lock.json,"
	@echo "            frontend/vite.config.ts, frontend/tsconfig.json"
	@echo "  Produces: frontend/certs/cert.pem, frontend/certs/key.pem, frontend/dist/"
	@echo "  Time:     around 20 s"
	@echo "  Resources: a few hundred MB RAM while Vite compiles; a few MB disk output"
	@echo "  Notes:    runs 'make certs' followed by 'make build'."

run-dev:
	npm run dev

help-run-dev:
	@echo "About 'make run-dev':"
	@echo "  Reads:    frontend/certs/cert.pem, frontend/certs/key.pem,"
	@echo "            frontend/src/**, frontend/public/**,"
	@echo "            frontend/index.html, frontend/images/**,"
	@echo "            frontend/package.json, frontend/package-lock.json,"
	@echo "            frontend/vite.config.ts, frontend/tsconfig.json"
	@echo "  Produces: running Vite dev server process; no persistent files"
	@echo "  Time:     seconds to start, then runs until interrupted"
	@echo "  Resources: a few hundred MB RAM; negligible disk output"
	@echo "  Notes:    serves the app with hot module reloading and proxies /api requests to the backend."
	@echo "            hosts the web app at https://localhost:5173."
	@echo "            needs cert.pem and key.pem to exist so HTTPS works."

run-prod:
	@echo "Starting frontend in production mode..."
	@echo "Don't forget to also start the backend server if needed!"
	caddy run --config /workspaces/bookfinder/reverse-proxy/Caddyfile

help-run-prod:
	@echo "About 'make run-prod':"
	@echo "  Reads:    frontend/dist/, frontend/certs/cert.pem, frontend/certs/key.pem,"
	@echo "            reverse-proxy/Caddyfile"
	@echo "  Produces: running Caddy process serving the built frontend; no persistent files"
	@echo "  Time:     seconds to start, then runs until interrupted"
	@echo "  Resources: a few hundred MB RAM; negligible disk output"
	@echo "  Notes:    serves the already-built frontend (run 'make build' first) via Caddy."
	@echo "            does not start the backend; start it separately if you need it."
	@echo "            hosts the web app at https://localhost."

test:
	@echo "Nothing to test for frontend"

help-test:
	@echo "About 'make test':"
	@echo "  Status:   placeholder; there is currently no frontend test suite."
	@echo "  Reads:    nothing"
	@echo "  Produces: console output only ('Nothing to test for frontend')"
	@echo "  Time:     instant"
	@echo "  Resources: negligible"

lint:
	npm run lint

help-lint:
	@echo "About 'make lint':"
	@echo "  Reads:    frontend/src/**, frontend/eslint.config.js"
	@echo "  Produces: console output only"
	@echo "  Time:     < 10 s"
	@echo "  Resources: a few hundred MB RAM at most; no persistent disk output"
	@echo "  Notes:    runs 'npm run lint' (ESLint)."

clean:
	rm -rf /workspaces/bookfinder/frontend/dist/

help-clean:
	@echo "About 'make clean':"
	@echo "  Reads:    frontend/dist/"
	@echo "  Produces: deletion of frontend/dist/ and its contents"
	@echo "  Time:     instant"
	@echo "  Resources: negligible"
	@echo "  Notes:    removes frontend build files."