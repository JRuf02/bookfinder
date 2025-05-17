### Setup VS-Code Devcontainer

Use the provided Devcontainer to make the usage as easy as possible:

- Install [Docker](https://www.docker.com/) and [VS Code](https://code.visualstudio.com/)
- Install VS Code Devcontainer extension `ms-vscode-remote.remote-containers`
- Open this repository
- Press `F1` (or `CTRL + SHIFT + P`) and select `Dev Containers: Rebuild and Reopen Container`

### Run server

- Run `npm run dev` in base directory `\workspaces\isbn-scanner` inside the Devcontainer

### Show the website

- Click on the popup by VS code to open the website in the browser after starting the server

### isbn to book data via dnb

#### infos

https://www.dnb.de/DE/Professionell/Metadatendienste/Datenbezug/SRU/sru_node.html#doc58294bodyText5

#### html

https://portal.dnb.de/opac/simpleSearch?query=%223551551677%22

#### jpg (cover image)

https://portal.dnb.de/opac/mvb/cover?isbn=978-3-551-55167-2&size=m
https://portal.dnb.de/opac/mvb/cover?isbn=3-551-55167-2&size=m

#### xml

https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query="3551551677"&recordSchema=MARC21-xml&maximumRecords=1
https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query=%223551551677%22&maximumRecords=1
