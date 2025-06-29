### Setup VS-Code Devcontainer

Use the provided Devcontainer to make the usage as easy as possible:

- Install [Docker](https://www.docker.com/) and [VS Code](https://code.visualstudio.com/)
- Install VS Code Devcontainer extension `ms-vscode-remote.remote-containers`
- Open this repository
- Press `F1` (or `CTRL + SHIFT + P`) and select `Dev Containers: Rebuild and Reopen Container`

### Run server

- /workspaces/isbn-scanner/frontend # npm install
- Run `npm run dev` in directory `\workspaces\isbn-scanner\frontend` inside the Devcontainer to start vite (react dev server)
- Run `make run` in directory `\workspaces\isbn-scanner\server` inside the Devcontainer to start the book data api server (flask) (might need 'make install' first!)

### Show the website

- Click on the popup by VS code to open the website in the browser after starting the server
- Or go to https://127.0.0.1:5173/

### Show the website on another device

- Start vite and flask servers in the container
- Connect host and the device to the same network (no eduroam!)
- Run ipconfig on the host (outside the docker container) to find its IPv4 address
- Open https://host-ip:5173/ on your device's browser
- Accept self-signed certificate
- Accept camera permission

### TODO

1. bookdata cache
   1.1. mit openstreetmap bookcase id
   -> was ist sinnvoller: group by bookcase oder by isbn?
2. buch entnehmen/einstellen funktion -> mobile first web design!
3. online katalog
4. map view

table books:
isbn dnb-isbn title author (link-to)-cover-image ...

table bookshelves:
osm-id name (location)

table current-catalog:
entry-id osm-id isbn time-of-entry

- [ ] save image to db
- [x] backend reachable from mobile on same network
- [x] camera feed working on mobile
- [ ] frontend error handling when backend offline (error fetching data) -> schönere Message anzeigen
- [ ] server.py ctb contributor adden + error handling falls eins der attribute nicht gefunden
- [x] check where node_modules are installed on container restart and where they are sourced from by App.tsx etc. -> try moving to frontend!
- [ ] implement and test Makefiles!
- [ ] also for react?!
- [ ] clean up the spaghetti of npm run all, make, postcreatecommands, docker and start-all.sh
- [ ] move venv to the python / server directory if possible
- [ ] make project docker-compatible as wished here: https://ad-wiki.informatik.uni-freiburg.de/teaching/Reproducibility#Reproducibility_via_Docker_and_Make
- [ ] implement tests ?
- [ ] adhere to coding standards
- [x] implement server...
- [x] ...with book data api that proxies dnb data
- [x] ...with cache/db for book data and cover images (sqlite3)
- [ ] ...and backend for book extraction / addition (python & flask(dev)/Nginx(prod))
- [ ] ...and db for online catalog (sqlite3)
- [ ] backend for catalog search by location/author/title/isbn
- [ ] map view
- [ ] use material ui (mui) for react buttons and other ui components
- [ ] frontend
- [ ] support multiple languages?
- [ ] type annotations in python!
- [ ] search code for TODOs

### isbn to book data via dnb

#### infos

https://www.dnb.de/DE/Professionell/Metadatendienste/Datenbezug/SRU/sru_node.html#doc58294bodyText5

#### html book data (catalog page)

https://portal.dnb.de/opac/simpleSearch?query=%223551551677%22

#### jpg (cover image)

https://portal.dnb.de/opac/mvb/cover?isbn=978-3-551-55167-2&size=m

#### xml book data

##### marc-21-xml formatted

https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query="3551551677"&recordSchema=MARC21-xml&maximumRecords=1

##### rdf-xml formatted

https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query=%223551551677%22&maximumRecords=1

## show on mobile

-connect to same network
-find ipv4 address of host via iplookup
-go to https://hostip:5173

## easy open on mobile (experimental, doesnt work on windows host yet)

-# Display the host IP address for QR code generation
HOST_IP=$(hostname -i | awk '{print $1}')
echo "Your application is running at: https://${HOST_IP}:5173"
echo "Scan this QR code on your mobile device to access the app:"
qrencode -t ANSIUTF8 "https://${HOST_IP}:5173"

-# Or open in the host browser
"$BROWSER" "https://${HOST_IP}:5173"

##### bugs

Normalized ISBN: 123456789X
Book not found in DB for ISBN: 123456789X
Error fetching book data: 'NoneType' object has no attribute 'find'
Fetched book data from dnb: {'title': 'Error fetching data', 'author': '', 'dnbISBN': '', 'dnbId': ''}
127.0.0.1 - - [23/Jun/2025 13:29:16] "GET /api/books?isbn=123456789X HTTP/1.1" 200 -

No image on mobile because https request to http flask server?
172.17.0.1 - - [23/Jun/2025 13:32:03] code 400, message Bad request version ('n\x04\x05\x8bÓ\x95´Eë\x97\x92Ð|9Êã\x19\x06äåð\x91Ã\x88æõu\x1b\x13\x90Í\x88\x00"\x13\x01\x13\x03\x13\x02À+À/Ì©Ì¨À,À0À')
172.17.0.1 - - [23/Jun/2025 13:32:03] "\x16\x03\x01\x02\x85\x01\x00\x02\x81\x03\x03\x14\x96\x01\x86HÂ\x1f\x91¦¬û>¬½\x91\x196íÞ\x01\x0b¡2Å^\x0f\x80¦ø}=» n\x04\x05\x8bÓ\x95´Eë\x97\x92Ð|9Êã\x19\x06äåð\x91Ã\x88æõu\x1b\x13\x90Í\x88\x00"\x13\x01\x13\x03\x13\x02À+À/Ì©Ì¨À,À0À" 400 -
