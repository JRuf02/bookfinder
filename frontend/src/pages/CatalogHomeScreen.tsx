import { Box, Typography, Container, CircularProgress } from "@mui/material";
import ISBNInput from "../components/ISBNInput";
import logo from "../../graphics/logo-long-no-bg.png";
import { useCallback, useState } from "react";
import ResultsList from "../components/ResultsList";
import { getUserLocation } from "../services/location";
import { CatalogResult } from "../types/CatalogResult";
import Checkbox from "@mui/material/Checkbox";
import LocationOffIcon from "@mui/icons-material/LocationOff";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FormControlLabel from "@mui/material/FormControlLabel";

export default function CatalogHomeScreen() {
  const [inputTitle, setInputTitle] = useState("");
  const [inputAuthor, setInputAuthor] = useState("");
  const [useLocation, setUseLocation] = useState(false);
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
        // build query params safely
        const params = new URLSearchParams({
          title: inputTitle,
          author: inputAuthor,
        });

        // only request & send location if toggle is enabled
        if (useLocation) {
          const { lat, lon } = await getUserLocation();

          params.append("lat", lat.toString());
          params.append("lon", lon.toString());
        }

        const resp = await fetch(`/api/catalog/search?${params.toString()}`);

        if (!resp.ok) throw new Error("Server error");
        const resp_json = await resp.json();
        setResults(resp_json.data);
      } catch (err: any) {
        setError(err.message || "Could not fetch results.");
        console.error("Error during search:", err);
      } finally {
        setLoading(false);
      }
    },
    [inputTitle, inputAuthor, useLocation],
  );

  return (
    // TODO: sort results by Distance | Newest | Oldest | Relevance (fuzzy score)
    // TODO: use mui toggle switch instead of mui checkbox for location?
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
      Sort by: Distance | Newest | Oldest | Relevance
      <ISBNInput
        value={inputTitle}
        placeholder="Search books near you by title"
        label="Search books near you by title"
        onChange={(e) => setInputTitle(e.target.value)}
        onSubmit={handleInputSubmit}
      />
      <ISBNInput
        value={inputAuthor}
        placeholder="Search books near you by author"
        label="Search books near you by author"
        onChange={(e) => setInputAuthor(e.target.value)}
        onSubmit={handleInputSubmit}
      />
      <FormControlLabel
        value="end"
        control={
          <Checkbox
            checked={useLocation}
            onChange={(e) => setUseLocation(e.target.checked)}
            icon={<LocationOffIcon />}
            checkedIcon={<LocationOnIcon />}
          />
        }
        label="Search near me"
        labelPlacement="end"
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
        <ResultsList results={results} />
      </Box>
    </Container>
  );
}
