# TADAAA (Todos, but done)

- Logic & Documentation
  - System diagram (draw.io->UML->callback)
    - production setup
    - dev setup

- Python Backend
  - Move all api logic from app/db/bookshelves_db.py to app/routes/bookshelves.py
    - clearly separate sqlite3 and flask files (e.g. no flask in app/db) for easy testing
      - Move all jsonify (i/o) from app/db to app/routes or higher
        - Add custom error data types instead (e.g. dataclass db_connection_error)
  - Authors like Rowling, J.K. are handeled correctly

- SSL / HTTPS:
  - handle certs/key.pem safely

- CatalogSearch
  - Logo und Input fields (scrollen weg oder) sind via button ausblendbar
  - Add (advanced search screen for) search by author, title, isbn, ... seperately
  - Add clever fuzzy search backend for advanced separate search by title, isbn etc separately
  - Show fuzzy search results within given radius + complete matches even if outside the search radius
  - Search should handle oe = ö -> it does via fuzzy search
  - Umlaut not in db, weird non-ascii (catalog search glücklich does not work) -> does work now thanks to fuzzy
  - Fuzzy Search:
    - Rewrite fuzzy search to use 3grams and tokens
    - Set max_edit_dist based on query length

- CatalogScreen
  - ResultsList hat sort by Title, sort by Distance und sort by Einstellungsdatum
  - hat Suchleiste
    - Suchfunktion Backend verbessern
    - Buchsuche soll auch ohne standort gehen
    - Schalter für near you vs Suche ohne Standort
  - hat 2 Versionen (Version wird von parent Komponente festgelegt):
    - Catalog Search Results (near you oder generell)
    - Books at shelf xy: showing all books from one shelf
  - Kann Bücher von auf Karte gewähltem Regal zeigen
  - Bücher eines Regals sollen sortierbar nach Einstelldatum sein
  - Standort direkt abfragen bei klick auf search near me button, damit die suche dann schneller geht
  - Während Standortabfrage bei search near me den form submit deaktivieren bis ergebnis da, spinner zeigen

- PopularityChips
  - in eigene Component auslagern
  - Auch in ScanningResults zeigen
  - Im frontend ints zeigen, aber in DB floats speichern -> Präzisere avgs!!!

- ResultCardContent Component (Used inside ResultsList component)
  - ResultList items sind auch auf mobile komplett sichtbar
  - is a separate component
  - show how long book is in shelf already in result
  - ausleihen-Button der direkt remove ausführt
  - In catalog results: Clicking a result shows it on map ?
  - In catalog results: 'Navigate'-button on each result opens google maps navigation to the shelf
  - Results klickbar -> 'remove'/'take out' button

- HomeScreen
  - select button on homescreen map redirects to the catalog
  - Search on home screen works and leads to CatalogSearchScreen

- Scanning/InsertScreens
  - 'scan another' should compile a list of books that can be inserted/removed at once
  - rescan sinnvoll umbenennen (z.B. 'verwerfen' / 'not my book' / 'incorrect book')
  - Manuelle eingabe/buch ohne barcode/ISBN eingabe screen (oder popup) wird bei error gezeigt
  - Don't show 'error fetching book data' after removing scanned book from queue via 'wrong book' button

- ManualAdd Dialog
  - inserting foreign (non-DNB) isbn possible (with isbn 10 or 13)
  - kann bei scanning / book data fetching error geöffnet werden
  - kann bei klick auf wrong book button geöffnet werden

- Manual Add
  - Frontend:
    - Send user inputted author, title and isbn to backend
    - Handle all possible responses
      - invalid ISBN -> backend returns error
      - book with this ISBN already in db, but with other author/title -> backend returns warning and real title and author
      - book not in db and not in dnb, ISBN valid -> backend inserts data to books table and returns success
      - book already in db -> backend does nothing and returns success
    - Success: Add returned book to scanned books queue and returned (=properly formatted) ISBN to scanned isbns
    - Warning: Show warning: 'Found alternative title / author for this ISBN: ...' and add returned isbn and book to the books queue and to scanned isbns
    - Error: Show error: 'Invalid ISBN: Input does not match any ISBN format.'
  - Backend: ALWAYS returns status: str ('warning', 'success', 'error') and a Book object (if status not error)
    - check if ISBN valid, transform to ISBN-13
    - check if ISBN already in DB
      - if yes: check if title and author in DB match those of the input
        - match: Do nothing, return success and the book from DB
        - not matching: return warning and book from DB with real title and author
    - query dnb api with the isbn
      - Book found in DNB?
        - Title and author match the input?
          - Add book to the books table, including coverurl and dnbid
          - Return success and the book from the DB
        - Title and author do not match the input?
          - Add book with dnb data to the DB (books table), return warning and book from DB with real title and author
      - Book not found in DB and not in DNB:
        - Insert book with the given input data into books table, return success and the book

- ShelfSelectMap
  - select button switches to "selected" when clicked on shelfActionScreen
  - Während Standortabfrage LocateMe button deaktivieren und spinner zeigen als alternatives icon, vgl. searchNearMe

- MapPopup
  - ggf. Buttons ähnlich zu catalog results
  - ResultMetadataTable umbenennen und benutzen
  - human-readable times ('last updated 2 years ago') klein und grau in shelf popup anzeigen

- Makefiles:
  - 3 Makefiles
    - each makefile has 'help' target and documentation
    - choice of targets is up to you, but the first target in your Makefile should always be help so that just make will print some information on what can done with your Makefile.
    - For each target, specify:
      - (1) which files are read,
      - (2) which files are produced,
      - (3) how much time will it take approximately (second or minutes or hours or days),
      - (4) how much RAM and disk space will this need approximately (a few KB, a few MB, many GBs?).
    - If this information is too complex, it's probably a good idea to let make help just print the high-level info (which targets there are and a short description what they do) and have a make help-<target> which prints more detailed info for each target (and the make help page should mention that).
- top level Makefile
  - make test
    - Runs make test from frontend and backend makefiles

- use state/AppContextProvider.tsx
  - move userCoords there

- Code Quality:
  - linting and stylechecker on save einstellen und einschalten
  - use typechecker for python (e.g. mypy)
  - Use an import sorter on all files (esp. CatalogScreen.tsx)
  - start-all.sh and postcreatecommands removed, all bundled in dockerfile
  - move venv to the python / server directory if possible
  - sqlite connect close execute auslagern in wiederverwendbare Funktion statt code duplicates
  - (Unit) tests
    - Backend test for when DNB is down -> make test / make test-dnb
    - Unit tests (Only complex logic should be tested)
      - Unit tests / Doctests for python (backend) most complex logic functions
        - unit or doctests for popularity score calculations
        - unit or doctests for isbn parsing etc (osm parsing...)
      - Unit tests for react?! (frontend) <= start in shelfActions.tsx -> Not necessary
    - API calls should be tested (-> done in python), user interface doesn't need to be tested
      - add api tests for new endpoints
  - [reproducibility example](https://github.com/ad-freiburg/reproducibility-example)

- Automation:
  - Makefiles:
    - 3 Makefiles, all with detailed help targets, see [Reproducibility via Docker and Make](https://ad-wiki.informatik.uni-freiburg.de/teaching/Reproducibility)
  - Docker:
    - make project docker-compatible as wished
      - [here](https://ad-wiki.informatik.uni-freiburg.de/teaching/Reproducibility#Reproducibility_via_Docker_and_Make)
      - and [here](https://ad-wiki.informatik.uni-freiburg.de/teaching/DockerExample)
      - and [here](https://docs.docker.com/build/building/best-practices/)
      - and [here](https://docs.docker.com/build/building/multi-stage/)
    - do not require vs-code & devcontainer, only plain docker!

- Production Setup:
  - Implement production setup (caddy + gunicorn)

- Design:
  - Replace all uses of alert() with the ErrorDialog
  - add favicon
  - Buttons alignen wie die Popularity Chips (damit bei umbruch auf mobile vertikales alignment stimmt)
    - catalog search form (incl. near me button)
    - scanningResults / BookDisplay
    - shelfActionView

- Bugs fixed:
  - Times sind UST, nicht MESZ -> added 2h ago für gerade geaddete Bücher
  - Frontend:
    - Locate Me Tooltip bleibt manchmal hängen
    - single term search input field is slow on each keystroke (re-rendering the map?!)
      - locate me button is blinking on each keystroke?! Marker images also fetched on every keystroke?!

- Finalization:
  - Update bookshelves via qlever
  - check .ruff.toml for development excludes
  - search code for TODOs
  - clean up console.log and console.error usage

- Set up quicker tsserver and eslint import sorting
- Statt 'Could not get your location' auf mobile noch auffordern: 'Please activate GPS in your device settings'
- Map muss schneller werden!
- make map scrolling/zooming more responsive... e.g. by:
  - fetch and render bookshelf/map data async, to keep site reactive while initializing the map (?)
  - use react-leaflet-markercluster for rendering only necessary shelf markers
- check if the book exists in shelf before removing (backend!)
- backend for catalog search by location/author/isbn
- Wenn bei remove ein shelf gewählt wird, der das buch nicht hat, zeige warnung
- make sure the books normalized isbn with dashes and without spaces is stored in current_catalog and books db, not the isbn raw input!
- dont insert 'error fetching data' or 'unknown title' into catalog (front- and backend!)
- (caching von) backend/.db verstehen + aufräumen
- Suchfunktion Backend wieder verstehen + aufräumen + testen
- show search results even when no location given
- Move type definitions to /types in frontend
  - Only define type params in-file
- Use combined ruff.toml in settings.json AND in Makefile (combined ruff config for docker ruff and devcontainer ruff)
- digitize hand-written todos
- Implement Home screen (skeleton)
- make ScanningScreen more maintainable by splitting into multiple pages!
- use rem / % in global.css as well!!!
- ensure theme.ts is used
- ask Patrick about excludes in .ruff.toml
- PEP8 style einheitliche camelCase etc Nutzung [so link](https://stackoverflow.com/questions/42127593/should-python-class-filenames-also-be-camelcased)
- make sure nothing is hidden beneath bottom nav bar
- drop and recreate + fill table bookshelves
- query location only after user input!
- restructure server directory!
- use [react memo](https://www.w3schools.com/REACT/react_memo.asp) for scanner to avoid rerender
- use [react-router](https://www.w3schools.com/REACT/react_router.asp) for multi-page design
- implement server...
- ...with book data api that proxies dnb data
- ...with cache/db for book data and cover images (sqlite3)
- ...and backend for book extraction / addition (python & flask(dev)/Nginx(prod))
- ...and db for online catalog (sqlite3)
- use material ui (mui) for react buttons, input fields and other ui components
- frontend
- bookdata cache -> book can be inserted via `http://localhost:5000/api/shelf/insert`
- mobile first web design!
- disable isbn input once book will be inserted or removed!!! (might be fixed already, but make sure the camera cant find other codes while in background)
- backend reachable from mobile on same network
- camera feed working on mobile
- check where node_modules are installed on container restart and where they are sourced from by App.tsx etc. -> try moving to frontend!
- buch entnehmen/einstellen funktion
- properly design NotFoundScreen
- use rem / relative scaling for ui elements relative to appcontainer, which is 100dvh
- Fill bookshelves table with public_bookcases from osm
- backend for catalog search by title
- use ShelfMap for selecting shelf after scanning (ShelfActionScreen.tsx)
- map view
- CatalogScreen
- Übersicht über catalog search screens und features erstellen

### nice that I have (nice to have, but done)

- Mock dnb calls in tests with (from requests_mock.mocker import Mocker) so that tests dont fail if dnb offline?
  - add to fixtures.py: def app(requests_mock: Mocker) ... requests_mock.get(url) ...
  - Currently, I want tests to fail if dnb changes (because I want to see when the dnb changes)
  - Maybe one extra test file for checking if dnb is up & responding as expectesd, rest with mocker?
- add isbn (checksum) validation?
