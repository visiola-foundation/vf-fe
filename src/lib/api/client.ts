import { API_BASE_URL } from './config';

/**
 * Token store. Memory-first, mirrored to localStorage so a refresh keeps the
 * session. The backend only ever sees it via the `Authorization` header that
 * `apiRequest()` attaches — components never touch the token directly.
 */
const TOKEN_KEY = 'vf-mis.token';

let memoryToken: string | null = null;

export function setAuthToken(token: string | null) {
  memoryToken = token;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable (private mode) — memory still works for the session */
  }
}

export function getAuthToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    memoryToken = localStorage.getItem(TOKEN_KEY);
  } catch {
    memoryToken = null;
  }
  return memoryToken;
}

/** A failed HTTP request, keeping the status so callers can react to it. */
export class ApiError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Thin `fetch` wrapper for the backend. Prefixes the configured base URL,
 * attaches the session token when one exists, and normalises error handling /
 * JSON parsing. Swap or extend this one function (refresh tokens,
 * interceptors…) and every resource follows.
 */
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError('No backend is configured (VITE_API_BASE_URL is empty).');
  }

  const token = getAuthToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (res.status === 401) {
    // Session is dead server-side: drop the local copy so the router
    // sends the user back to /login instead of looping on 401s.
    setAuthToken(null);
    throw new ApiError('Your session has expired. Please sign in again.', 401);
  }

  if (!res.ok) {
    let detail = '';
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message) detail = `: ${body.message}`;
    } catch {
      /* non-JSON error body — fall through to the generic message */
    }
    throw new ApiError(`Request to ${path} failed${detail}`, res.status);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

