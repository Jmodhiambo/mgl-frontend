import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  cacheDir: "../../../node_modules/.vite",
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../../shared"),
      "@organizer": path.resolve(__dirname, "."),
    },
  },
  server: {
    port: 3001,
    host: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "../../../dist/organizer",
    emptyOutDir: true,
  },
});