from app.dnb_api import fetch_cover_from_dnb
from app.models.identifiers import Isbn


def get_cover_from_db(isbn: Isbn, size: str = "l") -> tuple[bytes, str] | None:
    """Get cover image from backend database if available.
    Otherwise, try fetching it from DNB and store it in the database
    for future requests.
    If all fails, return None.
    """
    # TODO: Try to get cover from the db and return it immediately if found

    # Proxy the cover image request to the DNB server
    cover = fetch_cover_from_dnb(isbn, size)

    # TODO: Cache image in the db (table 'books') for future requests
    # if cover is not None:
    #     store_cover_in_db(isbn, size, cover) ?

    return cover
