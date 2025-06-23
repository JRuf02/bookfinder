from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import requests
import xml.etree.ElementTree as ET
import sqlite3
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/books', methods=['GET'])
def get_book():
    isbn = request.args.get('isbn')
    if not isbn:
        return jsonify({"error": "ISBN parameter is required"}), 400

    # Normalize ISBN (remove spaces, dashes, and convert to uppercase)
    isbn = isbn.replace(" ", "").replace("-", "").upper()
    # Remove any non-numeric characters (except for 'X' at the end of ISBN-10)  # TODO write test for this
    isbn = ''.join(filter(lambda x: x.isdigit() or (x == 'X' and len(isbn) == 10 and isbn[-1] == 'X'), isbn))
    print(f"Normalized ISBN: {isbn}")  # TODO: add logger

    # 1. Try to get book from local DB
    book = get_book_from_db(isbn)
    if book:
        print(f"Book found in DB: {book}")  # TODO: add logger
        book_data = {
            "title": book["title"],
            "author": book["author"],
            "dnbISBN": book["dnbISBN"],
            "dnbId": book["dnbId"]
        }
        return jsonify(book_data)
    print(f"Book not found in DB for ISBN: {isbn}")  # Todo: add logger

    # 2. If not found, fetch from DNB and cache it
    book_data = fetch_book_data(isbn)
    print(f"Fetched book data from dnb: {book_data}")  # TODO: add logger
    if book_data["title"] != "Error fetching data":
        cover_url = f"https://portal.dnb.de/opac/mvb/cover?isbn={book_data['dnbISBN']}&size=l"
        save_book_to_db(
            isbn,
            book_data["dnbISBN"],
            book_data["dnbId"],
            book_data["title"],
            book_data["author"],
            cover_url
        )

    return jsonify(book_data)

def fetch_book_data(isbn):  # TODO add class for book data
    url = f'https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query="{isbn}"&recordSchema=MARC21-xml&maximumRecords=1'
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        xml_text = response.text
        root = ET.fromstring(xml_text)
        
        # Extract data from XML
        title = "Unknown Title"
        author = "Unknown Author"
        dnb_isbn = isbn
        dnb_id = ""
        
        # Find record
        record_element = root.find('.//{http://www.loc.gov/MARC21/slim}record')
        
        if record_element is not None:
            # Extract title
            title_field = record_element.find('.//{http://www.loc.gov/MARC21/slim}datafield[@tag="245"]/{http://www.loc.gov/MARC21/slim}subfield[@code="a"]')
            if title_field is not None and title_field.text:
                title = title_field.text
            
            authors = []

            # Author (field 100 sometimes also artist or protagonist)
            main_author_field = record_element.find('.//{http://www.loc.gov/MARC21/slim}datafield[@tag="100"]')
            role = main_author_field.find('.//{http://www.loc.gov/MARC21/slim}subfield[@code="4"]')  # Should be 'aut' for author
            name = main_author_field.find('.//{http://www.loc.gov/MARC21/slim}subfield[@code="a"]')
            if role is not None and 'aut' in role.text.lower() and name is not None:  # TODO ctb contributor adden + error handling
                authors.append(name.text)

            # More authors (sometimes authors are only in field 700)
            for df in record_element.findall('.//{http://www.loc.gov/MARC21/slim}datafield[@tag="700"]'):
                role = df.find('.//{http://www.loc.gov/MARC21/slim}subfield[@code="4"]')
                name = df.find('.//{http://www.loc.gov/MARC21/slim}subfield[@code="a"]')
                if role is not None and 'aut' in role.text.lower() and name is not None:
                    authors.append(name.text)
            
            # author = ', '.join(authors) if authors else "Unknown Author"
            author = authors[0] if authors else "Unknown Author"

            # Extract DNB ISBN
            isbn_field = record_element.find('.//{http://www.loc.gov/MARC21/slim}datafield[@tag="020"]/{http://www.loc.gov/MARC21/slim}subfield[@code="9"]')
            if isbn_field is not None and isbn_field.text:
                dnb_isbn = isbn_field.text
            
            # Extract DNB ID
            id_field = record_element.find('.//{http://www.loc.gov/MARC21/slim}controlfield[@tag="001"]')
            if id_field is not None and id_field.text:
                dnb_id = id_field.text
        
        return {
            "title": title,
            "author": author,
            "dnbISBN": dnb_isbn,
            "dnbId": dnb_id
        }
    except Exception as e:
        print(f"Error fetching book data: {e}")
        return {
            "title": "Error fetching data",
            "author": "",
            "dnbISBN": "",
            "dnbId": ""
        }

@app.route('/api/covers', methods=['GET'])
def get_cover():
    isbn = request.args.get('isbn')
    size = request.args.get('size', 'l')
    
    if not isbn:
        return jsonify({"error": "ISBN parameter is required"}), 400
    
    # Proxy the cover image request to DNB
    cover_url = f'https://portal.dnb.de/opac/mvb/cover?isbn={isbn}&size={size}'
    
    try:
        response = requests.get(cover_url, stream=True)
        
        # Create a Flask response with the image data
        return Response(
            response.content, 
            status=response.status_code,
            content_type=response.headers.get('Content-Type', 'image/jpeg')
        )
    except Exception as e:
        print(f"Error fetching cover: {e}")
        return jsonify({"error": "Failed to fetch cover image"}), 500

def init_db():
    db_path = os.path.join(os.path.dirname(__file__), "books.db")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS books (
            isbn TEXT PRIMARY KEY,
            dnb_isbn TEXT,
            dnb_id TEXT,
            title TEXT,
            author TEXT,
            cover_url TEXT
        )
    """)
    conn.commit()
    conn.close()

def get_book_from_db(isbn):
    db_path = os.path.join(os.path.dirname(__file__), "books.db")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT isbn, dnb_isbn, dnb_id, title, author, cover_url FROM books WHERE isbn = ?", (isbn,))
    row = c.fetchone()
    conn.close()
    if row:
        return {
            "isbn": row[0],
            "dnbISBN": row[1],
            "dnbId": row[2],
            "title": row[3],
            "author": row[4],
            "cover_url": row[5]
        }
    return None

def save_book_to_db(isbn, dnb_isbn, dnb_id, title, author, cover_url):
    db_path = os.path.join(os.path.dirname(__file__), "books.db")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("""
        INSERT OR REPLACE INTO books (isbn, dnb_isbn, dnb_id, title, author, cover_url)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (isbn, dnb_isbn, dnb_id, title, author, cover_url))
    conn.commit()
    conn.close()


if __name__ == '__main__':
    init_db()  # Initialize the database
    # Start the server
    app.run(host='0.0.0.0', port=5000,
            debug=True)