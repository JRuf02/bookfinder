import { Box } from "@mui/material";

import logo from "../../../images/logo-long-no-bg.png";

/** A bar that shows the app's logo */
export default function LogoBar() {
  return (
    <Box
      sx={{
        height: "3.5rem",
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
  );
}
