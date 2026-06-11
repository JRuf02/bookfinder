# TODO

## Main todos

- Code Quality:
  - 3 Makefiles, all with detailed help targets, see [Reproducibility via Docker and Make](https://ad-wiki.informatik.uni-freiburg.de/teaching/Reproducibility)
  - Unit tests
    - Backend test for when DNB is down
    - Unit tests for python (backend) most complex logic functions
    - Unit tests for react?! (frontend) <= start in shelfActions.tsx
      - API calls should be tested (-> done in python), user interface doesn't need to be tested
      - Only complex logic should be tested
  - sqlite: c.execute("sel"\n"from") vs. c.execute("""sel\nfrom""")? vereinheitlichen, u.a. in book_db.py
  - Use subcomponents for ScanningResults

- Logic & Documentation:
  - add docstring to AppReducer, AppState and provider files
  - Only readme and blog post are very important
  - System diagrams for blog post
    - Diagram Frontend-Backend-ExternalServers(e.g. leaflet, dnb)
    - Diagram with file overview and main files (e.g. App.tsx, server.py, reset_bookshelves.py)
  - Database tables diagram and/or section with table structure in readme
  - Backend/api documentation -> 1-2 diagrams (optional)
  - Sequenzdiagramm für 'Buch einstellen' Aktion (optional)
  - Sequenzdiagramm für 'Buch finden' Aktion <= schon gekritzelt, jetzt bitte noch digitalisieren!
    - flowchart: draw.io -> UML -> Callback / app.diagrams.net

- CatalogHomeScreen
  - ResultsList hat sort by Title, sort by Distance und sort by Einstellungsdatum <=============================================================
  - Layout?
    - hat eine StaticMap (Kachel, die die Map anzeigt, zentriert auf aktuelles Regal, aber keine Interaktion mit map möglich)
      - Klick auf Karte(Kachel) auf dem CatalogHomeScreen führt zum CatalogResultsScreen für alle Bücher im gewählten Regal
      - Wenn noch kein shelf selected, wird bei Klick auf die statische Karte der ShelfScreen geöffnet und dann die Results gezeigt
    - hat einen Button 'select other shelf' bei der Karte; öffnet ShelfScreen
    - Neuste 10 Bücher werden unten in seitlicher slidebar angezeigt (als klickbare cover) (im 10km Radius/inkl.Datum+Distanz?!)
    - StaticMap component (or version of existing Map with other params)
      - zu Anzeigezwecken: Soll zentriert auf current shelf sein
      - statisch: kann nicht gescrollt/gezoomt etc werden
      - hat methode onClick, die vom parent definiert wird
        - onClick auf dem CatalogHomeScreen führt zum CatalogResultsScreen für alle Bücher im gewählten Regal
        - Bücher eines Regals sollen sortierbar nach Einstelldatum sein

- CatalogResult Component (Used inside ResultsList component)
  - is a separate component
  - show how long book is in shelf already in result
  - ausleihen-Button der direkt zum shelfActionScreen leitet
  - ggf button 'show on dnb'

- Scanning-/ScanningResults-/ShelfAction-Screen
  - nearest shelf wird pre-selected wenn shelf im appcontext null ist

- InfoScreen
  - add info page
  - dark mode toggle?

- ManualInsertScreen (oder Popup) (=Manuelle eingabe/buch ohne barcode/ISBN eingabe screen) existiert <=============================================================
  - inserting old books / without isbn / foreign isbn possible
  - inserting incl. photo of cover possible
  - kann über button auf dem scanningscreen aufgerufen werden
  - kann bei scanning / book data fetching error geöffnet werden
  - kann bei klick auf wrong book button geöffnet werden

- Resilience & Edge Cases:
  - dnb_api.py
    - MARC21 xml recherche nach autoren/mitarbeitenden/titeln/nebentiteln und anderen interessanten feldern
    - ctb (contributor) und andere data field synonyme für author adden
    - Handling für multiple authors / secondary book titles (e.g. 'Eragon' - 'Teil 2')
    - error handling falls eins der attribute (z.B. Autor) nicht gefunden wird
  - if cover in size=l not available, try different sizes!

- Production Setup:
  - Implement production setup (e.g. nginx + gunicorn)
  - add makefile targets make run and make run dev

- Design:
  - use clear css and uniform layouting, e.g. with MUI Stack with flexbox gap
  - Nice design on mobile
  - Make responsive, mobile first

- Finalization:
  - Use api/bookshelves/nearby in frontend or revove from backend
    - Maybe add 'show books from x nearest shelves' to catalog?
  - make build o.ä. sollte die DB bauen falls noch nicht existiert
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
    - split up long files (e.g. tests > 400 lines)
    - type annotations in python!
    - check .ruff.toml for ignored rules that should not be ignored in abgabeversion
    - add docstrings (incl. examples) and documentation
    - clean up console.log and console.error usage
    - remove unused inputs (tsx and py)
    - Configure and run frontend formatter (e.g. Prettier)
    - Run linter (ESLint and Ruff)
  - blog post

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

- Blog Post
  - Include system diagrams, important parts of readme, screenshots, documentation, ...
  - Include used Hilfsmittel like copilot autocompletion

## Bugs

- bug: after clicking insert on homescreen map popup and scanning a book, the book and 'no isbn scanned' will both appear (and 2x insert button)
- Kamera stellt nicht scharf auf mobile (nur in chrome) bei schlechtem Licht; Fokus immer weit in der Ferne

## Improvements

- Frontend:
  - besserer ersatz für cover image if not available
- SQL injection should not be possible -> use escape methods
- ssl certificates so dass sie als sicher erkannt werden (npm vite plugin-basic-ssl)
- frontend error handling when backend offline (error fetching data) -> schönere Message anzeigen
- visibly mark the selected shelf on ShelfMap if one is selected
- smoothen permission handling for the camera (and improve error message design)
- CatalogResult
  - In catalog results: Clicking a result shows it on map ?
  - In catalog results: 'Navigate'-button on each result opens google maps navigation to the shelf
  - Results klickbar -> 'remove'/'take out' button
  - Add button for dnb link (d-nb.info/<dnb_id>) z.b. `https://d-nb.info/1027780482` to each result
- Taschenlampe beim Scannen anschalten
- Disable buttons after click until api response is fetched (-> no duplicate inserts etc.)

## Nice to have

- save cover images as binary blob to books.db
- reverse-geocoded addresses in bookshelf data OR just show a small map with 1 marker for selected shelf (!)
  - e.g. with [nominatim](https://github.com/osm-search/Nominatim): ca. 5h for 15k requests
  - or valhalla.openstreetmap.de -> Koords eingeben, checkmark drücken -> reverse-geocodes the address
  - or project-osrm.org/docs -> nearest service -> 'name' -> outputs a street name
- Design
  - style infos moved to css file(s)
  - Use [react link styling](https://reactrouter.com/6.30.1/start/tutorial#active-link-styling) for highlighting current 'tab' on bottomNavBar (done?)
  - extend theme.ts, e.g. dark mode
  - MUI icons for insert/remove buttons: PlaylistAdd
  - map styling examples: maplibre.org, protomaps.com, transit.land
  - Use MUI dialog for shelf select map popup
- Usability
  - Fortschrittsanzeige a la 'step 1 of 3' beim book insert für jede zwischenseite
  - Wenn Buch gescannt wurde bis zum insert/remove/abbruch die bottomnavbar deaktivieren + ausgrauen, um versehentliches nichteinstellen zu verhindern
  - Wenn Buch gescannt wurde bis zum insert/remove/abbruch seite neu laden deaktivieren oder CancelDialog zeigen
- Full screen:
  - Hide browser address bar ([tipps on stack overflow](https://stackoverflow.com/questions/57023990/how-to-hide-the-address-bar-on-mobile-in-a-react-app))
  - Hide android bottom bar
  - [Web-App-Manifest hinzufügen](https://web.dev/articles/add-manifest?hl=de)
- CatalogHomeScreen
  - Hat button "select shelf to show books" und zeigt schon beim ersten öffnen die bücher des nähesten shelf?
  - oder zeigt die most recently inserted books deutschlandweit als start?
  - Real-Time: Shows (fuzzy-)search results as soon as the first letter is typed in (fuzzy search not mandatory, but would be nice)
  - fuzzy autocomplete vorschläge bei catalog search while typing
- Map / MapPopup
  - human-readable times ('last updated 2 years ago') klein und grau in shelf popup anzeigen (react library verfügbar)
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
- Create unique barcodes for each shelf -> scan shelf code to select it
- Usability
  - Wortwahl klarer machen, z.B. Take/Leave book statt remove/insert
  - support multiple languages?
- Frontend functionalities
  - show catalog search results on a map
  - HomeScreen on desktop PC could show books of selected shelf next to the home screen on the white area (on desktop/laptop)
  - 'show nearest shelf' button auf ShelfMap -> zentriert darauf & öffnet popup
  - 'Add bookshelf' Funktion für fehlende Regale
    - Z.B. mit [draggable Marker](https://react-leaflet.js.org/docs/example-draggable-marker/) auf map
- Map responsiveness (not needed, clustering is enough):
  - fetch and render bookshelf/map data async, to keep site reactive while initializing the map
  - quadtree for tile / shelf loading
- Code Quality
  - success/error messages from json should instead be generated by frontend from the http status code
