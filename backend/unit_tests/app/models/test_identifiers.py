import pytest

from app.models.identifiers import Isbn


@pytest.mark.parametrize(
    ("raw_isbn", "expected_isbn13"),
    [
        ("3-453-08888-3", "978-3-453-08888-7"),  # valid ISBN-10
        ("34-530-88883 ", "978-3-453-08888-7"),  # ill formatted ISBN-10
        ("3453088883", "978-3-453-08888-7"),  # ISBN-10 without hyphens
        ("344009765x", "978-3-440-09765-6"),
        ("344009765X", "978-3-440-09765-6"),
        ("3-440-09765-X", "978-3-440-09765-6"),  # valid ISBN-10 with X check digit
        ("3-440-09765-x", "978-3-440-09765-6"),
        ("978-3-453-08888-7", "978-3-453-08888-7"),  # valid ISBN-13
        ("9783453088887", "978-3-453-08888-7"),  # ISBN-13 without hyphens
        ("97--834-530888-87", "978-3-453-08888-7"),  # ill formatted ISBN-13
        ("-9783453088887", "978-3-453-08888-7"),
        (" 9783 453 0888 87 ", "978-3-453-08888-7"),
    ],
)
def test_isbn_parse_accepts_valid_and_normalizable_inputs(
    raw_isbn: str, expected_isbn13: str
) -> None:
    result = Isbn.parse(raw_isbn)

    assert result is not None
    assert str(result) == expected_isbn13
    assert result.canonical == expected_isbn13.replace("-", "")


@pytest.mark.parametrize(
    "raw_isbn",
    [
        None,
        "",
        "   ",
        "453088883",  # too few digits
        "345308888",  # missing check digit
        "34530888833",  # too many digits
        "-453088883",  # too few digits
        "3-453-08888-33",  # too many digits
        "3-453-0888-3",  # too few digits
        "3-440-09765-10",  # invalid check digit / too many
        "3-440-09765-XX",  # invalid check digit / too many
        "3-440-09765-A",  # invalid check digit
        "3-440-09X65-X",  # X outside the check digit position
        "3-453-0888X-3",  # X outside the check digit position
        "3-453-08888-0",  # ISBN-10 with a wrong check digit
        "978-3-453-08888-0",  # ISBN-13 with a wrong check digit
    ],
)
def test_isbn_parse_rejects_unnormalizable_cases(
    raw_isbn: str | None,
) -> None:
    assert Isbn.parse(raw_isbn) is None
