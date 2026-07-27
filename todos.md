# TODO

## Main todos

- Code Quality:
  - 3 Makefiles, all with detailed help targets, see [Reproducibility via Docker and Make](https://ad-wiki.informatik.uni-freiburg.de/teaching/Reproducibility)
  - Unit tests (Only complex logic should be tested)
    - Unit tests / Doctests for python (backend) most complex logic functions
      - unit or doctests for popularity score calculations
      - unit or doctests for isbn parsing etc (osm parsing...)
    - Unit tests for react?! (frontend) <= start in shelfActions.tsx
  - API calls should be tested (-> done in python), user interface doesn't need to be tested
    - add api tests for new endpoints
  - Use subcomponents for ScanningResults

- Logic & Documentation:
  - add docstring to AppReducer, AppState and provider files
  - Only readme and blog post are very important
  - System diagrams for blog post
    - Diagram Frontend-Backend-ExternalServers(e.g. leaflet, dnb)
    - Diagram with file overview and main files (e.g. App.tsx, server.py, update_bookshelves.py)
  - Database tables diagram and/or section with table structure in readme
  - Backend/api documentation -> 1-2 diagrams (optional)
  - Sequenzdiagramm für 'Buch einstellen' Aktion (optional)
  - Sequenzdiagramm für 'Buch finden' Aktion <= schon gekritzelt, jetzt bitte noch digitalisieren!
    - flowchart: draw.io -> UML -> Callback / app.diagrams.net

- CatalogScreen
  - Show books of selected shelf from app state (on button click or on navigation to the page via bottomnavbar)
  - Funktionen aufräumen, ggf custom hooks für logik
  - Standort direkt abfragen bei klick auf search neaHr me button, damit die suche dann schneller geht <======== 1

- MapPopup
  - z-index ist höher als die zoom buttons auf der Karte

- Scanning-/ScanningResults-/ShelfAction-Screen
  - nearest shelf wird pre-selected wenn shelf im appcontext null ist

- ShelfActionView.tsx
  - Nützlichere Infos zeigen, z.B. alle gescannten Bücher <============================================================= 5

- InfoScreen
  - add info page
    - data sources
    - scanning advice
    - tutorial? MUI process?
  - dark mode toggle?

- Resilience & Edge Cases:
  - dnb_api.py
    - MARC21 xml recherche nach autoren/mitarbeitenden/titeln/nebentiteln und anderen interessanten feldern
    - ctb (contributor) und andere data field synonyme für author adden <============================================================= 4
    - Handling für multiple authors / secondary book titles (e.g. 'Eragon' - 'Teil 2')
    - error handling falls eins der attribute (z.B. Autor) nicht gefunden wird
  - if cover in size=l not available, try different sizes!

- Design:
  - Buttons alignen wie die Popularity Chips (damit bei umbruch auf mobile vertikales alignment stimmt)
    - MapPopup
  - mobile version looking good
  - desktop version looking acceptable
  - Besseres color scheme entwickeln und anwenden <============================================================= 2

- SSH / HTTPS:
  - handle certs/key.pem safely (maybe not on github?)

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

- Finalization:
  - Update bookshelves via qlever
  - Add dummy data & include db in git
  - Use api/bookshelves/nearby in frontend or revove from backend
    - Maybe add 'show books from x nearest shelves' to catalog?
  - make build o.ä. sollte die DB bauen falls noch nicht existiert
  - makefile targets make run and make run-dev
  - .vscode/tasks.json tasks löschen wenn makefile fertig oder in readme / documentation aufnehmen
  - alles screens/buttons sind miteinander verbunden wie im Diagramm entworfen
  - search code for TODOs
  - search local desktop for todos
  - final readme
    - Introduction
    - System overview + diagram
    - backend API documentation
    - Docker setup how to
  - adhere to coding standards
    - split up long files (e.g. tests > 400 lines)
    - type annotations in python!
    - check .ruff.toml for ignored rules that should not be ignored in abgabeversion
    - add docstrings (incl. examples) and documentation
    - clean up console.log and console.error usage
    - remove unused inputs (tsx and py)
    - Configure and run frontend formatter (e.g. Prettier)
    - Run linter (ESLint and Ruff)

- Blog Post
  - write preliminary version/structure <============================================================= 3
  - Include system diagrams, important parts of readme, screenshots, documentation, ...
  - Explain where and what additional documentation can be found in the repo
  - Include used Hilfsmittel like copilot autocompletion and draw.io, canva, ...
  - Add info about tests: API tests, unit tests, doctests

## Testing

- Client
  - tested on android/mobile
  - tested on iPad/iPhone
  - tested on Desktop
  - Firefox, Chrome, Safari
- Server
  - tested using plain Docker container
    - dev mode
    - prod mode
  - tested using devcontainer
    - dev mode
    - prod mode
- Git clone und Server starten von Null

## Bugs

- Kamera stellt nicht scharf auf mobile (nur in chrome) bei schlechtem Licht; Fokus immer weit in der Ferne
- Suche hängt sich manchmal auf wenn man schnell hintereinander ohne dann mit standort sucht
- Locate Me Tooltip bleibt manchmal hängen

## Improvements

- Frontend:
  - Use `/*_ This is a js doctstring _/` for docstrings
  - besserer ersatz für cover image if not available
- SQL injection should not be possible -> use escape methods
- ssl certificates so dass sie als sicher erkannt werden (npm vite plugin-basic-ssl)
- frontend error handling when backend offline (error fetching data) -> schönere Message anzeigen
- smoothen permission handling for the camera (and improve error message design)
- Manual Add Dialog
  - wenn isbn eingegeben wurde aber no book found, dann übertrage isbn direkt in das ISBN input field im ManualAddDialog
- CatalogResult
  - Add button for 'show shelf on shelfMap'
  - Add button for dnb link (d-nb.info/<dnb_id>) z.b. `https://d-nb.info/1027780482` to each result
- Taschenlampe beim Scannen anschalten
- Disable buttons after click until api response is fetched (-> no duplicate inserts etc.)
- Search by ISBN should also accept ISBN-10 (and convert to ISBN-13 before searching in the DB)

## Nice to have

- ScanningResults.tsx:
  - Show scanned book covers (with x on top right) instead of '3 books scanned'
    - Clicking the cover removes the book from the queue
- ResultCardContent Component
  - ggf button 'show on dnb' oder cover img klickbar
- 'on shelves' popularity chip clickable, opens isbn search for the book
- Manual Add Book
  - handle manual add and all other logic (warning: ISBN is primary key!) of books that don't have an ISBN
  - Ensure Author name format is "Last, First Second"
  - inserting books that dont have an isbn possible
  - inserting incl. photo of cover possible: api/manual-add/cover
  - Dialog kann über button auf dem scanningscreen aufgerufen werden
- save cover images as binary blob to books.db
- reverse-geocoded addresses in bookshelf data OR just show a small map with 1 marker for selected shelf (!)
  - e.g. with [nominatim](https://github.com/osm-search/Nominatim): ca. 5h for 15k requests
  - or valhalla.openstreetmap.de -> Koords eingeben, checkmark drücken -> reverse-geocodes the address
  - or project-osrm.org/docs -> nearest service -> 'name' -> outputs a street name
- Design
  - use clear css and uniform layouting, e.g. with MUI Stack with flexbox gap
  - use [fab](https://mui.com/material-ui/react-floating-action-button/) or IconButton where it makes sense
  - use mui [stepper](https://mui.com/material-ui/react-stepper/) for scanning progress
  - style infos moved to css file(s)
  - Use [react link styling](https://reactrouter.com/6.30.1/start/tutorial#active-link-styling) for highlighting current 'tab' on bottomNavBar (done?)
  - extend theme.ts, e.g. dark mode
  - MUI icons for insert/remove buttons: PlaylistAdd
  - map styling examples: maplibre.org, protomaps.com, transit.land
  - Use MUI dialog for shelf select map popup
  - make responsive (mobile first)
    - desktop version uses its additional x axis space
- Usability
  - Fortschrittsanzeige a la 'step 1 of 3' beim book insert für jede zwischenseite
  - Wenn Buch gescannt wurde bis zum insert/remove/abbruch die bottomnavbar deaktivieren + ausgrauen, um versehentliches nichteinstellen zu verhindern
  - Wenn Buch gescannt wurde bis zum insert/remove/abbruch seite neu laden deaktivieren oder CancelDialog zeigen
  - Shelf Map neben den Catalog Results zeigen, shelves klickbar machen um inhalt bei klick auf marker direkt zu zeigen
- Full screen:
  - Hide browser address bar ([tipps on stack overflow](https://stackoverflow.com/questions/57023990/how-to-hide-the-address-bar-on-mobile-in-a-react-app))
  - Hide android bottom bar
  - [Web-App-Manifest hinzufügen](https://web.dev/articles/add-manifest?hl=de)
- Fuzzy Search:
  - implement fuzzy PREFIX search for autocomplete suggestions while typing (keep standard fuzzy search incl. catalog lookup for catalog search on form submit)
    - does not need to check current_catalog
    - Efficient PED computations and list merging: pip install ad-freiburg-qgram-utils
  - "King, Stephen" should have a higher score than "Stephen Edwin King" for query "stephen king" (use token coverage as secondary ranking score)
  - Ranking could be done by edit distance, then by token coverage, then by distance and by popularity
- CatalogScreen
  - Hat button "select shelf to show books" und zeigt schon beim ersten öffnen die bücher des nähesten shelf?
  - oder zeigt die most recently inserted books deutschlandweit als start?
  - Real-Time: Shows (fuzzy-)search results as soon as the first letter is typed in (fuzzy search not mandatory, but would be nice)
  - fuzzy autocomplete vorschläge bei catalog search while typing
  - Layout?
    - hat eine StaticMap (Kachel, die die Map anzeigt, zentriert auf aktuelles Regal, aber keine Interaktion mit map möglich)
      - Klick auf Karte(Kachel) auf dem CatalogScreen zeigt alle Bücher im gewählten Regal
      - Wenn noch kein shelf selected, wird bei Klick auf die statische Karte der ShelfScreen geöffnet und dann die Results gezeigt
    - hat einen Button 'select other shelf' bei der Karte; öffnet ShelfScreen
    - Neuste 10 Bücher werden unten in seitlicher slidebar angezeigt (als klickbare cover) (im 10km Radius/inkl.Datum+Distanz?!)
    - StaticMap component (or version of existing Map with other params)
      - zu Anzeigezwecken: Soll zentriert auf current shelf sein
      - statisch: kann nicht gescrollt/gezoomt etc werden
      - hat methode onClick, die vom parent definiert wird
        - onClick auf dem CatalogScreen zeigt alle Bücher im gewählten Regal
- PopularityChips / BookPopularity
  - Add median time on shelf (not just the average)
  - Farbe ändern oder flame icon adden wenn populär
- Map responsiveness (not needed, clustering is enough):
  - Save bookshelves in local storage instead of refetching every time the map is shown
- Code Quality
  - Use my standard response format (status, data) for response of cover image as well
  - Use datetime and isoformat() in code and db for times? e.g. row["time_of_entry"].isoformat()
  - SQL execute command strings in eigenes file in app/db auslagern z.B. als Konstante GET_ALL_BOOKS_COMMAND, ...
  - Clean Frontend error handling
    - use None instead of empty str / dummy data / title: "Error"
    - Generate text like 'Error Fetching Data' and 'Unknown Title/Author' in the UI component

## Maybe if I find the time for it (aka ideas I'll never realize)

- Make insertions into books table atomic with the corresponding insertions of qgrams, tokens etc.
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
  - SSH / HTTPS:
    - browser sollte nicht "unsicher" anzeigen (nur möglich mit fester domain)
- Python Backend
  - Improve search (make more fuzzy / use sqlite MATCH), check out [RapidFuzz](https://pypi.org/project/RapidFuzz/)
  - api for non-dnb books (e.g. via google books api/internet archive OpenLibrary api/wikipedia isbn-Suche)
- User/Admin Accounts
  - (Admin mode:) get notified when book in a shelf is untouched for a certain time
  - Benachrichtigungsservice wenn gewünschtes Buch eingestellt wird
  - Buchempfehlungen / ähnliche Bücher vorschlagen [z.B. wie bibtip](https://www.bibtip.de/de)
  - Ratingsystem (Sterne/Bewertung) für Shelfs & Books
  - Bookmarks/Wishlist
  - Mail/Push Notification when bookmarked book becomes available within set radius
- Gamification - Punktesammeln für shelf checks a la "book still there?" & buch scan
  - Je nach book popularity gibt es mehr Punkte für einstellen / entnehmen
- Create unique barcodes for each shelf -> scan shelf code to select it
- Usability
  - Wortwahl klarer machen, z.B. Take/Leave book statt remove/insert
  - support multiple languages?
- Frontend functionalities
  - show catalog search results on a map
  - HomeScreen on desktop PC could show books of selected shelf next to the home screen on the white area (on desktop/laptop)
  - CatalogSearchForm aus/einblenden ist animiert
  - 'show nearest shelf' button auf ShelfMap -> zentriert darauf & öffnet popup
  - 'Add bookshelf' Funktion für fehlende Regale
    - Z.B. mit [draggable Marker](https://react-leaflet.js.org/docs/example-draggable-marker/) auf map
- Frontend responsiveness
  - don't fetch cover for same isbn multiple times if multiple books in catalog
  - fetch small size thumbnails only (should already be medium, maybe small enough already)
- Map responsiveness (not needed, clustering is enough):
  - fetch and render bookshelf/map data async, to keep site reactive while initializing the map
  - quadtree for tile / shelf loading
- Code Quality
  - success/error messages from json should instead be generated by frontend from the http status code
