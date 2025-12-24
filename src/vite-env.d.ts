/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // Add other VITE_ prefixed env variables here as are added to the .env file and use them
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}