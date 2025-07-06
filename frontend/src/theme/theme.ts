import { createTheme } from "@mui/material/styles";

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
