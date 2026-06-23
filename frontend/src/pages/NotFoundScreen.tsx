import { Box, Container, Typography } from "@mui/material";

import logo from "../../graphics/logo-long-no-bg.png";

export default function NotFoundScreen() {
  return (
    <Container
      className="app-container"
      maxWidth={false}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
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
        This page does not exist
      </Typography>
    </Container>
  );
}
