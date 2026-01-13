# bookFinder

### Setup VS-Code Devcontainer

Use the provided Devcontainer to make the usage as easy as possible:

- Install [Docker](https://www.docker.com/) and [VS Code](https://code.visualstudio.com/)
- Install VS Code Devcontainer extension `ms-vscode-remote.remote-containers`
- Open this repository
- Press `F1` (or `CTRL + SHIFT + P`) and select `Dev Containers: Rebuild and Reopen Container`

### Run all dev servers with one command in vscode

- Press `ctrl + P`
- Type `task Run All Servers`

### Run server

- Run `npm run dev` in directory `\workspaces\isbn-scanner\frontend` inside the Devcontainer to start vite (react dev server)
- Run `make run` in directory `\workspaces\isbn-scanner\server` inside the Devcontainer to start the book data api server (flask) (might need 'make install' first!)

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

### TODO

- clearly separate sqlite3 and flask files (e.g. no flask in app/db) for easy testing
- implement tests for python
- also implement tests for react?!

- implement and test Makefiles!
- clean up the spaghetti of npm run all, make, postcreatecommands, docker, .vscode/tasks.json and start-all.sh

- catalog screen for showing all books from one shelf <===================================
- select button on homescreen map redirects to the catalog
- select button on home screen renamed to "show books"
- select button switches to "selected" when clicked on insert page
- online catalogscreen + search - add missing pages!
- add info page
- show how long book is in shelf already in result
- Admin mode: get notified when book in a shelf is untouched for a certain time

- check if the book exists in shelf before removing (front- and backend!)
- old books without isbn / foreign isbn
- make sure the books normalized dnb (long) isbn without - and without spaces is stored in current_catalog and books db, not the isbn raw input! -> worked before switching to mui!?.
- dont insert 'error fetching data' or 'unknown title' into catalog (front- and backend!)
- server.py ctb contributor adden + error handling falls eins der attribute nicht gefunden
- if cover in size=l not available, try different sizes!

- System diagram (draw.io->UML->callback)
- Backend/api documentation -> 1-2 diagrams
- (caching von) backend/.db verstehen + optimieren

- add svg icon

- Finalization:
  - search code for TODOs
  - search local desktop for todos
  - adhere to coding standards
    - type annotations in python!
    - add doctstrings and documentation
    - clean up console.log and console.error usage
    - remove unused inputs (tsx and py)
  - move venv to the python / server directory if possible
  - make project docker-compatible as wished [here](https://ad-wiki.informatik.uni-freiburg.de/teaching/Reproducibility#Reproducibility_via_Docker_and_Make)

### Bugs

- bug: after clicking insert on homescreen map popup, the locate me button does not work any more

### Improvements

- frontend error handling when backend offline (error fetching data) -> schönere Message anzeigen
- show search results even when no location given
- visibly mark the selected shelf on ShelfSelectMap if one is selected
- smoothen permission handling for the camera
- make map scrolling/zooming more responsive... e.g. by:
  - fetch and render bookshelf/map data async, to keep site reactive while initializing the map
  - use react-leaflet-markercluster for rendering only necessary shelf markers

### Nice to have

- style infos moved to css file(s)
- Nginx / Apache (create production setup)
- support multiple languages?
- add isbn checksum validation?
- include reverse-geocoded addresses in bookshelf data (e.g. with nominatim: ca. 5h for 15k requests)
- backend for catalog search by location/author/isbn
- save covers to db?
- user accounts ?
- design
  - [ ] Use [react link styling](https://reactrouter.com/6.30.1/start/tutorial#active-link-styling) for highlighting current 'tab' on bottomNavBar (done?)
  - [ ] extend theme.ts, e.g. dark mode

### Finished

- [x] Implement Home screen (skeleton)
- [x] make ScanningScreen more maintainable by splitting into multiple pages!
- [x] use rem / % in global.css as well!!!
- [x] ensure theme.ts is used
- [x] make sure nothing is hidden beneath bottom nav bar
- [x] drop and recreate + fill table bookshelves
- [x] query location only after user input!
- [x] restructure server directory!
- [x] use [react memo](https://www.w3schools.com/REACT/react_memo.asp) for scanner to avoid rerender
- [x] use [react-router](https://www.w3schools.com/REACT/react_router.asp) for multi-page design
- [x] implement server...
- [x] ...with book data api that proxies dnb data
- [x] ...with cache/db for book data and cover images (sqlite3)
- [x] ...and backend for book extraction / addition (python & flask(dev)/Nginx(prod))
- [x] ...and db for online catalog (sqlite3)
- [x] use material ui (mui) for react buttons, input fields and other ui components
- [x] frontend
- [x] bookdata cache -> book can be inserted like this:
      `curl -X POST http://localhost:5000/api/shelf/insert -H "Content-Type: application/json" -d '{"osm_id": "123456", "isbn": "9781234567890"}'`
- [x] mobile first web design!
- [x] disable isbn input once book will be inserted or removed!!! (might be fixed already, but make sure the camera cant find other codes while in background)
- [x] backend reachable from mobile on same network
- [x] camera feed working on mobile
- [x] check where node_modules are installed on container restart and where they are sourced from by App.tsx etc. -> try moving to frontend!
- [x] buch entnehmen/einstellen funktion
- [x] properly design NotFoundScreen
- [x] use rem / relative scaling for ui elements relative to appcontainer, which is 100dvh
- [x] Fill bookshelves table with public_bookcases from osm
- [x] backend for catalog search by title
- use ShelfSelectMap for selecting shelf after scanning (ShelfActionScreen.tsx)
- map view

### QLever bookshelf data

Germany:
https://qlever.cs.uni-freiburg.de/osm-planet/FG873S
https://qlever.cs.uni-freiburg.de/osm-planet/ulH4tw

Find all predicates:
https://qlever.cs.uni-freiburg.de/osm-planet/3CtDN7

Reverse geocoding (does not work):
https://qlever.cs.uni-freiburg.de/osm-planet/zJ9akA

### isbn to book data via dnb

- [infos](https://www.dnb.de/DE/Professionell/Metadatendienste/Datenbezug/SRU/sru_node.html#doc58294bodyText5)

- [html book data (catalog page)](https://portal.dnb.de/opac/simpleSearch?query=%223551551677%22)

- [jpg (cover image)](https://portal.dnb.de/opac/mvb/cover?isbn=978-3-551-55167-2&size=m)

- xml book data
  - [marc-21-xml formatted](https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query="3551551677"&recordSchema=MARC21-xml&maximumRecords=1)
  - [rdf-xml formatted](https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query=%223551551677%22&maximumRecords=1)

## show on mobile

- connect to same network
- find ipv4 address of host via iplookup
- go to `https://hostip:5173`

## easy open on mobile (experimental, doesnt work on windows host yet)

```
# Display the host IP address for QR code generation
HOST_IP=$(hostname -i | awk '{print $1}')
echo "Your application is running at: https://${HOST_IP}:5173"
echo "Scan this QR code on your mobile device to access the app:"
qrencode -t ANSIUTF8 "https://${HOST_IP}:5173"

# Or open in the host browser
"$BROWSER" "https://${HOST_IP}:5173"
```

## bugs

```
Normalized ISBN: 123456789X
Book not found in DB for ISBN: 123456789X
Error fetching book data: 'NoneType' object has no attribute 'find'
Fetched book data from dnb: {'title': 'Error fetching data', 'author': '', 'dnbISBN': '', 'dnbId': ''}
127.0.0.1 - - [23/Jun/2025 13:29:16] "GET /api/books?isbn=123456789X HTTP/1.1" 200 -
```

## testing insertion / removal of books

SQLite tables:
table books:
isbn dnb-isbn title author (link-to)-cover-image ...
table bookshelves:
osm-id name (location)
table current-catalog:
entry-id osm-id isbn time-of-entry

Change the table:

```
curl -X POST http://localhost:5000/api/shelf/insert -H "Content-Type: application/json" -d '{"osm_id": "123456", "isbn": "9781234567890"}'
```

```
curl -X POST http://localhost:5000/api/shelf/remove -H "Content-Type: application/json" -d '{"osm_id": "123456", "isbn": "9781234567890"}'
```

Show the table:

```
cd server
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
