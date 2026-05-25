import { useState, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card } from "@mui/material";
import TextInput from "../components/TextInput";
import logo from "../../graphics/logo-long-no-bg.png";
import ShelfMap from "../components/map/ShelfMap";
import { Shelf } from "../types/Shelf";
import { useAppState } from "../state/AppStateProvider";

export default function HomeScreen() {
  const [inputSearchTerm, setInputSearchTerm] = useState("");
  const { dispatch } = useAppState();
  const navigate = useNavigate();

  const handleInputSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      const searchTerm = inputSearchTerm.trim();
      if (!searchTerm) {
        return;
      }

      navigate("/catalog", {
        state: {
          initialView: "single-term-search",
          searchTerm,
        },
      });
    },
    [inputSearchTerm, navigate],
  );

  const navigateToInsert = (): void => {
    dispatch({ type: "SET_PRESELECTED_SHELF_ACTION", payload: "insert" });
    navigate("/scan");
  };

  const navigateToRemove = (): void => {
    dispatch({ type: "SET_PRESELECTED_SHELF_ACTION", payload: "remove" });
    navigate("/scan");
  };

  const handleInsert = (shelf: Shelf): void => {
    dispatch({ type: "SET_SELECTED_SHELF", payload: shelf });
    navigateToInsert();
  };

  const handleRemove = (shelf: Shelf): void => {
    dispatch({ type: "SET_SELECTED_SHELF", payload: shelf });
    navigateToRemove();
  };

  const handleShowBooks = (shelf: Shelf): void => {
    dispatch({ type: "SET_SELECTED_SHELF", payload: shelf });
    navigate("/catalog", {
      state: {
        initialView: "shelf-books",
        shelf,
      },
    });
  };

  const LOGO_BAR_HEIGHT = "3.5rem";
  const CONTENT_MAX_WIDTH = "25rem";

  return (
    <Box className="app-container">
      {/* Logo Bar */}
      <Box
        sx={{
          height: LOGO_BAR_HEIGHT,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <img
          src={logo}
          alt="bookFinder logo"
          style={{
            maxHeight: "3rem",
            maxWidth: "50vw",
            objectFit: "contain",
          }}
        />
      </Box>

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
          px: "1rem",
          gap: "0.5rem",
          pb: "0.5rem",
        }}
      >
        {/* Search Input */}
        <TextInput
          value={inputSearchTerm}
          placeholder="Search book by title, author, or ISBN"
          label="Search book by title, author, or ISBN"
          onChange={(e) => setInputSearchTerm(e.target.value)}
          onSubmit={handleInputSubmit}
        />

        {/* Map View Placeholder (flex-grow) */}
        <Card
          sx={{
            flex: 1,
            minHeight: "60%",
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
            fontSize: "1.25rem",
            borderRadius: 3,
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
            fontSize: "1.25rem",
            borderRadius: 3,
          }}
          onClick={navigateToRemove}
        >
          Remove Book
        </Button>
      </Box>
    </Box>
  );
}
