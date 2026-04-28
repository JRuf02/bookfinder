from dataclasses import dataclass


@dataclass
class DatabaseQueryError:
    """Error while processing a database query."""

    message: str
