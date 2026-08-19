from app.models.coordinates import GeoCoordinateError, GeoCoordinates


def test_parse_accepts_zero_coordinates() -> None:
    result = GeoCoordinates.parse(0.0, 0.0)

    assert result == GeoCoordinates(latitude=0.0, longitude=0.0)


def test_parse_returns_none_when_both_values_are_missing() -> None:
    assert GeoCoordinates.parse(None, None) is None


def test_parse_reports_missing_or_invalid_values() -> None:
    assert isinstance(GeoCoordinates.parse(None, 12.3), GeoCoordinateError)
    assert isinstance(GeoCoordinates.parse(12.3, None), GeoCoordinateError)
    assert isinstance(GeoCoordinates.parse(float("nan"), 0.0), GeoCoordinateError)
    assert isinstance(GeoCoordinates.parse(0.0, float("inf")), GeoCoordinateError)
    assert isinstance(GeoCoordinates.parse(91.0, 0.0), GeoCoordinateError)
    assert isinstance(GeoCoordinates.parse(0.0, 181.0), GeoCoordinateError)


def test_parse_rounds_coordinates_to_nine_decimal_places() -> None:
    result = GeoCoordinates.parse(12.34567891234, -98.76543219876)

    assert result == GeoCoordinates(latitude=12.345678912, longitude=-98.765432199)
