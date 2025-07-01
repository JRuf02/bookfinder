import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Define __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow access from other devices on the network
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "../certs/key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "../certs/cert.pem")),
    },
    watch: {
      ignored: [
        "**/node_modules/**",
        "**/.venv/**",
        "../server/**",
        "../.venv/**",
      ],
      usePolling: true, // Needed for hot module reload on alpine linux
      interval: 100, // Optional: check every 100ms
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
