import { Box, Typography, Container } from "@mui/material";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import logo from "../../graphics/logo-long-no-bg.png";

export default function NotFoundScreen() {
  return (
    <Container
      className="app-container"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "50%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>

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
