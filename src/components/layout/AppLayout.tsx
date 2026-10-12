import type { ComponentType } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import type { MisData } from '../../types/mis';
import { canAccess, firstAllowedPage, isPage, roleLabel, type PageId } from '../../lib/access';
import { useMisData } from '../../queries/useMisData';
import { useLogout, useSession } from '../../queries/useSession';
import { TopBar } from './TopBar';
import { Rail } from './Rail';
import { Footer } from './Footer';
import { ErrorPanel, PageSkeleton } from '../ui/skeleton';
import { Overview } from '../../pages/Overview';
import { Reach } from '../../pages/Reach';
import { Ascg } from '../../pages/Ascg';
import { Cbc } from '../../pages/Cbc';
import { Prog3 } from '../../pages/Prog3';
import { Register } from '../../pages/Register';
import { Quality } from '../../pages/Quality';
import { Board } from '../../pages/Board';
import { Proposed } from '../../pages/Proposed';

const PAGES_MAP: Record<PageId, ComponentType<{ data: MisData }>> = {
  overview: Overview,
  reach: Reach,
  ascg: Ascg,
  cbc: Cbc,
  prog3: Prog3,
  register: Register,
  quality: Quality,
  board: Board,
  proposed: Proposed,
};

/** Thin indeterminate bar shown during a background refetch of loaded data. */
function FetchIndicator({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div
      role="progressbar"
      aria-label="Refreshing data"
      className="mb-3 h-0.5 w-full overflow-hidden rounded-full bg-line"
    >
      <div className="h-full w-1/4 animate-[fetch-bar_1.1s_ease-in-out_infinite] bg-vf-blue" />
    </div>
  );
}

export function AppLayout() {
  // Role comes from the session (RequireAuth guarantees it), never the URL.
  const session = useSession();
  const logout = useLogout();
  const navigate = useNavigate();
  const { page: pageParam } = useParams();
  const query = useMisData();

  if (!session.data) return null; // guard redirects to /login
  const user = session.data;
  const role = user.role;

  const page = isPage(pageParam) ? pageParam : null;
  if (!page || !canAccess(role, page)) {
    return <Navigate to={`/${firstAllowedPage(role)}`} replace />;
  }
  const Page = PAGES_MAP[page];

  function onSignOut() {
    logout.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) });
  }

  return (
    <>
      <TopBar user={user} signingOut={logout.isPending} onSignOut={onSignOut} />
      <div className="flex min-h-[calc(100vh-64px)] items-start max-[820px]:flex-col">
        <Rail role={role} />
        <main className="min-w-0 max-w-[1240px] flex-1 px-[30px] pb-[70px] pt-[26px] max-[820px]:px-3.5 max-[820px]:pb-[60px] max-[820px]:pt-[18px]">
          {query.data ? (
            <>
              <FetchIndicator active={query.isFetching} />
              <Page data={query.data} />
              <Footer generated={query.data.generated} roleLabel={roleLabel(role)} />
            </>
          ) : query.isError ? (
            <ErrorPanel
              message={
                query.error instanceof Error ? query.error.message : String(query.error)
              }
              onRetry={() => query.refetch()}
            />
          ) : (
            <PageSkeleton />
          )}
        </main>
      </div>
    </>
  );
}
