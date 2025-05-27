from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import requests
import xml.etree.ElementTree as ET

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/books', methods=['GET'])
def get_book():
    isbn = request.args.get('isbn')
    if not isbn:
        return jsonify({"error": "ISBN parameter is required"}), 400
    
    book_data = fetch_book_data(isbn)
    return jsonify(book_data)

def fetch_book_data(isbn):
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)