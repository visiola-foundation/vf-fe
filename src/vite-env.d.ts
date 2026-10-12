/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the MIS backend (e.g. https://api.example.org/v1).
   * Leave empty to run the UI against the bundled snapshot in
   * `public/data/mis-dashboard.json` ("UI-only" mode).
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
