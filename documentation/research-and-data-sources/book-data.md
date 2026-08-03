# ISBN to book metadata

- When we scan a barcode, we get the ISBN of the book, but not its title, author and other metadata.
- To get this information, we need to use external databases.

## ISBN to book data via DNB (Deutsche Nationalbibliothek)

- DNB contains every book that has ever been produced for the German market
  - that means it contains mostly the german versions of books, mostly ISBN 978-3-XXXXXXXXX
  - books produced for other countries might not be found (e.g. many ISBN 978-1-XXXXXXXXX books)
  - most books you'll find in German households will be found on DNB
  - this is sufficient for now, as this project's scope is Germany, not world-wide
  - if a user scans a book that is unknown to DNB, there is a form for manual metadata entry in my web app

- [information about dnb data](https://www.dnb.de/DE/Professionell/Metadatendienste/Datenbezug/SRU/sru_node.html#doc58294bodyText5)

- [alternative](https://www.dnb.de/DE/Professionell/Metadatendienste/Datenbezug/LDS/lds_node.html#doc58246bodyText7) (not used in this project)

- [html book data (catalog page)](https://portal.dnb.de/opac/simpleSearch?query=%223551551677%22) -> needs parsing

- [jpg (cover image)](https://portal.dnb.de/opac/mvb/cover?isbn=978-3-551-55167-2&size=m) (can be tested with `wget --no-check-certificate "https://portal.dnb.de/opac/mvb/cover?isbn=978-3-551-55167-2&size=m"`)

- xml book data
  - [marc-21-xml formatted](https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query="3551551677"&recordSchema=MARC21-xml&maximumRecords=1) (currently used for this project)
  - [rdf-xml formatted](https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query=%223551551677%22&maximumRecords=1)

- python [isbnlib-dnb plugin](https://pypi.org/project/isbnlib-dnb/) (not used in this project)

## Other sources for book metadata

### These services could also be used for book data lookup via ISBN:

- Internet Archive Open Library
  - https://github.com/internetarchive/openlibrary
  - https://openlibrary.org/developers/api
  - https://openlibrary.org/dev/docs/api/search
  - https://openlibrary.org/search/howto
  - https://openlibrary.org/data#downloads
  - https://openlibrary.org/developers/dumps
- WorldCat ("World's largest bibliographic database")
  - https://en.wikipedia.org/wiki/WorldCat
  - https://search.worldcat.org/de/search?q=bn=%229781526626585%22
- Google Books
  - [direct link](https://books.google.de/books?vid=ISBN9781526626585)
  - [google search results](https://www.google.com/search?tbm=bks&q=isbn:9781526626585)
- isbnsearch.org (no api, would need html scraping)
  - https://isbnsearch.org/isbn/9781526626585
- Barcode Lookup (commercial product, needs payment)
  - https://www.barcodelookup.com/api#sign-up

### More services

- Wikipedia Germany ISBN Search
  - Lists more online libraries: mostly german, some international
  - https://de.wikipedia.org/wiki/Spezial:ISBN-Suche?isbn=3551551677
- Wikipedia English ISBN Search
  - international / english libraries; missing some of the german libraries
  - https://en.wikipedia.org/wiki/Special:BookSources/3551551677

# Websites for manual search of ISBN for a given book title

These are websites I used for getting valid example ISBNs for testing:

- [Thalia](https://www.thalia.de/shop/home/artikeldetails/A1000707427): Mostly books with German ISBN (978-3-XXXXXXXXX)
- [Osiander](https://www.osiander.de/shop/home/artikeldetails/A1057463678): For books with English ISBN (978-1-XXXXXXXXX)
- [Springer Nature](https://link.springer.com/book/10.1007/978-3-319-25166-0)
