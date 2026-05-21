import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import logo from "../../graphics/logo-long-no-bg.png";
import { CatalogResult } from "../types/CatalogResult";

type ResultsListProps = {
  results: CatalogResult[];
};

export default function ResultsList({ results }: ResultsListProps) {
  return (
    <>
      {results.map((result) => (
        <Card key={result.entityId} sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <CardMedia
                component="img"
                image={
                  result.book.isbn
                    ? `/api/cover?isbn=${result.book.isbn}&size=m`
                    : logo
                }
                alt={`Cover of ${result.book.title}`}
                sx={{
                  width: 80,
                  height: 120,
                  objectFit: "cover",
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  mr: 2,
                }}
                onError={(e) => {
                  // Fallback image if cover not available
                  // TODO: Create a better image for missing covers
                  (e.target as HTMLImageElement).src = logo;
                }}
              />
              <Box>
                <Typography variant="h6">{result.book.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  by {result.book.author}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.book.isbn || "Unknown"}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Shelf: {result.locatedShelf?.shelf.name || "Unknown"}
                </Typography>
                <Typography variant="body2">
                  Distance:{" "}
                  {result.locatedShelf?.distanceMeters?.toFixed(2) || "Unknown"}{" "}
                  m
                </Typography>
                {result.locatedShelf?.shelf.type && (
                  <Typography variant="body2">
                    Type: {result.locatedShelf.shelf.type}
                  </Typography>
                )}
                {result.locatedShelf?.shelf.address && (
                  <Typography variant="body2">
                    Address: {result.locatedShelf.shelf.address}
                  </Typography>
                )}
                {result.locatedShelf?.shelf.operator && (
                  <Typography variant="body2">
                    Operator: {result.locatedShelf.shelf.operator}
                  </Typography>
                )}
                {result.locatedShelf?.shelf.openingHours && (
                  <Typography variant="body2">
                    Opening Hours: {result.locatedShelf.shelf.openingHours}
                  </Typography>
                )}
                {result.locatedShelf?.shelf.website && (
                  <Typography variant="body2">
                    Website: {result.locatedShelf.shelf.website}
                  </Typography>
                )}
                {result.locatedShelf?.shelf.osmId && (
                  <Typography variant="body2">
                    OSM ID: {result.locatedShelf.shelf.osmId}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  In shelf since: {result.inShelfSince}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
      {results.length === 0 && (
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          No results yet. Search for a book title!
        </Typography>
      )}
    </>
  );
}
