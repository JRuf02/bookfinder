import { createTheme } from "@mui/material/styles";

// Applies globally to all MUI components (see main.tsx)
// TODO: use e.g. https://coolors.co/848c8e-c82828-435058-76c93a-6d9c57-646e73-373737
const theme = createTheme({
  palette: {
    primary: {
      main: "#4caf50", // Green color for primary actions
    },
    secondary: {
      main: "#f44336", // Red for destructive actions
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: "none",
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
  },
});

export default theme;
