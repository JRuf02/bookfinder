import { useState, useCallback } from "react";
import { Box, Container, Button, Card } from "@mui/material";
import ISBNInput from "../components/ISBNInput";
import logo from "../graphics/logo-long-no-bg.png";

export default function HomeScreen() {
  const [inputIsbn, setInputIsbn] = useState("");

  const handleInputSubmit = useCallback(() => {
    // todo: Handle the ISBN input submission
  }, [inputIsbn]);

  // Height constants
  const LOGO_BAR_HEIGHT = 56; // px
  const NAV_BAR_HEIGHT = 56;

  // Todo? Use AppContainer for global css?
  return (
    <Box
      sx={{
        minHeight: `100dvh`,
        minWidth: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Logo Bar */}
      <Box
        sx={{
          height: `${LOGO_BAR_HEIGHT}px`,
          width: "100vw",
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
            maxHeight: LOGO_BAR_HEIGHT - 8,
            maxWidth: "40vw",
            objectFit: "contain",
          }}
        />
      </Box>

      {/* Main Grid */}
      <Box
        sx={{
          flex: 1,
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-evenly",
          px: 2,
          pb: `${NAV_BAR_HEIGHT}px`, // leave space for nav bar
          boxSizing: "border-box",
        }}
      >
        {/* Search Input */}
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <ISBNInput
            value={inputIsbn}
            placeholder="Search book by title, author, or ISBN"
            onChange={(e) => setInputIsbn(e.target.value)}
            onSubmit={handleInputSubmit}
          />
        </Box>

        {/* Map View Placeholder */}
        <Card
          sx={{
            width: "100%",
            maxWidth: 400,
            height: 180,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            my: 2,
            borderRadius: 4,
            bgcolor: "#e3eafc",
            color: "#1976d2",
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: 1,
          }}
        >
          Map View
        </Card>

        {/* Insert Book Button */}
        <Button
          variant="contained"
          color="primary"
          sx={{
            width: "100%",
            maxWidth: 400,
            height: 56,
            fontSize: 20,
            borderRadius: 3,
            mb: 1,
          }}
        >
          Insert Book
        </Button>

        {/* Remove Book Button */}
        <Button
          variant="contained"
          color="secondary"
          sx={{
            width: "100%",
            maxWidth: 400,
            height: 56,
            fontSize: 20,
            borderRadius: 3,
          }}
        >
          Remove Book
        </Button>
      </Box>
    </Box>
  );
}
