import { Box, Typography, Container, CircularProgress } from "@mui/material";
import ISBNInput from "../components/ISBNInput";
import logo from "../../graphics/logo-long-no-bg.png";
import { useCallback, useState } from "react";
import ResultsList from "../components/ResultsList";
import { getUserLocation } from "../services/location";

type CatalogResult = {
  osm_id: string;
  title: string;
  author: string;
  shelf_name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  address?: string;
  opening_hours?: string;
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

      try {
        const { lat, lon } = await getUserLocation();
        const resp = await fetch(
          `/api/catalog/search?title=${encodeURIComponent(
            inputTitle,
          )}&lat=${lat}&lon=${lon}`,
        );
        if (!resp.ok) throw new Error("Server error");
        const data = await resp.json();
        // Sort results by distance
        data.sort(
          (a: CatalogResult, b: CatalogResult) => a.distance_km - b.distance_km,
        );
        setResults(data);
      } catch (err: any) {
        setError(err.message || "Could not fetch results.");
      } finally {
        setLoading(false);
      }
    },
    [inputTitle],
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
        label="Search books near you by title"
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
        <ResultsList
          results={results}
          fields={[
            "type",
            "address",
            "operator",
            "opening_hours",
            "website",
            "osm_id",
          ]}
        />
      </Box>
    </Container>
  );
}
