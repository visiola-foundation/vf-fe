/**
 * Shared helpers for the API resource modules.
 *
 * Each resource documents its HTTP contract above its functions. In UI-only
 * mode (no `VITE_API_BASE_URL`) every `fetch*` derives its payload from the
 * bundled snapshot so the pages render with zero backend; with a backend
 * configured the same functions hit the real paths. Components and query
 * hooks never branch on the mode — they just call these functions.
 */
import type { MisData } from '../../types/mis';
import { isBackendConfigured } from './config';
import { apiRequest } from './client';

const BASE = import.meta.env.BASE_URL ?? '/';

console.log(BASE);

/** Static asset (not a backend resource) — kept beside the API for convenience. */
export const logoUrl = `${BASE}logo.jpg`;

const snapshotUrl = `${BASE}data/mis-dashboard.json`;

let snapshotPromise: Promise<MisData> | null = null;

/** The bundled snapshot, fetched once and shared by every UI-only fallback. */
export function loadSnapshot(signal?: AbortSignal): Promise<MisData> {
  if (!isBackendConfigured) {
    if (!snapshotPromise) {
      snapshotPromise = (async () => {
        const res = await fetch(snapshotUrl, { signal });
        if (!res.ok) {
          snapshotPromise = null;
          throw new Error(`Failed to load dashboard data (HTTP ${res.status})`);
        }
        return (await res.json()) as MisData;
      })();
    }
    return snapshotPromise;
  }
  // Backend mode never uses the snapshot; fetch it uncached so an abort
  // signal on one call cannot poison another.
  return (async () => {
    const res = await fetch(snapshotUrl, { signal });
    if (!res.ok) throw new Error(`Failed to load dashboard data (HTTP ${res.status})`);
    return (await res.json()) as MisData;
  })();
}

/** Append defined params only, so URLs stay clean and cache keys stable. */
export function withParams(path: string, params: object): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
}

/** Backend GET, or `fallback()` derived from the snapshot in UI-only mode. */
export async function getOrFallback<T>(
  path: string,
  init: RequestInit | undefined,
  fallback: (snapshot: MisData) => T | Promise<T>,
): Promise<T> {
  if (isBackendConfigured) {
    return apiRequest<T>(path, init ?? {});
  }
  return fallback(await loadSnapshot(init?.signal ?? undefined));
}
