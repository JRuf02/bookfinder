# TODO

- Code Quality:
  - linting and stylechecker on save einstellen und einschalten
  - clearly separate sqlite3 and flask files (e.g. no flask in app/db) for easy testing
  - Unit tests for python (backend)
  - Unit tests for react?! (frontend) <===================================start in shelfActions.tsx

- StaticMap component (or version of existing Map with other params)
  - zu Anzeigezwecken: Soll zentriert auf current shelf sein
  - statisch: kann nicht gescrollt/gezoomt etc werden
  - hat methode onClick, die vom parent definiert wird
    - onClick auf dem CatalogHomeScreen führt zum CatalogResultsScreen für alle Bücher im gewählten Regal

- Logic & Documentation:
  - Database tables diagram / readme
  - System diagram (draw.io->UML->callback)
    - possible production setup ()
    - dev setup ()
  - Diagram Frontend-Backend-ExternalServers(e.g. leaflet)
  - Diagram with file overview and main files (e.g. App.tsx, server.py, reset_bookshelves.py)
  - Backend/api documentation -> 1-2 diagrams
  - (caching von) backend/.db verstehen + optimieren
  - Sequenzdiagramm für 'Buch einstellen' Aktion

- CatalogHomeScreen
  - hat Suchleiste
    - Suchfunktion Backend wieder verstehen: Sequenzdiagramm für 'Buch finden' Aktion <=================================== schon gekritzelt, jetzt bitte noch digitalisieren! flowchart: draw.io -> UML -> Callback / app.diagrams.net
    - Suchfunktion Backend ggf verbessern
    - Buchsuche soll auch ohne standort gehen
    - Schalter für near you vs Suche ohne Standort
  - hat eine StaticMap (Kachel, die die Map anzeigt, zentriert auf aktuelles Regal, aber keine Interaktion mit map möglich)
    - Klick auf Karte(Kachel) auf dem CatalogHomeScreen führt zum CatalogResultsScreen für alle Bücher im gewählten Regal
    - Wenn noch kein shelf selected, wird bei Klick auf die statische Karte der ShelfSelectScreen geöffnet und dann die Results gezeigt
  - hat einen Button 'select other shelf' bei der Karte; öffnet ShelfSelectScreen
  - Neuste 10 Bücher werden unten in seitlicher slidebar angezeigt (als klickbare cover) (im 10km Radius/inkl.Datum+Distanz?!)

- CatalogSearchScreen
  - Real-Time: Shows fuzzy-search results as soon as the first letter is typed in

- CatalogResultsScreen
  - ResultsList hat sort by Title, sort by Distance und sort by Einstellungsdatum
  - hat 2 Versionen (Version wird von parent Komponente festgelegt):
    - Books/Results near you
    - Books at shelf xy: showing all books from one shelf
  - Kann Bücher von auf Karte gewähltem Regal zeigen

- CatalogResult Component (Used inside ResultsList component)
  - is a separate component
  - show how long book is in shelf already in result
  - ausleihen-Button der direkt zum shelfActionScreen leitet

- HomeScreen
  - select button on homescreen map redirects to the catalog
  - select button on shelfSelectMap on home screen renamed to "show books"
  - Search on home screen works and leads to CatalogSearchScreen

- Scanning/InsertScreens
  - select button switches to "selected" when clicked on shelfActionScreen
  - Wenn bei remove ein shelf gewählt wird, der das buch nicht hat, zeige warnung

- InfoScreen
  - add info page

- ManualInsertScreen (=Manuelle eingabe/buch ohne barcode/ISBN eingabe screen) existiert
  - inserting old books / without isbn / foreign isbn possible
  - inserting incl. photo of cover possible
  - ManualInsertScreen kann über button auf dem scanningscreen aufgerufen werden
  - scannerresultserrorScreen (=Manuelle eingabe/buch ohne barcode/ISBN eingabe screen) wird bei error gezeigt

- Resilience & Edge Cases:
  - check if the book exists in shelf before removing (front- and backend!)
  - make sure the books normalized dnb (long) isbn without - and without spaces is stored in current_catalog and books db, not the isbn raw input! -> worked before switching to mui!?.
  - dont insert 'error fetching data' or 'unknown title' into catalog (front- and backend!) e.g. in shelfActions.tsx
  - server.py ctb contributor adden + error handling falls eins der attribute nicht gefunden
  - if cover in size=l not available, try different sizes!

- Finalization:
  - alles screens/buttons sind miteinander verbunden wie im Diagramm entworfen
  - add svg icon
  - search code for TODOs
  - search local desktop for todos
  - final readme
    - Introduction
    - System overview + diagram
    - backend API documentation
    - Docker setup how to
  - adhere to coding standards
    - type annotations in python!
    - einheitliche camelCase etc Nutzung [so link](https://stackoverflow.com/questions/42127593/should-python-class-filenames-also-be-camelcased)
    - add doctstrings and documentation
    - clean up console.log and console.error usage
    - remove unused inputs (tsx and py)
    - move venv to the python / server directory if possible
  - Automation
    - clean up the spaghetti of npm run all, make, postcreatecommands, docker, .vscode/tasks.json and start-all.sh
    - implement and test final makefiles
    - makefile has 'help' target and documentation
    - make project docker-compatible as wished
      - [here](https://ad-wiki.informatik.uni-freiburg.de/teaching/Reproducibility#Reproducibility_via_Docker_and_Make)
      - and [here](https://ad-wiki.informatik.uni-freiburg.de/teaching/DockerExample)
      - and [here](https://docs.docker.com/build/building/best-practices/)
      - and [here](https://docs.docker.com/build/building/multi-stage/)
  - Testing
    - tested on android/mobile
    - tested on iPad/iPhone
    - tested on Desktop

## Bugs

- bug: after clicking insert on homescreen map popup, the locate me button does not work any more

```
Normalized ISBN: 123456789X
Book not found in DB for ISBN: 123456789X
Error fetching book data: 'NoneType' object has no attribute 'find'
Fetched book data from dnb: {'title': 'Error fetching data', 'author': '', 'dnbISBN': '', 'dnbId': ''}
127.0.0.1 - - [23/Jun/2025 13:29:16] "GET /api/books?isbn=123456789X HTTP/1.1" 200 -
```

## Improvements

- frontend error handling when backend offline (error fetching data) -> schönere Message anzeigen
- show search results even when no location given
- visibly mark the selected shelf on ShelfSelectMap if one is selected
- smoothen permission handling for the camera
- make map scrolling/zooming more responsive... e.g. by:
  - fetch and render bookshelf/map data async, to keep site reactive while initializing the map
  - use react-leaflet-markercluster for rendering only necessary shelf markers
  - quadtree for tile / shelf loading
- CatalogResult
  - In catalog results: Clicking a result shows it on map
  - In catalog results: 'Navigate'-button on each result opens google maps navigation to the shelf
- CatalogSearch
  - Add advanced search screen for search by author, title, isbn, ... seperately
  - Add clever fuzzy search backend for advanced separate search by title, isbn etc separately
  - Show fuzzy search results within given radius + complete matches even if outside the search radius
- Taschenlampe beim Scannen anschalten
- 'Add bookshelf' Funktion für fehlende Regale
  - Z.B. mit [draggable Marker](https://react-leaflet.js.org/docs/example-draggable-marker/) auf map

## Nice to have

- support multiple languages?
- add isbn checksum validation?
- include reverse-geocoded addresses in bookshelf data (e.g. with [nominatim](https://github.com/osm-search/Nominatim): ca. 5h for 15k requests)
- backend for catalog search by location/author/isbn
- save covers to db?
- api for non-dnb books
- user accounts ?
  - Buchempfehlungen / ähnliche Bücher vorschlagen [z.B. wie bibtip](https://www.bibtip.de/de)
  - Ratingsystem (Sterne/Bewertung) für Shelfs & Books
  - Bookmarks/Wishlist
  - Mail/Push Notification when bookmarked book becomes available within set radius
- Gamification - Punktesammeln für shelf checks a la "book still there?"
- design
  - style infos moved to css file(s)
  - Use [react link styling](https://reactrouter.com/6.30.1/start/tutorial#active-link-styling) for highlighting current 'tab' on bottomNavBar (done?)
  - extend theme.ts, e.g. dark mode
  - MUI icons for insert/remove buttons
- show catalog search results on a map
- Fortschrittsanzeige a la 'step 1 of 3' beim book insert für jede zwischenseite
- Wenn Buch gescannt wurde bis zum insert/remove/abbruch die bottomnavbar deaktivieren + ausgrauen, um versehentliches nichteinstellen zu verhindern
- Full screen:
  - Hide browser address bar ([tipps on stack overflow](https://stackoverflow.com/questions/57023990/how-to-hide-the-address-bar-on-mobile-in-a-react-app))
  - Hide android bottom bar
  - [Web-App-Manifest hinzufügen](https://web.dev/articles/add-manifest?hl=de)
- AdminMode: custom Benachrichtigung wenn buch custom zeit in gewähltem Schrank
- (Admin mode:) get notified when book in a shelf is untouched for a certain time
- Tech stack changes
  - 1 Docker-Compose (ggf. mit caddy für auto-restart nach crash) mit 2 Containern:
    - frontend (vite server or pre-built files from frontend/dist/)
    - backend (flask/gunicorn python server)
    - dockercompose can be inside the devcontainer
  - PostgreSQL statt sqlite3 (for production upscaling & advanced geocoordinates functionalities)
  - fastAPI statt flask ([discussion](https://www.reddit.com/r/flask/comments/13pyxie/flask_vs_fastapi/))
  - Nginx / Apache + Gunicorn (create production setup) (see /documentation)

## Done

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
- CatalogHomeScreen
  - Übersicht über catalog search screens und features erstellen
