/**
 * Backend integration switch.
 *
 * Set `VITE_API_BASE_URL` (see `.env.example`) to point the app at the real MIS
 * backend. While it is empty the app runs in "UI-only" mode and reads the
 * bundled snapshot in `public/data/mis-dashboard.json` instead. No component
 * needs to change when the backend goes live — only this value does.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

export const isBackendConfigured = API_BASE_URL.length > 0;
