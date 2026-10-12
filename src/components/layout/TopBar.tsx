import type { AuthUser } from '../../types/auth';
import { ROLES } from '../../lib/access';
import { logoUrl } from '../../lib/api';

export function TopBar({
  user,
  signingOut,
  onSignOut,
}: {
  user: AuthUser;
  signingOut: boolean;
  onSignOut: () => void;
}) {
  const roleName = ROLES.find((r) => r.id === user.role)?.label ?? user.role;

  return (
    <header className="sticky top-0 z-40 flex flex-wrap items-center gap-4 border-b border-line bg-card px-5 py-3 max-[820px]:px-3.5">
      <img src={logoUrl} alt="The Visiola Foundation" className="block h-[38px] w-auto" />
      <div className="flex-1" />
      <span
        className="rounded-full border border-line-2 bg-paper px-3 py-1 text-[12.5px] font-semibold text-ink-2"
        title={user.email}
      >
        {user.name} · {roleName}
      </span>
      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        className="rounded-[7px] border border-line-2 bg-card px-[13px] py-[7px] text-[13px] font-semibold text-ink hover:border-ink disabled:cursor-wait disabled:opacity-70"
      >
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </header>
  );
}
