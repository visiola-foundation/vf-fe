import { Navigate, useLocation } from 'react-router-dom';
import { logoUrl } from '../lib/api';
import { SKIP_AUTH } from '../lib/api/config';
import { useSession } from '../queries/useSession';

/** While the session restores: branded splash with a progress bar. */
export function SessionSplash() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4"
    >
      <span className="sr-only">Restoring your session…</span>
      <img src={logoUrl} alt="" aria-hidden className="block h-12 w-auto" />
      <div aria-hidden className="h-0.5 w-40 overflow-hidden rounded-full bg-line">
        <div className="h-full w-1/4 animate-[fetch-bar_1.1s_ease-in-out_infinite] bg-vf-blue" />
      </div>
    </div>
  );
}

/** Signed-out users go to /login (remembering where they were headed). */
export function RequireAuth({ children }: { children: JSX.Element }) {
  const session = useSession();
  const location = useLocation();

  if (SKIP_AUTH) return children;
  if (session.isLoading) return <SessionSplash />;
  if (!session.data) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    );
  }
  return children;
}
