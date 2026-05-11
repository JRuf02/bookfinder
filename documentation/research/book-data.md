# ISBN to book metadata

When we scan a barcode, we get the ISBN of the book, but not its title, author and other metadata.
To get this information, we need to use external databases.

## isbn to book data via dnb

- [information about dnb data](https://www.dnb.de/DE/Professionell/Metadatendienste/Datenbezug/SRU/sru_node.html#doc58294bodyText5)

- [alternative](https://www.dnb.de/DE/Professionell/Metadatendienste/Datenbezug/LDS/lds_node.html#doc58246bodyText7) (not used in this project)

- [html book data (catalog page)](https://portal.dnb.de/opac/simpleSearch?query=%223551551677%22) -> needs parsing

- [jpg (cover image)](https://portal.dnb.de/opac/mvb/cover?isbn=978-3-551-55167-2&size=m) (can be tested with `wget --no-check-certificate "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-551-55167-2&size=m"`)

- xml book data
  - [marc-21-xml formatted](https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query="3551551677"&recordSchema=MARC21-xml&maximumRecords=1) (currently used for this project)
  - [rdf-xml formatted](https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query=%223551551677%22&maximumRecords=1)
