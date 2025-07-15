import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Stack,
} from "@mui/material";
import ISBNInput from "../components/ISBNInput";
import logo from "../../graphics/logo-long-no-bg.png";
import { useCallback, useState } from "react";

type CatalogResult = {
  osm_id: string;
  title: string;
  author: string;
  shelf_name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  dnb_isbn?: string; // Add if available from backend
};

export default function CatalogHomeScreen() {
  const [inputTitle, setInputTitle] = useState("");
  const [results, setResults] = useState<CatalogResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setResults([]);

      // Get user location  TODO: MOVE TO SERVICES
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          try {
            const resp = await fetch(
              `/api/catalog/search?title=${encodeURIComponent(
                inputTitle
              )}&lat=${lat}&lon=${lon}`
            );
            if (!resp.ok) throw new Error("Server error");
            const data = await resp.json();
            // Sort by distance
            data.sort(
              (a: CatalogResult, b: CatalogResult) =>
                a.distance_km - b.distance_km
            );
            setResults(data);
          } catch (err: any) {
            setError("Could not fetch results.");
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError("Could not get your location.");
          setLoading(false);
        }
      );
    },
    [inputTitle]
  );

  return (
    // TODO: use uniform styling and layouting for all pages, move styles to css!
    <Container
      className="app-container"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          mt: 2,
          mb: 2,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img
          src={logo}
          alt="bookFinder logo"
          style={{
            maxWidth: "40%",
            height: "auto",
            maxHeight: 120,
            objectFit: "contain",
          }}
        />
      </Box>
      <ISBNInput
        value={inputTitle}
        placeholder="Search books near you by title"
        onChange={(e) => setInputTitle(e.target.value)}
        onSubmit={handleInputSubmit}
      />
      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: "30rem",
          overflowY: "auto",
          mt: 2,
          pb: 2,
        }}
      >
        {results.map((result) => (
          <Card key={result.osm_id + result.title} sx={{ mb: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CardMedia
                  component="img"
                  image={
                    result.dnb_isbn
                      ? `/api/covers?isbn=${result.dnb_isbn}&size=m`
                      : "/api/covers?isbn=0000000000&size=m" // TODO: delete line or create fallback cover in db
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
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {results.length === 0 && !loading && !error && (
          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            No results yet. Search for a book title!
          </Typography>
        )}
      </Box>
    </Container>
  );
}
