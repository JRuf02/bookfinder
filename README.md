### Setup VS-Code Devcontainer

Use the provided Devcontainer to make the usage as easy as possible:

- Install [Docker](https://www.docker.com/) and [VS Code](https://code.visualstudio.com/)
- Install VS Code Devcontainer extension `ms-vscode-remote.remote-containers`
- Open this repository
- Press `F1` (or `CTRL + SHIFT + P`) and select `Dev Containers: Rebuild and Reopen Container`

### Run server

- Run `npm run dev` in base directory `\workspaces\isbn-scanner` inside the Devcontainer to start vite (react dev server)
- Run `npm run server` in base directory `\workspaces\isbn-scanner` inside the Devcontainer to start the book data api server (flask) (might need 'make install' first!)
- Alternatively run only `npm run start` in base directory `\workspaces\isbn-scanner` to start both servers.

#### Alternatively

- make install && make run (starts api server)
- npm run dev (starts frontend react server)

### Show the website

- Click on the popup by VS code to open the website in the browser after starting the server
- Or go to http://127.0.0.1:5173/

### TODO

- [ ] implement and test Makefiles!
- [ ] also for react?!
- [ ] clean up the spaghetti of npm run all, make, postcreatecommands, docker and start-all.sh
- [ ] make project docker-compatible as wished here: https://ad-wiki.informatik.uni-freiburg.de/teaching/Reproducibility#Reproducibility_via_Docker_and_Make
- [ ] implement tests ?
- [ ] adhere to coding standards
- [x] implement server...
- [x] ...with book data api that proxies dnb data
- [ ] ...with cache/db for book data and cover images (sqlite3)
- [ ] ...and backend for book extraction / addition (python & flask(dev)/Nginx(prod))
- [ ] ...and db for online catalog (sqlite3)
- [ ] backend for catalog search by location/author/title/isbn
- [ ] use material ui (mui) for react buttons and other ui components
- [ ] frontend
- [ ] support multiple languages?

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
