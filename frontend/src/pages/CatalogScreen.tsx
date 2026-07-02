import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  CircularProgress,
  Container,
  IconButton,
  Typography,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import CatalogSearchForm, {
  SearchFormState,
} from "../components/catalog/CatalogSearchForm";
import CurrentShelfInfo from "../components/catalog/CurrentShelfInfo";
import ResultsList from "../components/catalog/ResultsList";
import LogoBar from "../components/layout/LogoBar";
import {
  singleTermCatalogSearch,
  titleAuthorCatalogSearch,
} from "../services/api/catalogSearch";
import { fetchShelfBooks } from "../services/api/shelfBooks";
import { getCatalogNavigationTargets } from "../services/catalogNavigation";
import { getAndCacheUserLocation } from "../services/location";
import { sortCatalogResults } from "../services/sorting";
import { useAppState } from "../state/AppStateProvider";
import { CatalogResult } from "../types/CatalogResult";
import { unwrapResult } from "../types/Result";
import { Shelf } from "../types/Shelf";

/**
 * Main catalog screen where users can search for books or view books on a specific shelf.
 * Supports optional navigation state to immediately show search results or shelf books when navigating to this screen.
 *
 * Options for navigation state:
 * - initialView: If set to "shelf-books", the screen will immediately load all books from the provided shelf.
 *                If set to "single-term-search", the screen will immediately perform a search with the provided searchTerm.
 * - shelf: The shelf to load books from if initialView is "shelf-books".
 * - searchTerm: The search term to use if initialView is "single-term-search".
 */
export default function CatalogScreen() {
  const location = useLocation(); // Access navigation state
  const { shelfFromState, searchTermFromState } = getCatalogNavigationTargets(
    location.state,
  );

  const [searchFormState, setSearchFormState] = useState<SearchFormState>({
    title: "",
    author: "",
    isbn: "",
    sortMode: "relevance",
    useUserLocation: false,
  });
  const [activeShelf, setActiveShelf] = useState<Shelf | null>(shelfFromState);
  const [results, setResults] = useState<CatalogResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearchForm, setShowSearchForm] = useState<boolean>(
    activeShelf === null,
  );
  const [showShelfInfo, setShowShelfInfo] = useState<boolean>(true);
  const { state, dispatch } = useAppState();

  const loadBooksFromShelf = useCallback(async (shelf: Shelf) => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const data = unwrapResult(await fetchShelfBooks(shelf));
      setResults(data);
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

    // if userCoordinates is in AppState, pass them to the search function to prioritize nearby results
    const userCoords = state.userCoordinates ? state.userCoordinates : null;

    try {
      const result = await singleTermCatalogSearch(searchTerm, userCoords);

      if (!result.ok) {
        throw new Error(result.error);
      }

      setResults(result.data);
      setActiveShelf(null);
    } catch (err: any) {
      setError(
        err.message || "Could not fetch results. Please try again later.",
      );
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

  /** Programmatically start a single-term search for the content of the ISBN input field */
  const performSingleTermSearch = useCallback(async () => {
    setActiveShelf(null);
    setLoading(true);
    setError(null);
    setResults([]);
    setSearchFormState((prev) => ({ ...prev, title: "" }));
    setSearchFormState((prev) => ({ ...prev, author: "" }));

    try {
      const isbn = searchFormState.isbn.trim();
      if (!isbn) {
        return;
      }

      const currentUserLocation = searchFormState.useUserLocation
        ? await getAndCacheUserLocation(dispatch)
        : null;

      const data = unwrapResult(
        await singleTermCatalogSearch(isbn, currentUserLocation),
      );

      setResults(data);
    } catch (err: any) {
      setError(
        err.message || "Could not fetch results. Please try again later.",
      );
      console.error("Error during ISBN single-term search:", err);
    } finally {
      setLoading(false);
    }
  }, [searchFormState.isbn, searchFormState.useUserLocation]);

  /** Start a single-term search when the ISBN form is submitted */
  const handleISBNSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await performSingleTermSearch();
    },
    [performSingleTermSearch],
  );

  /** Programmatically start a standard search */
  const performTitleAuthorSearch = useCallback(async () => {
    setActiveShelf(null);
    setLoading(true);
    setError(null);
    setResults([]);
    setSearchFormState((prev) => ({ ...prev, isbn: "" }));

    // TODO: Remove code duplication with performSingleTermSearch
    try {
      // only request & send location if toggle is enabled
      const currentUserLocation = searchFormState.useUserLocation
        ? await getAndCacheUserLocation(dispatch)
        : null;

      const results = unwrapResult(
        await titleAuthorCatalogSearch(
          searchFormState.title,
          searchFormState.author,
          currentUserLocation,
        ),
      );

      setResults(results);
    } catch (err: any) {
      setError(
        err.message || "Could not fetch results. Please try again later.",
      );
      console.error("Error during search:", err);
    } finally {
      setLoading(false);
    }
  }, [
    searchFormState.title,
    searchFormState.author,
    searchFormState.useUserLocation,
  ]);

  /** Start a title and author search when the form is submitted */
  const handleTitleAuthorSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await performTitleAuthorSearch();
    },
    [performTitleAuthorSearch],
  );

  /** Check if (any of) the results have distance data */
  const hasDistanceData: boolean = useMemo(
    () => results.some((result) => result.locatedShelf?.distanceMeters != null),
    [results],
  );

  const sortedResults: CatalogResult[] = useMemo(
    () => sortCatalogResults(results, searchFormState.sortMode),
    [results, searchFormState.sortMode],
  );

  return (
    // TODO: use uniform styling and layouting for all pages, move styles to global.css / theme.ts!
    <Container className="app-container" maxWidth={false}>
      <LogoBar />

      <Collapse in={showSearchForm}>
        <CatalogSearchForm
          hasDistanceData={hasDistanceData}
          searchFormState={searchFormState}
          setSearchFormState={setSearchFormState}
          handleTitleAuthorSubmit={handleTitleAuthorSubmit}
          handleISBNSubmit={handleISBNSubmit}
        />
      </Collapse>

      <IconButton
        sx={{ py: 0 }}
        aria-label="Show / hide search form"
        onClick={() => setShowSearchForm((prev) => !prev)}
      >
        {showSearchForm ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </IconButton>

      <Collapse in={showShelfInfo && activeShelf !== null}>
        {activeShelf && (
          <CurrentShelfInfo
            activeShelf={activeShelf}
            onClose={() => setShowShelfInfo(false)}
          />
        )}
      </Collapse>

      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <ResultsList results={sortedResults} />
    </Container>
  );
}
