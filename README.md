# bookFinder

### Setup VS-Code Devcontainer

Use the provided Devcontainer to make the usage as easy as possible:

- Install [Docker](https://www.docker.com/) and [VS Code](https://code.visualstudio.com/)
- Install VS Code Devcontainer extension `ms-vscode-remote.remote-containers`
- Open this repository
- Press `F1` (or `CTRL + SHIFT + P`) and select `Dev Containers: Rebuild and Reopen Container`

### Shortcut: Run all dev servers with one command in vscode

- Press `ctrl + P`
- Type `task Run All Servers`

### Run servers manually

- Run `npm run dev` in directory `\workspaces\isbn-scanner\frontend` inside the Devcontainer to start vite (react dev server)
- Run `make run` in directory `\workspaces\isbn-scanner\backend` inside the Devcontainer to start the book data api server (flask) (might need 'make install' first!)

### Show the website

- Click on the popup by VS code to open the website in the browser after starting the server
- Or go to https://127.0.0.1:5173/

### Show the website on another device

- Start vite and flask servers in the container
- Connect host and the device to the same network (no eduroam!)
- Run ipconfig on the host (outside the docker container) to find its IPv4 address
- Open `https://[host-ip]:5173/` on your device's browser
- Accept self-signed certificate
- Accept camera permission popup

## show on mobile

- connect to same network / router
- find ipv4 address of host via iplookup
- go to `https://hostip:5173`

### easy open on mobile (experimental, doesn't work on Windows host yet)

```
# Display the host IP address for QR code generation
HOST_IP=$(hostname -i | awk '{print $1}')
echo "Your application is running at: https://${HOST_IP}:5173"
echo "Scan this QR code on your mobile device to access the app:"
qrencode -t ANSIUTF8 "https://${HOST_IP}:5173"

# Or open in the host browser
"$BROWSER" "https://${HOST_IP}:5173"
```

## Sqlite3 DB & Python API

### SQLite tables and their columns:

**table books:**
isbn dnb-isbn title author (link-to)-cover-image ...<br>
**table bookshelves:**
osm-id name (location)<br>
**table current-catalog:**
entry-id osm-id isbn time-of-entry

### Insert or remove books into/from the db via the api

Change the table:

```
curl -X POST http://localhost:5000/api/shelf/insert -H "Content-Type: application/json" -d '{"osm_id": "123456", "isbn": "9781234567890"}'
```

```
curl -X POST http://localhost:5000/api/shelf/remove -H "Content-Type: application/json" -d '{"osm_id": "123456", "isbn": "9781234567890"}'
```

Show the table:

```
cd backend
apk update && apk add sqlite
sqlite3 books.db
.headers on
.mode column
SELECT * FROM current_catalog;
```

Show number of entries:

```
SELECT COUNT(*) FROM bookshelves;
```

## Other sample api requests

```
http://127.0.0.1:5000/api/shelf/metadata?osm_id=https://www.openstreetmap.org/node/6073946680

http://127.0.0.1:5000/api/bookshelves/nearby?lat=48.0518572&lon=7.9032527

http://127.0.0.1:5000/api/shelf/books?osm_id=https://www.openstreetmap.org/node/6073946680

http://127.0.0.1:5000/api/catalog/search?lat=48.05&lon=7.90&title=Informatik
```

## TODOS

see `todos.md`

## Note to me

### Persisting library versions and vscode extensions

- Installed VSCode extension? -> add it to `.devcontainer/devcontainer.json` to persist it
- Install and persist Python libraries
  1. Start the venv: `source /workspaces/isbn-scanner-venv/.venv/bin/activate`
  2. Install via pip: `pip install [package-name]`
  3. Find the version number in the success message
  4. Add the library with its version number to the pip install command in the Dockerfile
- Want to enforce a VSCode setting for this project? -> add it to `.vscode/settings.json` to persist it
