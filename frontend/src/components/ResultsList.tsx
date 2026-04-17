import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import logo from "../../graphics/logo-long-no-bg.png";

type Result = {
  osm_id: string;
  title: string;
  author: string;
  shelf_name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  dnb_isbn?: string;
  address?: string;
  opening_hours?: string;
  [key: string]: any;
};

type ResultsListProps = {
  results: Result[];
  fields?: string[];
};

export default function ResultsList({
  results,
  fields = [],
}: ResultsListProps) {
  return (
    <>
      {results.map((result) => (
        <Card key={result.osm_id + result.title} sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <CardMedia
                component="img"
                image={
                  result.dnb_isbn
                    ? `/api/covers?dnb_isbn=${result.dnb_isbn}&size=m`
                    : logo
                }
                alt={`Cover of ${result.title}`}
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
                <Typography variant="h6">{result.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  by {result.author}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Shelf: {result.shelf_name || "Unknown"}
                </Typography>
                <Typography variant="body2">
                  Distance: {result.distance_km.toFixed(2)} km
                </Typography>
                {fields.map(
                  (field) =>
                    result[field] /* only render if field exists in data */ && (
                      <Typography variant="body2" key={field}>
                        {field.charAt(0).toUpperCase() + field.slice(1)}:{" "}
                        {result[field]}
                      </Typography>
                    ),
                )}
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
