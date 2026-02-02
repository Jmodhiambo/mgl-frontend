import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env from project root (3 levels up from src/apps/user)
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
        "@user": path.resolve(__dirname, "./"),
      },
    },
    
    server: {
      port: 3000,
      host: true,
      proxy: {
        // Backend API proxy
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8000/api/v1",
          changeOrigin: true,
        },
        
        // // Organizer app proxy (DEVELOPMENT ONLY)
        // "/organizer": {
        //   target: "http://localhost:3001",
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/organizer/, ""),
        //   configure: (proxy) => {
        //     // Forward cookies between apps
        //     proxy.on('proxyReq', (proxyReq, req) => {
        //       if (req.headers.cookie) {
        //         proxyReq.setHeader('cookie', req.headers.cookie);
        //       }
        //     });
        //     proxy.on('proxyRes', (proxyRes, req, res) => {
        //       if (proxyRes.headers['set-cookie']) {
        //         res.setHeader('set-cookie', proxyRes.headers['set-cookie']);
        //       }
        //     });
        //   },
        // },
        
        // // Admin app proxy (DEVELOPMENT ONLY)
        // "/admin": {
        //   target: "http://localhost:3002",
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/admin/, ""),
        //   configure: (proxy) => {
        //     proxy.on('proxyReq', (proxyReq, req) => {
        //       if (req.headers.cookie) {
        //         proxyReq.setHeader('cookie', req.headers.cookie);
        //       }
        //     });
        //     proxy.on('proxyRes', (proxyRes, req, res) => {
        //       if (proxyRes.headers['set-cookie']) {
        //         res.setHeader('set-cookie', proxyRes.headers['set-cookie']);
        //       }
        //     });
        //   },
        // },
      },
    },
    
    // Base path from env
    base: env.VITE_USER_BASE_PATH || '/',
    
    build: {
      outDir: path.resolve(__dirname, "../../../dist/user"),
      emptyOutDir: true,
    },
  };
});