import logging
from xml.etree.ElementTree import Element

import requests
from defusedxml import ElementTree
from http_constants.status import HttpStatus

from app.models.book import Book
from app.models.identifiers import Isbn

logger = logging.getLogger(__name__)


def fetch_book_from_dnb(isbn: Isbn) -> Book | None:
    """Fetch book data from DNB using the ISBN."""
    url = f'https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query="{isbn!s}"&recordSchema=MARC21-xml&maximumRecords=1'
    # TODO: fallback query={isbn.canonical} if no book found

    response = requests.get(url, timeout=10)
    if response.status_code != HttpStatus.OK.value:
        logger.error(f"Failed to fetch data from DNB: {response.status_code}")
        return None

    xml_text = response.text
    try:
        root = ElementTree.fromstring(xml_text)
    except ElementTree.ParseError as e:
        logger.error(f"Invalid XML from DNB: {e}")
        return None

    # Find record
    record_element = root.find(".//{http://www.loc.gov/MARC21/slim}record")
    if record_element is None:
        logger.debug(f"No record found in DNB for ISBN: {isbn!s}")
        return None

    title = extract_title_from_marc_21_xml(record_element)
    author = extract_author_from_marc_21_xml(record_element)
    dnb_id = extract_dnb_id_from_marc_21_xml(record_element)

    if dnb_id is None:
        logger.debug(f"No record found in DNB for ISBN: {isbn!s}")
        return None

    return Book(
        isbn=isbn,
        title=title,
        author=author,
        dnb_id=dnb_id,
        # TODO? don't hardcode coverUrl?
        cover_url=f"https://portal.dnb.de/opac/mvb/cover?isbn={isbn!s}&size=l",
    )


def extract_title_from_marc_21_xml(record_element: Element) -> str | None:
    title = None

    title_field = record_element.find(
        './/{http://www.loc.gov/MARC21/slim}datafield[@tag="245"]/{http://www.loc.gov/MARC21/slim}subfield[@code="a"]'
    )
    if title_field is not None and title_field.text:
        title = title_field.text

    return title


def extract_author_from_marc_21_xml(record_element: Element) -> str | None:
    author = None

    authors = []

    # Author (field 100 sometimes also artist or protagonist)
    main_author_field = record_element.find(
        './/{http://www.loc.gov/MARC21/slim}datafield[@tag="100"]'
    )
    if main_author_field is not None:
        role = main_author_field.find(
            './/{http://www.loc.gov/MARC21/slim}subfield[@code="4"]'
        )  # Should be 'aut' for author
        name = main_author_field.find(
            './/{http://www.loc.gov/MARC21/slim}subfield[@code="a"]'
        )

        role_text = role.text if role is not None else None
        name_text = name.text if name is not None else None

        if (
            role_text is not None
            and name_text is not None
            and "aut" in role_text.lower()
        ):
            # TODO: also check ctb (contributor) + error handling when
            # no author found at all
            authors.append(name_text)

    # More authors (sometimes authors are only in field 700)
    for df in record_element.findall(
        './/{http://www.loc.gov/MARC21/slim}datafield[@tag="700"]'
    ):
        role = df.find('.//{http://www.loc.gov/MARC21/slim}subfield[@code="4"]')
        name = df.find('.//{http://www.loc.gov/MARC21/slim}subfield[@code="a"]')

        role_text = role.text if role is not None else None
        name_text = name.text if name is not None else None

        if (
            role_text is not None
            and name_text is not None
            and "aut" in role_text.lower()
        ):
            authors.append(name_text)

    # TODO: handle multiple authors better
    # author = ', '.join(authors) if authors else "Unknown Author" TODO
    if authors:
        author = authors[0]

    return author


def extract_dnb_id_from_marc_21_xml(record_element: Element) -> str | None:
    dnb_id = None

    id_field = record_element.find(
        './/{http://www.loc.gov/MARC21/slim}controlfield[@tag="001"]'
    )
    if id_field is not None and id_field.text:
        dnb_id = id_field.text

    return dnb_id


def fetch_cover_from_dnb(isbn: Isbn, size: str = "l") -> tuple[bytes, str] | None:
    """Fetch cover image from DNB using the ISBN."""

    cover_url = f"https://portal.dnb.de/opac/mvb/cover?isbn={isbn!s}&size={size}"
    logger.info(f"Fetching cover from DNB: {cover_url}")

    try:
        response = requests.get(cover_url, stream=True, timeout=3)
    except Exception as e:  # TODO: catch more specific exceptions
        logger.error(f"Error fetching cover: {e}")
        return None

    if response.status_code != HttpStatus.OK.value:
        logger.error(f"Failed to fetch cover from DNB: {response.status_code}")
        return None

    if isinstance(response.content, bytes):
        return response.content, response.headers.get("Content-Type", "image/jpeg")

    logger.error(
        f"Invalid response content type for cover image: {type(response.content)}"
    )
    return None
