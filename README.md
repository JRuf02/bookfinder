# bookFinder

BookFinder is a nation-wide online catalog and management tool for public bookshelves in Germany.
Public bookshelves are publicly accessible shelves, where anyone can drop books off and take other books out for free. The app allows users to find nearby public bookshelves and see which books are available there. Users can also search for available books nation-wide and log which books they put onto or took out of a public bookshelf.

The full-stack web app uses [OpenStreetMap](https://www.openstreetmap.org/) data (obtained via [QLever](https://qlever.cs.uni-freiburg.de/osm-planet/FG873S)) to find nearby bookshelves and the [German National Library (DNB)](https://www.dnb.de/) API for book metadata.

## Functionality

- See all German public bookshelves on a map
- Select a bookshelf to show its books
- Search the nation-wide online catalog for a book and show the nearest results
- Start a Google Maps navigation to the selected bookshelf or show it on OpenStreetMap
- Add a book to a bookshelf by scanning its barcode - no need to enter anything manually
- Remove books from the catalog by scanning their barcodes

## Tech stack

- Reverse proxy: Caddy (production), Vite (development)
- Frontend: React, Vite
- Backend: Python, Flask, Gunicorn (production), Flask dev server (development)
- Database: SQLite
- Barcode scanning: [zxing-js](https://github.com/zxing-js/browser)
- Automation: Makefile

## Repository structure

Within this repository, the following directories are important:

- `frontend/` - frontend code (React, Vite)
- `backend/` - backend code and database (Python, Flask, SQLite)
- `reverse-proxy/` - Caddy (reverse proxy for production) configuration
- `documentation/` - documentation and troubleshooting
- `Makefile` - central orchestrator for starting servers and much more

More detailed information can be found within the sub-directories, e.g. within the `__init__.py` files.

## Installation and Server startup

### There are two ways to install and run this app

First, clone this repository onto your machine. Then you can open it either within a VS Code Devcontainer (A) or within a standard Docker Container (B).
After setup, you can choose between running the development servers (Vite + Flask) or the production servers (Caddy + Gunicorn). Use `make help` to find all available commands.

### A) VS Code Devcontainer

- Recommended if you want to open this project in VS Code
- Installs all the extensions you might need and configures the VS Code settings for this project
- Your local VS Code installation remains unchanged
- Isolation similar to a standard Docker container
- You can run the production setup in here, but this is best suited for development

#### Setup VS Code Devcontainer

- Clone this repository onto your machine (Into the linux file system if you are using WSL)
- Install [Docker](https://www.docker.com/) and [VS Code](https://code.visualstudio.com/)
- Install the VS Code Devcontainer extension `ms-vscode-remote.remote-containers`
- Open this repository with VS Code
- Press `F1` (or `CTRL + SHIFT + P`) and select `Dev Containers: Rebuild and Reopen in Container`

#### Run dev servers

##### Shortcut: Run both dev servers side-by-side in a split terminal inside VS Code

- Press `ctrl + P`
- Type `task Run All Servers`

##### Run dev servers manually

- Run `make run-dev` in the main directory `/workspaces/bookfinder` to start all dev servers
- Run `make -C frontend run-dev` in directory `/workspaces/bookfinder` to only start the frontend dev server (Vite)
- Run `make -C backend run-dev` in directory `/workspaces/bookfinder` to only start the backend dev server (Flask)

#### Run production servers

- Run `make run-prod` in the main directory `/workspaces/bookfinder`

### B) Within a standalone Docker container

If you simply want to run this app without looking much at the code or if you want to use it in an production setting (e.g. in a multi-container setting), you can run it within a standard Docker container.
This is optimized for the production setup, but you can also run the development servers in here.

#### Setup the container

Please follow the instructions given in the comments at the end of the `Dockerfile`.

#### Run dev servers

- Run `make run-dev` in the main directory `/workspaces/bookfinder` to start all dev servers
- Run `make -C frontend run-dev` in directory `/workspaces/bookfinder` to only start the frontend dev server (Vite)
- Run `make -C backend run-dev` in directory `/workspaces/bookfinder` to only start the backend dev server (Flask)

#### Run production servers

- Run `make run-prod` in the main directory `/workspaces/bookfinder`

## Show the website

### Development Setup (Vite + Flask)

- Start the dev servers: See above
- Open https://localhost:5173/
- Accept self-signed certificate
- Backend: `https://localhost:5173/api/health` (or directly http://localhost:5000/api/health)

### Production Setup (Caddy + Gunicorn)

- Start the prod servers: `make run-prod`
- Open https://localhost/
  - https://localhost:5173/ and https://localhost:443/ work as well, for convenience
- Accept self-signed certificate
- Backend: https://localhost/api/health
  - https://localhost:5173/api/health and https://localhost:443/api/health work as well

### Show the website on another device (e.g. on mobile)

- Start backend and frontend servers in the container
- Connect host and the device to the same network (no eduroam!)
- Run ipconfig on the host (outside the docker container) to find its IPv4 address
- Open `https://[host-ip]:5173/` on your device's browser
- Accept self-signed certificate

### If it fails

- Check that you used the right ipv4 address from ipconfig (wireless-LAN, not ethernet)
- Add firewall rule (allow inbound TCP on 5137 and 5000) on host if it does not exist
- Disable client isolation in your wifi router's settings
- Use another wifi (public wifis like eduroam may have client isolation)

## More information

More information can be found in the `documentation` directory and in the [blog post](https://ad-blog.cs.uni-freiburg.de/post/comprehensive-online-catalog-and-web-app-for-public-bookshelves/).

## Test coverage

Each API endpoint has been thoroughly tested via the `pytest` framework. These tests can be found in `backend/api_tests/` and run via `make test` from the backend directory.

Even though the API endpoint tests are thorough enough to find most problems in each of the used functions, any functions with complex logic received additional unit- or doctests. The frontend does not contain any complex logic. Unit tests can be found in `backend/unit_tests/` and run via `make test` from the backend directory.

For the backend tests, the Makefile provides two targets: The standard `make test` uses Mocker to mock the DNB API's responses, which is necessary as running the tests often should not strain the external DNB servers. To ensure the entire system - including the DNB API - is working as expected, `make test-dnb` uses the real DNB API for the backend's API endpoint tests.

## Troubleshooting

See `documentation/troubleshooting` for common problems and their solutions.

## System diagrams

See `documentation/system-diagrams-and-api-endpoints` for system diagrams.

## Use of generative AI

As this was my first time working with React, I used Claude Sonnet 5, ChatGPT and GitHub Copilot to generate example files and code snippets, which I then studied line by line and modified to my needs with the help of traditional means like the documentation. Towards the end of the project, I was able to write React code mostly without generative AI, as I had seen and understood the most important aspects of the framework.

Generative AI has also been used for brainstorming, code completion, formatting and documentation (comments and docstrings, not for standalone documentation files). Markdown files like this blog post or the README have been written without generative AI, but generative AI has been used for formatting and style improvement. Any AI-generated or modified code and text has been reviewed, understood and modified to ensure correctness.

For more information, see the [blog post](https://ad-blog.cs.uni-freiburg.de/post/comprehensive-online-catalog-and-web-app-for-public-bookshelves/).

## Imprint

- Project: Comprehensive Online Catalog and Web App for Public Bookshelves
- Developed by: [Julian Gabriel Ruf](mailto:julian.ruf@email.uni-freiburg.de)
- Supervised by: [Dr. Patrick Brosi](https://ad.informatik.uni-freiburg.de/staff/brosi)
- Chair: [Professur für Algorithmen und Datenstrukturen](https://ad.informatik.uni-freiburg.de/)
- University: [Albert-Ludwigs-Universität Freiburg](https://www.uni-freiburg.de/)
- Semester of grading: Winter 2026/2027
