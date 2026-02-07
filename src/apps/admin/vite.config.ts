import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../../../"), '');

  return {
    root: path.resolve(__dirname),
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
      https: {
        key: fs.readFileSync(path.resolve(__dirname, "../../../certs/key.pem")),
        cert: fs.readFileSync(path.resolve(__dirname, "../../../certs/cert.pem")),
      },
      allowedHosts: ['.local'],
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "https://api.mgltickets.local:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    
    base: '/',
    
    build: {
      outDir: path.resolve(__dirname, "../../../dist/admin"),
      emptyOutDir: true,
    },
  };
});