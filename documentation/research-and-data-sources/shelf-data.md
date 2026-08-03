# Coordinates and metadata of public bookshelves

- To show all bookshelves on the map view, we need their locations
- OpenStreetMap labels them as amenity "public bookcase"
- It is sufficient to fetch all bookshelves once, cache them and only update once a while
- This can be done using [QLever](https://qlever.dev/osm-planet)

## QLever queries for bookshelf data etc.

We use the OpenStreetMap public bookcase amenity.

Germany:
https://qlever.cs.uni-freiburg.de/osm-planet/FG873S

Find all predicates:
https://qlever.cs.uni-freiburg.de/osm-planet/3CtDN7

Reverse geocoding (does not work):
https://qlever.cs.uni-freiburg.de/osm-planet/zJ9akA
