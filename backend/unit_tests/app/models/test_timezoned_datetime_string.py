import pendulum
import pytest

from app.models.time_strings import TimezonedDatetimeString

# Test the three time formats we expect to get from the database:


def test_parse_sqlite_insertion_time_format():
    """Test parsing of SQLite insertion time format (YYYY-MM-DD HH:MM:SS)."""
    result = TimezonedDatetimeString.parse("2026-07-14 10:30:00")

    assert result is not None
    # Assume UTC if no timezone given
    assert str(result) == "2026-07-14T10:30:00Z"


def test_parse_osm_check_date_format():
    """Test parsing of OSM check date format (YYYY-MM-DD)."""
    result = TimezonedDatetimeString.parse("2026-07-14")

    assert result is not None
    assert str(result) == "2026-07-14T00:00:00Z"


def test_parse_osm_last_updated_format():
    """Test parsing of OSM last updated format (YYYY-MM-DDTHH:MM:SS)."""
    result = TimezonedDatetimeString.parse("2026-07-14T10:30:00")

    assert result is not None
    assert str(result) == "2026-07-14T10:30:00Z"


# Test other timezones, some other formats and error handling


def test_parse_none_returns_none():
    assert TimezonedDatetimeString.parse(None) is None


def test_parse_empty_string_returns_none():
    assert TimezonedDatetimeString.parse("") is None


def test_parse_whitespace_only_returns_none():
    assert TimezonedDatetimeString.parse("   ") is None


def test_parse_zero():
    assert TimezonedDatetimeString.parse("0") is None


def test_parse_year_only():
    result = TimezonedDatetimeString.parse("2026")

    assert result is not None
    assert str(result) == "2026-01-01T00:00:00Z"


def test_parse_utc_input_with_z_suffix():
    result = TimezonedDatetimeString.parse("2026-07-14T10:30:00Z")

    assert result is not None
    assert str(result) == "2026-07-14T10:30:00Z"


def test_parse_positive_timezone_converts_to_utc():
    result = TimezonedDatetimeString.parse("2026-07-14T12:30:00+02:00")

    assert result is not None
    assert str(result) == "2026-07-14T10:30:00Z"


def test_parse_negative_timezone_converts_to_utc():
    result = TimezonedDatetimeString.parse("2026-07-14T05:30:00-05:00")

    assert result is not None
    assert str(result) == "2026-07-14T10:30:00Z"


def test_parse_timezone_only_hours():
    result = TimezonedDatetimeString.parse("2026-07-14T05:30:00-05")

    assert result is not None
    assert str(result) == "2026-07-14T10:30:00Z"


def test_parse_trims_surrounding_whitespace():
    result = TimezonedDatetimeString.parse("  2026-07-14T10:30:00Z ")

    assert result is not None
    assert str(result) == "2026-07-14T10:30:00Z"


def test_parse_invalid_input():
    assert TimezonedDatetimeString.parse("-") is None


def test_parse_invalid_date():
    assert TimezonedDatetimeString.parse("2026-02-30T10:30:00Z") is None


def test_parse_removes_microseconds():
    result = TimezonedDatetimeString.parse("2026-07-14T10:30:00.123456Z")

    assert result is not None
    assert str(result) == "2026-07-14T10:30:00Z"


def test_string_returns_iso_value():
    value = "2026-07-14T10:30:00Z"
    timestamp = TimezonedDatetimeString.parse(value)

    assert str(timestamp) == value
