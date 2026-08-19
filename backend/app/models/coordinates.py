import math
from dataclasses import dataclass

MAX_LATITUDE = 90
MAX_LONGITUDE = 180


@dataclass
class GeoCoordinateError:
    """Error in geographic coordinates."""

    message: str


@dataclass(frozen=True)
class GeoCoordinates:
    """Verified geographic coordinates.

    Always create via GeoCoordinates.parse() to ensure validity.
    Do not use GeoCoordinates() constructor directly in production code,
    as it does not perform validation!
    """

    latitude: float
    longitude: float

    def __str__(self) -> str:
        """Return the geographic coordinates as a string."""
        return f"{self.latitude}, {self.longitude}"

    @classmethod
    def parse(  # noqa: PLR0911
        cls, raw_latitude: float | None, raw_longitude: float | None
    ) -> "GeoCoordinates | None | GeoCoordinateError":
        """Verify and round raw coordinates to 9 digits,
        then return a GeoCoordinates instance.
        """

        if raw_latitude is None and raw_longitude is None:
            return None

        if raw_latitude is None:
            return GeoCoordinateError("Latitude is missing.")

        if raw_longitude is None:
            return GeoCoordinateError("Longitude is missing.")

        if not math.isfinite(raw_latitude):
            return GeoCoordinateError("Latitude must be a finite number.")

        if not math.isfinite(raw_longitude):
            return GeoCoordinateError("Longitude must be a finite number.")

        if not -MAX_LONGITUDE <= raw_longitude <= MAX_LONGITUDE:
            return GeoCoordinateError(
                f"Longitude must be between -180 and 180. Got {raw_longitude}."
            )

        if not -MAX_LATITUDE <= raw_latitude <= MAX_LATITUDE:
            return GeoCoordinateError(
                f"Latitude must be between -90 and 90. Got {raw_latitude}."
            )

        lat = round(raw_latitude, 9)
        lon = round(raw_longitude, 9)

        return cls(latitude=lat, longitude=lon)
