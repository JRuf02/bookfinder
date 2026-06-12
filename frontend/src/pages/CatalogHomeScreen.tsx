import {
  Box,
  Typography,
  Container,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import TextInput from "../components/TextInput";
import logo from "../../graphics/logo-long-no-bg.png";
import { useCallback, useEffect, useMemo, useState } from "react";
import ResultsList from "../components/ResultsList";
import { getUserLocation } from "../services/location";
import { singleTermCatalogSearch } from "../services/catalogSearch";
import { fetchShelfBooks } from "../services/shelfBooks";
import { CatalogResult } from "../types/CatalogResult";
import { Shelf } from "../types/Shelf";
import Checkbox from "@mui/material/Checkbox";
import LocationOffIcon from "@mui/icons-material/LocationOff";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useLocation } from "react-router-dom";
import { useAppState } from "../state/AppStateProvider";

type CatalogNavigationState = {
  initialView?: "search" | "shelf-books" | "single-term-search";
  shelf?: Shelf; // Should only be used if initialView is "shelf-books"
  searchTerm?: string; // Should only be used if initialView is "single-term-search"
};

type SortMode = "relevance" | "distance" | "newest" | "oldest";

function compareTimestampStrings(a?: string, b?: string) {
  if (a === b) {
    return 0;
  }

  // If one timestamp is missing, consider it older than the other
  if (!a) {
    return 1;
  }

  if (!b) {
    return -1;
  }

  return a.localeCompare(b);
}

export default function CatalogHomeScreen() {
  // Optional parameters when navigating to the CatalogHomeScreen:
  // - initialView: If set to "shelf-books", the screen will immediately load books from the provided shelf.
  // - shelf: The shelf to load books from if initialView is "shelf-books".
  // - searchTerm: The search term to use if initialView is "single-term-search".
  const location = useLocation(); // Access navigation state
  const navigationState =
    (location.state as CatalogNavigationState | null) ?? null;
  const shelfFromState = useMemo(() => {
    if (
      navigationState?.initialView === "shelf-books" &&
      navigationState.shelf
    ) {
      return navigationState.shelf;
    }
    return null;
  }, [navigationState]);
  const searchTermFromState = useMemo(() => {
    if (
      navigationState?.initialView === "single-term-search" &&
      navigationState.searchTerm
    ) {
      return navigationState.searchTerm;
    }
    return null;
  }, [navigationState]);

  const [inputTitle, setInputTitle] = useState<string>("");
  const [inputAuthor, setInputAuthor] = useState<string>("");
  const [inputISBN, setInputISBN] = useState<string>("");
  const [useUserLocation, setUseUserLocation] = useState<boolean>(false);
  const [activeShelf, setActiveShelf] = useState<Shelf | null>(shelfFromState);
  const [results, setResults] = useState<CatalogResult[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("relevance");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { state, dispatch } = useAppState();

  const loadBooksFromShelf = useCallback(async (shelf: Shelf) => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const result = await fetchShelfBooks(shelf);

      if (!result.ok) {
        throw new Error(result.error);
      }

      setResults(result.data);
    } catch (err: any) {
      setError(err.message || "Could not fetch shelf books.");
      console.error("Error fetching books from shelf:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSingleTermSearch = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    setResults([]);

    // TODO: check if working:
    // if userCoordinates is in AppState, pass them to the search function to prioritize nearby results
    let userCoords = state.userCoordinates ? state.userCoordinates : null;

    try {
      const result = await singleTermCatalogSearch(searchTerm, userCoords);

      if (!result.ok) {
        throw new Error(result.error);
      }

      setResults(result.data);
      setActiveShelf(null);
    } catch (err: any) {
      setError(err.message || "Could not fetch results.");
      console.error("Error during single-term search:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (shelfFromState) {
      setActiveShelf(shelfFromState);
      void loadBooksFromShelf(shelfFromState);
    } else if (searchTermFromState) {
      void loadSingleTermSearch(searchTermFromState);
    }
  }, [
    loadBooksFromShelf,
    loadSingleTermSearch,
    searchTermFromState,
    shelfFromState,
  ]);

  const handleISBNSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setActiveShelf(null);
      setLoading(true);
      setError(null);
      setResults([]);
      setInputTitle("");
      setInputAuthor("");

      try {
        const isbn = inputISBN.trim();
        if (!isbn) {
          return;
        }

        const currentUserLocation = useUserLocation
          ? await getUserLocation()
          : null;

        // cache user coordinates in global AppState
        if (currentUserLocation) {
          dispatch({
            type: "SET_USER_COORDINATES",
            payload: currentUserLocation,
          });
        }

        const result = await singleTermCatalogSearch(isbn, currentUserLocation);

        if (!result.ok) {
          throw new Error(result.error);
        }

        setResults(result.data);
      } catch (err: any) {
        setError(err.message || "Could not fetch results.");
        console.error("Error during ISBN single-term search:", err);
      } finally {
        setLoading(false);
      }
    },
    [inputISBN, useUserLocation],
  );

  const handleInputSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setActiveShelf(null);
      setLoading(true);
      setError(null);
      setResults([]);
      setInputISBN("");

      try {
        // build query params safely
        const params = new URLSearchParams({
          title: inputTitle,
          author: inputAuthor,
        });

        // only request & send location if toggle is enabled
        if (useUserLocation) {
          const currentUserLocation = await getUserLocation();

          // cache user coordinates in global AppState
          if (currentUserLocation) {
            dispatch({
              type: "SET_USER_COORDINATES",
              payload: currentUserLocation,
            });
          }

          params.append("lat", currentUserLocation.latitude.toString());
          params.append("lon", currentUserLocation.longitude.toString());
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
    [inputTitle, inputAuthor, useUserLocation],
  );

  const hasDistanceData = useMemo(
    () => results.some((result) => result.locatedShelf?.distanceMeters != null),
    [results],
  );

  const sortedResults = useMemo(() => {
    if (sortMode === "relevance") {
      return results;
    }

    return [...results].sort((left, right) => {
      if (sortMode === "distance") {
        const leftDistance = left.locatedShelf?.distanceMeters;
        const rightDistance = right.locatedShelf?.distanceMeters;

        if (leftDistance == null && rightDistance == null) {
          return 0;
        }

        // If only one of the results has distance data, prioritize that one
        // Should not happen (Backend will always return distance if user location is provided)
        if (leftDistance == null) {
          return 1;
        }

        if (rightDistance == null) {
          return -1;
        }

        return leftDistance - rightDistance;
      }

      if (sortMode === "newest") {
        return -compareTimestampStrings(left.inShelfSince, right.inShelfSince);
      }

      return compareTimestampStrings(left.inShelfSince, right.inShelfSince);
    });
  }, [results, sortMode]);

  return (
    // TODO: use mui toggle switch instead of mui checkbox for location?
    // TODO: use uniform styling and layouting for all pages, move styles to global.css / theme.ts!
    <Container
      className="app-container"
      maxWidth={false}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        height: "100%",
        overflow: "hidden",
        maxWidth: "80%", // TODO: make responsive, e.g. max 80% on desktop, 95% on mobile
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
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 0,
        }}
      >
        <TextInput
          value={inputTitle}
          placeholder="Search books by title"
          label="Search books by title"
          onChange={(e) => setInputTitle(e.target.value)}
          onSubmit={handleInputSubmit}
        />
        <TextInput
          value={inputAuthor}
          placeholder="Search books by author"
          label="Search books by author"
          onChange={(e) => setInputAuthor(e.target.value)}
          onSubmit={handleInputSubmit}
        />
      </Box>
      <TextInput
        value={inputISBN}
        placeholder="Search books by ISBN"
        label="Search books by ISBN"
        onChange={(e) => setInputISBN(e.target.value)}
        onSubmit={handleISBNSubmit}
      />
      <Box
        sx={{
          width: "100%",
          maxWidth: "30rem",
          mt: 1,
          display: "flex",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <FormControl size="small">
          <InputLabel id="catalog-sort-label">Sort by</InputLabel>
          <Select
            labelId="catalog-sort-label"
            id="catalog-sort"
            value={sortMode}
            label="Sort by"
            onChange={(event) => setSortMode(event.target.value as SortMode)}
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="distance" disabled={!hasDistanceData}>
              Distance
            </MenuItem>
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          value="end"
          control={
            <Checkbox
              checked={useUserLocation}
              onChange={(e) => setUseUserLocation(e.target.checked)}
              icon={<LocationOffIcon />}
              checkedIcon={<LocationOnIcon />}
            />
          }
          label="Search near me"
          labelPlacement="end"
        />
      </Box>
      {activeShelf && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, mb: 0.5 }}
        >
          Showing books for shelf: {activeShelf.name || activeShelf.osmId}
        </Typography>
      )}
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
        <ResultsList results={sortedResults} />
      </Box>
    </Container>
  );
}
