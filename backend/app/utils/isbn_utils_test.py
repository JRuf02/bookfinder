from app.utils import isbn_utils


def test_normalize_isbn() -> None:
    assert isbn_utils.normalize_isbn("978-3-16-148410-0") == "9783161484100"
    assert isbn_utils.normalize_isbn(" 978 3 16 148410 0 ") == "9783161484100"
    assert isbn_utils.normalize_isbn("9783161484100") == "9783161484100"
    assert isbn_utils.normalize_isbn("123456789X") == "123456789X"
    assert isbn_utils.normalize_isbn("123456789x") == "123456789X"
    assert isbn_utils.normalize_isbn("123-456-789-x") == "123456789X"
    assert isbn_utils.normalize_isbn("") == ""
