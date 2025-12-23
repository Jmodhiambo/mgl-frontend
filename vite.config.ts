import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  cacheDir: "./node_modules/.vite",
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "src/shared"),
      "@user": path.resolve(__dirname, "src/apps/user"),
      "@organizer": path.resolve(__dirname, "src/apps/organizer"),
      "@admin": path.resolve(__dirname, "src/apps/admin"),
    },
  },
});
