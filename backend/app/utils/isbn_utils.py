# TODO: Use this function in the other files!
# TODO: add tests for it
def normalize_isbn(isbn: str) -> str:
    """Normalize ISBN by removing non-numeric characters.

    Allow capital X at the end for ISBN-10
    """
    # TODO: Sanity check: valid length?
    # TODO: maybe retun optional str (None if empty str input)
    isbn = isbn.strip()
    cleaned = "".join(filter(str.isdigit, isbn))
    if isbn.endswith(("X", "x")):
        return cleaned + "X"
    return cleaned
