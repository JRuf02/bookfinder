import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ShelfSelect from "../components/ShelfSelect";
import logo from "../../graphics/logo-long-no-bg.png";

export default function ShelfSelectScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { returnTo } = location.state || { returnTo: "/scan" };

  const handleShelfSelect = (osmId: string) => {
    // Navigate back to the returnTo path with the selected shelf ID
    navigate(returnTo, {
      state: {
        selectedShelfId: osmId,
        // Pass along any other state that might have been passed to this screen
        ...location.state,
      },
    });
  };

  const handleCancel = () => {
    navigate(returnTo, { state: { ...location.state } });
  };

  return (
    <Container className="app-container">
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            pt: 1,
            pb: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={logo}
            alt="bookFinder logo"
            style={{
              maxHeight: "2.5rem",
              maxWidth: "40%",
              objectFit: "contain",
            }}
          />
          <Typography variant="h6" sx={{ mt: 1 }}>
            Select a Bookshelf
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tap on a marker to see details and select a shelf
          </Typography>
        </Box>

        {/* Map Container - takes most of the space */}
        <Box
          sx={{
            flex: 1,
            width: "100%",
            border: "1px solid #ddd",
            borderRadius: 1,
            overflow: "hidden",
            mb: 1,
          }}
        >
          <ShelfSelect
            onSelect={handleShelfSelect}
            useNearbyOnly={true}
            radius={10000}
          />
        </Box>

        {/* Cancel Button */}
        <Button variant="outlined" onClick={handleCancel} sx={{ mb: 2 }}>
          Cancel
        </Button>
      </Box>
    </Container>
  );
}
