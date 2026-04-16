"""Flask backend for the book sharing web app.

Provides API endpoints for searching the catalog, retrieving bookshelf information,
inserting and removing books from shelves, and more.
Fetches information about unknown books and book cover images from the DNB
(Deutsche Nationalbibliothek) API.
Stores book and bookshelf information in a local SQLite3 database.
"""
