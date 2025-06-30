from dataclasses import asdict
from flask import Flask, jsonify, request, Response
from flask_cors import CORS

from database import init_db, get_book_from_database, save_book_to_db
from dnb_api import fetch_book_from_dnb, fetch_cover_from_dnb

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/books', methods=['GET'])
def get_book() -> Response:
    isbn = request.args.get('isbn')
    if not isbn:
        return jsonify({"error": "ISBN parameter is required"}), 400

    # Normalize ISBN (remove spaces, dashes, and convert to uppercase)
    isbn = isbn.replace(" ", "").replace("-", "").upper()
    # Remove any non-numeric characters (except for 'X' at the end of ISBN-10)  # TODO write test for this and move to util function
    isbn = ''.join(filter(lambda x: x.isdigit() or (x == 'X' and len(isbn) == 10 and isbn[-1] == 'X'), isbn))
    print(f"Normalized ISBN: {isbn}")  # TODO: add logger

    # 1. Try to get book from local DB
    book = get_book_from_database(isbn)
    if book:
        print(f"Book found in DB: {book}")  # TODO: add logger
        return jsonify(asdict(book))
    print(f"Book not found in DB for ISBN: {isbn}")  # TODO: add logger

    # 2. If not found, fetch from DNB and cache it
    book = fetch_book_from_dnb(isbn)
    print(f"Fetched book data from dnb: {book}")  # TODO: add logger
    if book.title != "Error fetching data" and book.title != "Unknown Title":
        save_book_to_db(book)

    return jsonify(asdict(book))


@app.route('/api/covers', methods=['GET'])
def get_cover() -> Response:
    '''Should be called with dnb isbn format.'''
    isbn = request.args.get('isbn')
    size = request.args.get('size', 'l')
    
    if not isbn:
        return jsonify({"error": "ISBN parameter is required"}), 400
   
    # Proxy the cover image request to DNB
    return fetch_cover_from_dnb(isbn, size)


if __name__ == '__main__':
    # Initialize the database
    init_db()
    # Start the server
    app.run(host='0.0.0.0', port=5000,
            debug=True)