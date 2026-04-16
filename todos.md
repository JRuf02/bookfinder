# TODO

## Main todos

- Code Quality:
  - ask Patrick about excludes in .ruff.toml
  - Use combined ruff.toml in settings.json AND in Makefile (combined ruff config for docker ruff and devcontainer ruff) <========
  - top level make file
    - make test
      - Runs make test from frontend and backend makefiles
      - Starts servers and checks if both are up (request to frontend (check response type/if content there (e.g. check html for button)), request to backend, e.g. check that more than 0 entries in db delivered / api/health) <=========== TODO
  - clearly separate sqlite3 and flask files (e.g. no flask in app/db) for easy testing
  - Unit tests
    - Unit tests for python (backend)
      - Database sqlite tests <========================================================= THIS FIRST !!!
    - Unit tests for react?! (frontend) <= start in shelfActions.tsx
      - API calls should be tested, user interface doesn't need to be tested
      - Logic should be tested

- StaticMap component (or version of existing Map with other params)
  - zu Anzeigezwecken: Soll zentriert auf current shelf sein
  - statisch: kann nicht gescrollt/gezoomt etc werden
  - hat methode onClick, die vom parent definiert wird
    - onClick auf dem CatalogHomeScreen führt zum CatalogResultsScreen für alle Bücher im gewählten Regal

- Python Backend
  - Move all api logic from app/db/bookshelves_db.py to app/routes/bookshelves.py

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
  - server.py / dnb_api.py ctb contributor adden + error handling falls eins der attribute nicht gefunden
  - if cover in size=l not available, try different sizes!

- Finalization:
  - .vscode/tasks.json tasks löschen wenn makefile fertig
  - alles screens/buttons sind miteinander verbunden wie im Diagramm entworfen
  - add svg icon
  - handle certs/key.pem safely (maybe not on github?)
  - search code for TODOs
  - search local desktop for todos
  - final readme
    - Introduction
    - System overview + diagram
    - backend API documentation
    - Docker setup how to
  - adhere to coding standards
    - type annotations in python!
    - PEP8 style einheitliche camelCase etc Nutzung [so link](https://stackoverflow.com/questions/42127593/should-python-class-filenames-also-be-camelcased)
    - add docstrings (incl. examples) and documentation
    - clean up console.log and console.error usage
    - remove unused inputs (tsx and py)
  - Automation
    - use make instead of .vscode/tasks.json and to bundle npm run all and sub-makefiles
    - implement and test final makefiles
    - makefile has 'help' target and documentation
    - make project docker-compatible as wished
      - [here](https://ad-wiki.informatik.uni-freiburg.de/teaching/Reproducibility#Reproducibility_via_Docker_and_Make)
      - and [here](https://ad-wiki.informatik.uni-freiburg.de/teaching/DockerExample)
      - and [here](https://docs.docker.com/build/building/best-practices/)
      - and [here](https://docs.docker.com/build/building/multi-stage/)
    - do not require vs-code & devcontainer, only docker!
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

- ssl certificates so dass sie als sicher erkannt werden (npm vite plugin-basic-ssl)
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
- reverse-geocoded addresses in bookshelf data
  - e.g. with [nominatim](https://github.com/osm-search/Nominatim): ca. 5h for 15k requests
  - or valhalla.openstreetmap.de -> Koords eingeben, checkmark drücken -> reverse-geocodes the address
  - or project-osrm.org/docs -> nearest service -> 'name' -> outputs a street name
- backend for catalog search by location/author/isbn
- save covers to db?
- api for non-dnb books (e.g. via google books api/internet archive OpenLibrary api/wikipedia isbn-Suche)
- user accounts ?
  - Buchempfehlungen / ähnliche Bücher vorschlagen [z.B. wie bibtip](https://www.bibtip.de/de)
  - Ratingsystem (Sterne/Bewertung) für Shelfs & Books
  - Bookmarks/Wishlist
  - Mail/Push Notification when bookmarked book becomes available within set radius
- Gamification - Punktesammeln für shelf checks a la "book still there?" & buch scan
- design
  - style infos moved to css file(s)
  - Use [react link styling](https://reactrouter.com/6.30.1/start/tutorial#active-link-styling) for highlighting current 'tab' on bottomNavBar (done?)
  - extend theme.ts, e.g. dark mode
  - MUI icons for insert/remove buttons
  - map styling examples: maplibre.org, protomaps.com, transit.land
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
  - 1 Docker-Compose (ggf. mit caddy reverse-proxy & auto-restart nach crash) mit 2 Containern:
    - frontend (vite server or pre-built files from frontend/dist/)
    - backend (flask/gunicorn python server)
    - dockercompose can be inside the devcontainer
  - PostgreSQL statt sqlite3 (for production upscaling & advanced geocoordinates functionalities)
  - Advanced geospatial db with fast radius search and indexing: PostgreSQL with PostGIS
  - fastAPI statt flask ([discussion](https://www.reddit.com/r/flask/comments/13pyxie/flask_vs_fastapi/))
  - Nginx / Apache + Gunicorn (create production setup) (see /documentation)
  - rent & use own domain/online server (e.g. from Hetzner)
