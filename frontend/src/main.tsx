import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import theme from "./theme/theme";
import { ShelfProvider } from "./context/ShelfContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ShelfProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ShelfProvider>
  </React.StrictMode>
);
