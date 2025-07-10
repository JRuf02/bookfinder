import { Box, Typography, Container } from "@mui/material";
import logo from "../../graphics/logo-long-no-bg.png";

export default function NotFoundScreen() {
  return (
    <Container
      className="app-container"
      maxWidth={false}
      disableGutters
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        minWidth: "100vw",
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
            maxWidth: "90%",
            height: "auto",
            maxHeight: 120,
            objectFit: "contain",
          }}
        />
      </Box>
      <Typography variant="body1" sx={{ p: 2, textAlign: "center" }}>
        404: This page does not exist
      </Typography>
    </Container>
  );
}
