"""Geographical utility functions.

Copied and adapted from:
https://stackoverflow.com/questions/4913349/haversine-formula-in-python-bearing-and-distance-between-two-gps-points
(2025-07-12)
"""

from math import asin, cos, radians, sin, sqrt


def haversine(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    """Calculate the great circle distance in meters between two points
    on the earth (specified in decimal degrees).

    >>> import pytest
    >>> haversine(0.0, 0.0, 0.0, 1.0) == pytest.approx(111194.927, abs=0.001)
    True
    >>> haversine(7.835054, 48.012698, 13.698550, 50.910346) == (
    ...     pytest.approx(532078.990, abs=0.001)
    ... )
    True
    """
    # convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    # haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    # Radius of earth in meters. Use 3956 for miles. Determines return value units.
    r = 6371000
    return round(c * r, 3)
