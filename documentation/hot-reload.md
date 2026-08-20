# Hot reloading while in development

The Vite and Flask dev servers both support hot updates for smaller changes made to the source code without restarting the servers.

## Seeing changes in the frontend

- When running the dev server (Vite)
  - Vite will hot update the website once a change is saved
  - no restart needed
- When running the prod server (Caddy)
  - stop the server (`ctrl + c`)
  - rebuild the frontend files via `make build`
  - restart the server (`make run-prod`)
