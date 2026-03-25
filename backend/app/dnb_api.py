import logging
import xml.etree.ElementTree as ET

import requests
from flask import Response, jsonify
from flask.typing import ResponseReturnValue

from app.models.book import Book

logger = logging.getLogger(__name__)


def fetch_book_from_dnb(isbn: str) -> Book:
    """Fetch book data from DNB using the ISBN."""
    url = f'https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query="{isbn}"&recordSchema=MARC21-xml&maximumRecords=1'

    try:
        response = requests.get(url)
        response.raise_for_status()

        xml_text = response.text
        root = ET.fromstring(xml_text)

        # Extract data from XML
        title = "Unknown Title"
        author = "Unknown Author"
        dnb_isbn = isbn
        dnb_id = ""

        # Find record
        record_element = root.find(".//{http://www.loc.gov/MARC21/slim}record")

        if record_element is not None:
            # Extract title
            title_field = record_element.find(
                './/{http://www.loc.gov/MARC21/slim}datafield[@tag="245"]/{http://www.loc.gov/MARC21/slim}subfield[@code="a"]'
            )
            if title_field is not None and title_field.text:
                title = title_field.text

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
                    # TODO: also check ctb (contributor) + error handling when no author found at all
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

            # author = ', '.join(authors) if authors else "Unknown Author"
            author = authors[0] if authors else "Unknown Author"

            # Extract DNB ISBN
            isbn_field = record_element.find(
                './/{http://www.loc.gov/MARC21/slim}datafield[@tag="020"]/{http://www.loc.gov/MARC21/slim}subfield[@code="9"]'
            )
            if isbn_field is not None and isbn_field.text:
                dnb_isbn = isbn_field.text

            # Extract DNB ID
            id_field = record_element.find(
                './/{http://www.loc.gov/MARC21/slim}controlfield[@tag="001"]'
            )
            if id_field is not None and id_field.text:
                dnb_id = id_field.text

        return Book(
            isbn=isbn,
            title=title,
            author=author,
            dnbISBN=dnb_isbn,
            dnbId=dnb_id,
            # TODO? don't hardcode coverUrl
            coverUrl=f"https://portal.dnb.de/opac/mvb/cover?isbn={dnb_isbn}&size=l",
        )
    except Exception as e:
        logger.error(f"Error fetching book data: {e}")
        # TODO: Handle errors consistently (vgl. fetch_cover_from_dnb)
        return Book(
            isbn=isbn,
            title="Error fetching data",
            author="",
            dnbISBN="",
            dnbId="",
            coverUrl=None,
        )


def fetch_cover_from_dnb(isbn: str, size: str = "l") -> ResponseReturnValue:
    """Fetch cover image from DNB using the ISBN."""

    # Validate size parameter (should be 's', 'm', or 'l')
    if size not in ["s", "m", "l"]:
        return jsonify({"error": "Invalid size parameter"}), 400

    cover_url = f"https://portal.dnb.de/opac/mvb/cover?isbn={isbn}&size={size}"

    try:
        response = requests.get(cover_url, stream=True)

        # Create a Flask response with the image data
        return Response(
            response.content,
            status=response.status_code,
            content_type=response.headers.get("Content-Type", "image/jpeg"),
        )
    except Exception as e:
        logger.error(f"Error fetching cover: {e}")
        return jsonify({"error": "Failed to fetch cover image"}), 500
