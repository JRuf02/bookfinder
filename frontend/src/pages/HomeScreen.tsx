import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Typography, Button, Container, Stack } from "@mui/material";

export default function HomeScreen() {
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
      <Typography variant="h4" sx={{ mb: 2 }}>
        Homepage of bookFinder
      </Typography>
    </Container>
  );
}
