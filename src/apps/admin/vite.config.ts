import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env from project root (3 levels up from src/apps/admin)
  const env = loadEnv(mode, path.resolve(__dirname, "../../../"), '');

  return {
    // Tell Vite where to look for .env files (project root)
    envDir: path.resolve(__dirname, "../../../"),

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
        "@admin": path.resolve(__dirname, "./"),
      },
    },
    
    server: {
      port: 3002,
      host: true,
      proxy: {
        // Backend API proxy
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8000/api/v1",
          changeOrigin: true,
        },
      },
    },
    
    // Base path from env
    base: env.VITE_ADMIN_BASE_PATH || '/',
    
    build: {
      outDir: path.resolve(__dirname, "../../../dist/admin"),
      emptyOutDir: true,
    },
  };
});