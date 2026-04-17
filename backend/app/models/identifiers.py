import re
from dataclasses import dataclass


@dataclass(frozen=True)
class Isbn:
    """Normalized and verified ISBN."""

    value: str

    def __str__(self) -> str:
        return self.value

    @classmethod
    def parse(cls, raw_isbn: str | None) -> "Isbn | None":
        """Parse and normalize raw ISBN input, then return an Isbn instance."""

        if not raw_isbn:
            return None

        # normalize
        isbn = raw_isbn.strip()
        cleaned = "".join(filter(str.isdigit, isbn))
        if isbn.endswith(("X", "x")):
            cleaned = cleaned + "X"

        # validate
        if len(cleaned) not in (10, 13):
            return None
        if len(cleaned) == 13 and "X" in cleaned:
            return None
        # TODO: Implement checksum validation for ISBN-10 and ISBN-13

        return cls(value=cleaned)


@dataclass(frozen=True)
class DnbIsbn:
    """DNB formatted ISBN."""

    value: str
    normalized: Isbn

    def __str__(self) -> str:
        return self.value

    @classmethod
    def parse(cls, raw_dnb_isbn: str | None) -> "DnbIsbn | None":

        if not raw_dnb_isbn:
            return None

        raw_dnb_isbn = raw_dnb_isbn.strip()
        # TODO: Check if exactly 5 groups (4 hyphens) are present in the raw DNB ISBN
        # TODO: Check for invalid characters in the raw DNB ISBN (only digits, -, 'X')

        normalized_isbn = Isbn.parse(raw_dnb_isbn)
        if not normalized_isbn:
            return None

        return cls(value=raw_dnb_isbn, normalized=normalized_isbn)


@dataclass(frozen=True)
class OsmId:
    """OSM ID."""

    value: str

    def __str__(self) -> str:
        return self.value

    @classmethod
    def parse(cls, raw_osm_id: str | None) -> "OsmId | None":

        if not raw_osm_id:
            return None
        osm_id = raw_osm_id.strip()

        pattern = r"^https:\/\/www\.openstreetmap\.org\/(node|way|relation)\/\d+$"

        if not re.match(pattern, osm_id):
            return None

        return cls(value=osm_id)
