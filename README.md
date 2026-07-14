# bookFinder

## There are two ways to install and run this app

First, you need to clone this repository onto your machine. Then you can open it either within a VS Code Devcontainer or within a standard Docker Container.

### A) VS Code Devcontainer

- Recommended if you want to open this project in VS Code
- Installs all the extensions you might need and configures the VS Code settings for this project
- Your local VS Code installation remains unchanged
- Isolation similar to a standard Docker container
- You can run the production setup in here, but this is best suited for development

#### Setup VS Code Devcontainer

Use the provided Devcontainer to make the usage as easy as possible:

- Install [Docker](https://www.docker.com/) and [VS Code](https://code.visualstudio.com/)
- Install VS Code Devcontainer extension `ms-vscode-remote.remote-containers`
- Clone this repository onto your machine (Into the linux file system if using WSL)
- Open this repository with VS Code
- Press `F1` (or `CTRL + SHIFT + P`) and select `Dev Containers: Rebuild and Reopen Container`

#### Run dev servers

##### Shortcut: Run all dev servers with one command in vs code

- Press `ctrl + P`
- Type `task Run All Servers`

##### Run dev servers manually

- Run `npm run dev` in directory `\workspaces\bookfinder\frontend` inside the container to start vite (react dev server)
- Run `make run` in directory `\workspaces\bookfinder\backend` inside the container to start the book data api server (flask) (might need 'make install' first!)

#### Run production servers

- Run `make run-prod` in the main directory `\workspaces\bookfinder`

### B) Within a standalone Docker container

If you simply want to run this app without looking much at the code or if you want to use it in an production setting (e.g. in a multi-container setting), you can run it within a standard Docker container.
This is optimized for the production setup, but you can also run the development servers in here.

#### Setup the container

Please follow the instructions given in the comments at the end of the `Dockerfile`.

#### Run dev servers

- Run `npm run dev` in directory `\workspaces\bookfinder\frontend` inside the container to start vite (react dev server)
- Run `make run` in directory `\workspaces\bookfinder\backend` inside the container to start the book data api server (flask) (might need 'make install' first!)

#### Run production servers

- Run `make run-prod` in the main directory `\workspaces\bookfinder`

## Show the website

### Development Setup (Vite + Flask)

- Start the dev servers: See above
- Open https://localhost:5173/
- Accept self-signed certificate
- Backend: `https://localhost:5173/api/health` (or directly https://localhost:5000/api/health)

### Production Setup (Caddy + Gunicorn)

- Start the prod servers: `make run-prod`
- Open https://localhost/
  - https://localhost:5173/ and https://localhost:443/ will work as well
- Accept self-signed certificate
- Backend: https://localhost/api/health
  - https://localhost:5173/api/health and https://localhost:443/api/health will work as well

### Show the website on another device

- Start backend and frontend servers in the container
- Connect host and the device to the same network (no eduroam!)
- Run ipconfig on the host (outside the docker container) to find its IPv4 address
- Open `https://[host-ip]:5173/` on your device's browser
- Accept self-signed certificate

### show on mobile

- connect to same network / router
- find ipv4 address of host via ipconfig
- go to `https://hostip:5173`

### If it fails

- Check that you used the right ipv4 address from ipconfig (wireless-LAN, not ethernet)
- Add firewall rule (allow inbound TCP on 5137 and 5000) on host if it does not exist
- Use another wifi (public wifis like eduroam may have client isolation)

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

## Making changes in the frontend

- When running the dev server (Vite)
  - Vite will hot update the website once a change is saved
  - no restart needed
- When running the prod server (Caddy)
  - stop the server (`ctrl + c`)
  - rebuild the frontend files via `make build`
  - restart the server (`make run-prod`)

## Synchronizing files between host and container

- If you are using VS Code devcontainer, any changes made to the repo on the host will automatically be synched into the container and vice versa via a bind mount.
  - No need to do anything
  - Changes made inside the container will also be synced back to your host

- If you are using a standalone container via the instructions in the Dockerfile, all files of the repo will be copied into the container once, at creation.
  - Nothing you do inside the container will affect the original files on your host
  - Nothing you do to the files on your host will affect the files in your container
  - This means: the database on your host will also remain in its original state
  - If you want to copy changes made on the host into your container, you need to rebuild the image
    - This will reset any changes made inside the container
  - If you want to automatically synchronize parts of or the entire repo, you need to define bind mounts (`-v`) for the files or folders you want to sync, when starting the container
    - Example (bind mounting just the database): `docker run -it -p 5173:5173 -p 5000:5000 -p 443:443 --name julian-ruf-project -v ${PWD}\backend\books.db:/workspaces/bookfinder/backend/books.db julian-ruf-project sh`

## Sqlite3 DB & Python API

### SQLite database schema:

**table books:**
isbn dnb-isbn title author (link-to)-cover-image ...<br>
**table bookshelves:**
osm-id name (location)<br>
**table current-catalog:**
entry-id osm-id isbn time-of-entry

### Show the tables

Example commands, please alter as needed.

#### In a standalone Docker container

```
cd backend
apk update && apk add sqlite
sqlite3 books.db
.headers on
.mode column
SELECT * FROM current_catalog;
```

Or quickly (not as nicely formatted):

```
sqlite3 backend/books.db "SELECT * FROM current_catalog;"
```

#### In VS Code

Open the db file in vs code with the `qwtel.sqlite-viewer` extension (preinstalled if you run this project via the devcontainer).

### Insert or remove books into/from the db via the api

Change the table:

```
curl -X POST http://localhost:5000/api/shelf/insert -H "Content-Type: application/json" -d '{"osm_id": "123456", "isbn": "9781234567890"}'
```

```
curl -X POST http://localhost:5000/api/shelf/remove -H "Content-Type: application/json" -d '{"osm_id": "123456", "isbn": "9781234567890"}'
```

### Other sample api requests

```
http://127.0.0.1:5000/api/shelf/metadata?osm_id=https://www.openstreetmap.org/node/6073946680

http://127.0.0.1:5000/api/bookshelves/nearby?lat=48.0518572&lon=7.9032527

http://127.0.0.1:5000/api/shelf/books?osm_id=https://www.openstreetmap.org/node/6073946680

http://127.0.0.1:5000/api/catalog/search?lat=48.05&lon=7.90&title=Informatik
```

## TODOS

see `todos.md`

## Notes to me

### Persisting library versions and vs code extensions

- Installed VS Code extension? -> add it to `.devcontainer/devcontainer.json` to persist it
- Install via npm install?
  1. cd frontend
  2. run npm install
  3. version should now have been automatically added to frontend/package.json
- Install and persist Python libraries
  1. Start the venv: `source /workspaces/bookfinder-venv/.venv/bin/activate`
  2. Install via pip: `pip install [package-name]`
  3. Find the version number in the success message
  4. Add the library with its version number to the pip install command in the Dockerfile
- Want to enforce a VS Code setting for this project? -> add it to `.vscode/settings.json` to persist it

### Ruff not formatting and linting?

#### Try this first

1. `ctrl + shift + p`
2. Type `Ruff: Restart Server`
3. Enter

#### If nothing helps

1. Add `"ruff.nativeServer": "off"` to `.vscode/settings.json`
2. Open `ctrl + shift + p`
3. `Developer: Reload Window`
4. Test on a python file
5. Remove `"ruff.nativeServer": "off"` from `.vscode/settings.json`

### ESLint / Frontend import sorter not working?

1. Open `ctrl + shift + p`
2. `ESLint: Restart ESLint Server`
3. If that does not help, ESLint might be stalling because tsserver has a problem
4. Restart container and check if typescript server is working

## Test a single file, with detailed diffs

```
cd backend
source /workspaces/bookfinder-venv/.venv/bin/activate
PYTHONPATH=/workspaces/bookfinder/backend pytest -vv api_tests/cover_api_test.py
```
