import { Box, Button, Card } from "@mui/material";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import SingleSearchBar from "../components/input/SingleSearchBar";
import LogoBar from "../components/layout/LogoBar";
import ShelfMap from "../components/map/ShelfMap";
import { useAppState } from "../state/AppStateProvider";
import { Shelf } from "../types/Shelf";

export default function HomeScreen() {
  const { dispatch } = useAppState();
  const navigate = useNavigate();

  const handleInputSubmit = useCallback(
    (searchTerm: string) => {
      if (!searchTerm) {
        return;
      }

      navigate("/catalog", {
        state: {
          initialView: "single-term-search",
          searchTerm: searchTerm,
        },
      });
    },
    [navigate],
  );

  const navigateToInsert = useCallback((): void => {
    dispatch({ type: "SET_PRESELECTED_SHELF_ACTION", payload: "insert" });
    navigate("/scan");
  }, [dispatch, navigate]);

  const navigateToRemove = useCallback((): void => {
    dispatch({ type: "SET_PRESELECTED_SHELF_ACTION", payload: "remove" });
    navigate("/scan");
  }, [dispatch, navigate]);

  const handleInsert = useCallback(
    (shelf: Shelf): void => {
      dispatch({ type: "SET_SELECTED_SHELF", payload: shelf });
      navigateToInsert();
    },
    [dispatch, navigateToInsert],
  );

  const handleRemove = useCallback(
    (shelf: Shelf): void => {
      dispatch({ type: "SET_SELECTED_SHELF", payload: shelf });
      navigateToRemove();
    },
    [dispatch, navigateToRemove],
  );

  const handleShowBooks = useCallback(
    (shelf: Shelf): void => {
      dispatch({ type: "SET_SELECTED_SHELF", payload: shelf });
      navigate("/catalog", {
        state: {
          initialView: "shelf-books",
          shelf,
        },
      });
    },
    [dispatch, navigate],
  );

  const CONTENT_MAX_WIDTH = "25rem";

  return (
    <Box className="app-container">
      {/* Logo Bar */}
      <LogoBar />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: CONTENT_MAX_WIDTH,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-evenly",
          px: "0.5rem",
          gap: "0.1rem",
          pb: "0.35rem",
        }}
      >
        {/* Search Input */}
        <SingleSearchBar onSubmit={handleInputSubmit} />

        {/* Map View Placeholder (flex-grow) */}
        <Card
          sx={{
            flex: 1,
            minHeight: "72%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            bgcolor: "#e3eafc",
            color: "#1976d2",
            fontSize: "1.5rem",
            fontWeight: 500,
            letterSpacing: 1,
          }}
        >
          <ShelfMap
            showSelect={false}
            showInsert={true}
            showRemove={true}
            showShowBooks={true}
            onInsert={handleInsert}
            onRemove={handleRemove}
            onShowBooks={handleShowBooks}
          />
        </Card>

        {/* Insert Book Button */}
        <Button
          variant="contained"
          color="primary"
          sx={{
            flex: 1,
            minHeight: "1.75rem",
            width: "100%",
            fontSize: "1rem",
            borderRadius: 1,
            mt: "0.25rem",
          }}
          onClick={navigateToInsert}
        >
          Insert Book
        </Button>

        {/* Remove Book Button */}
        <Button
          variant="contained"
          color="secondary"
          sx={{
            flex: 1,
            minHeight: "1.75rem",
            width: "100%",
            fontSize: "1rem",
            borderRadius: 1,
            mt: "0.25rem",
          }}
          onClick={navigateToRemove}
        >
          Remove Book
        </Button>
      </Box>
    </Box>
  );
}
