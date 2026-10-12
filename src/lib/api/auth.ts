/**
 * Auth resource.
 *
 * UI-only mode (no `VITE_API_BASE_URL`): demo sign-in against three built-in
 * personas, so the login page, role menus and guards can all be exercised
 * with no backend. With a backend configured these same functions hit the
 * real endpoints — no component changes needed.
 *
 * Expected backend contract (suggested):
 *   POST /auth/login  { email, password } -> { token, user: { email, name, role } }
 *   GET  /auth/me                           -> { email, name, role } (Bearer token)
 *   POST /auth/logout                       -> 204 (best-effort on sign-out)
 */
import type { AuthUser, LoginInput } from '../../types/auth';
import { isRole, roleLabel, type Role } from '../access';
import { isBackendConfigured } from './config';
import { ApiError, apiRequest, setAuthToken } from './client';

const SESSION_KEY = 'vf-mis.session';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Demo directory used only while there is no backend. */
const DEMO_USERS: Record<Role, { email: string; name: string }> = {
  admin: { email: 'key.staff@visiola.local', name: 'Key staff (demo)' },
  staff: { email: 'programme.staff@visiola.local', name: 'Programme staff (demo)' },
  board: { email: 'board@visiola.local', name: 'Board member (demo)' },
};

export function demoUserFor(role: Role): AuthUser {
  const d = DEMO_USERS[role];
  return { email: d.email, name: d.name, role };
}

export function demoEmailFor(role: Role): string {
  return DEMO_USERS[role].email;
}

function readStoredSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (typeof parsed.email === 'string' && isRole(parsed.role)) {
      return {
        email: parsed.email,
        name: typeof parsed.name === 'string' ? parsed.name : parsed.email,
        role: parsed.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function writeStoredSession(user: AuthUser | null) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable — session still lives in the query cache */
  }
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

/**
 * Sign in. UI-only: accepts any password (min 1 char) for one of the demo
 * emails, or an explicit demo role from the login form. Backend: the server
 * decides the role from the credentials — the client never assigns it.
 */
export async function login(input: LoginInput, demoRole?: Role): Promise<AuthUser> {
  const email = input.email.trim();
  if (!email || !input.password) {
    throw new ApiError('Enter your email and password.', 400);
  }

  if (!isBackendConfigured) {
    await delay(600); // keep the loading state honest in demos
    if (demoRole) {
      const user: AuthUser = { ...demoUserFor(demoRole), email };
      writeStoredSession(user);
      return user;
    }
    const match = (Object.keys(DEMO_USERS) as Role[]).find(
      (r) => DEMO_USERS[r].email.toLowerCase() === email.toLowerCase(),
    );
    if (!match) {
      throw new ApiError(
        'Unknown demo account. Use one of the demo emails shown on this page.',
        401,
      );
    }
    const user: AuthUser = { ...demoUserFor(match), email };
    writeStoredSession(user);
    return user;
  }

  const res = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: input.password }),
  });
  if (!isRole(res.user?.role)) {
    throw new ApiError('The server returned an unknown role.', 500);
  }
  setAuthToken(res.token);
  writeStoredSession(res.user);
  return res.user;
}

/**
 * Restore the session on load. UI-only: the stored demo user. Backend: the
 * stored user, revalidated against `GET /auth/me` when a token exists.
 */
export async function restoreSession(): Promise<AuthUser | null> {
  const stored = readStoredSession();
  if (!isBackendConfigured) return stored;
  if (!stored) return null;
  try {
    const me = await apiRequest<AuthUser>('/auth/me');
    if (!isRole(me?.role)) return null;
    writeStoredSession(me);
    return me;
  } catch {
    return null;
  }
}

/** Sign out: tell the server (best-effort), then drop token + stored session. */
export async function logout(): Promise<void> {
  if (isBackendConfigured) {
    try {
      await apiRequest<void>('/auth/logout', { method: 'POST' });
    } catch {
      /* signing out locally is what matters — a dead token is harmless */
    }
  }
  setAuthToken(null);
  writeStoredSession(null);
}

export function sessionRoleLabel(user: AuthUser): string {
  return `${user.name} · ${roleLabel(user.role)}`;
}
