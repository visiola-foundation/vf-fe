/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the MIS backend (e.g. https://api.example.org/v1).
   * Leave empty to run the UI against the bundled snapshot in
   * `public/data/mis-dashboard.json` ("UI-only" mode).
   */
  readonly VITE_API_BASE_URL?: string;

  /**
   * Set to true to bypass the login wall while testing backend routes.
   * The app will still hit the configured backend without a session token.
   */
  readonly VITE_SKIP_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
