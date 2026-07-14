from dataclasses import dataclass

import pendulum


@dataclass(frozen=True)
class TimezonedDatetimeString:
    """Normalized and verified ISO 8601 time string with timezone information."""

    value: str

    def __str__(self) -> str:
        return self.value

    @classmethod
    def parse(cls, raw_time: str | None) -> "TimezonedDatetimeString | None":
        if not raw_time:
            return None

        raw_time = raw_time.strip()

        if not raw_time:
            return None

        try:
            # Normalize common whitespace variations
            raw_time = raw_time.replace(" ", "T")

            dt = pendulum.parse(raw_time, tz="UTC")

            # Always output UTC
            dt = dt.in_tz("UTC")  # pyright: ignore[reportAttributeAccessIssue]

            # Remove microseconds
            dt = dt.replace(microsecond=0)

            return cls(value=dt.to_iso8601_string())

        except (ValueError, pendulum.parsing.exceptions.ParserError):
            return None
