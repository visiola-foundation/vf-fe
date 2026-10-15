/**
 * Backend integration switch.
 *
 * Set `VITE_API_BASE_URL` (see `.env.example`) to point the app at the real MIS
 * backend. While it is empty the app runs in "UI-only" mode and reads the
 * bundled snapshot in `public/data/mis-dashboard.json` instead. No component
 * needs to change when the backend goes live — only this value does.
 *
 * `VITE_SKIP_AUTH=true` disables the sign-in gate so you can exercise the
 * non-authenticated backend routes during local testing without logging in.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

export const isBackendConfigured = API_BASE_URL.length > 0;
export const SKIP_AUTH = ['1', 'true', 'yes'].includes(
  (import.meta.env.VITE_SKIP_AUTH ?? '').toLowerCase(),
);
export const isAuthRequired = isBackendConfigured && !SKIP_AUTH;
