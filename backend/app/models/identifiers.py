import re
from dataclasses import dataclass

import isbnlib

"""
TODO: Write unit tests for these:
ISBN-10 examples:
valid:
3-123-40873-2
3-123-40873-X
3-123-40873-x

invalid, but accepted and normalized to valid:
3123408732
312340873X
3-12340873-2

invalid:
-123-40873-2
3-40873-2
3--40873-2
3-123-4087x-x
3-123-40873-22
3-123408-73-2
3-123--40873-2
-3-123-40873-2
"""


@dataclass(frozen=True)
class Isbn:
    """Normalized and verified ISBN-13."""

    value: str

    def __str__(self) -> str:
        return self.value

    @property
    def canonical(self) -> str:
        """Return ISBN in canonical form of ISBN-13 (digits only, no hyphens)."""
        return isbnlib.canonical(self.value)

    @classmethod
    def parse(cls, raw_isbn: str | None) -> "Isbn | None":
        """Parse and normalize raw ISBN input, then return an Isbn instance."""

        if not raw_isbn:
            return None

        raw_isbn = raw_isbn.strip()

        cleaned = isbnlib.clean(raw_isbn)

        if isbnlib.is_isbn10(cleaned):
            cleaned = isbnlib.to_isbn13(cleaned)

        if not isbnlib.is_isbn13(cleaned):
            return None

        canonical = isbnlib.canonical(cleaned)

        hyphenated = isbnlib.mask(canonical)

        return cls(value=hyphenated)


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
