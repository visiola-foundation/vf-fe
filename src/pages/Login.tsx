import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { firstAllowedPage, ROLES, type Role } from '../lib/access';
import { demoEmailFor, isBackendConfigured, logoUrl } from '../lib/api';
import { useLogin, useSession } from '../queries/useSession';
import { Notice } from '../components/ui/primitives';
import { SessionSplash } from './RequireAuth';

export function Login() {
  const session = useSession();
  if (session.isLoading) return <SessionSplash />;
  if (session.data) {
    return <Navigate to={`/${firstAllowedPage(session.data.role)}`} replace />;
  }
  return <LoginForm />;
}

function LoginForm() {
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [demoRole, setDemoRole] = useState<Role>('admin');

  const error = login.error instanceof Error ? login.error.message : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (login.isPending) return;
    try {
      const user = await login.mutateAsync({
        input: { email, password },
        demoRole: isBackendConfigured ? undefined : demoRole,
      });
      const from =
        (location.state as { from?: string } | null)?.from ??
        `/${firstAllowedPage(user.role)}`;
      navigate(from, { replace: true });
    } catch {
      /* surfaced via login.error below */
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="mb-6 flex items-center gap-3">
          <img src={logoUrl} alt="The Visiola Foundation" className="block h-12 w-auto" />
        </div>
        <div className="rounded-card border border-line bg-card p-6">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
            Management Information System
          </p>
          <h1 className="mt-1.5 text-[22px]">Sign in</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-2">
            Your role decides which pages you can open. Board accounts see aggregate
            figures only.
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3.5">
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-semibold">Email</span>
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@visiola.org"
                className="w-full rounded-[7px] border border-line-2 bg-card px-2.5 py-[7px] text-[13px]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-semibold">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-[7px] border border-line-2 bg-card px-2.5 py-[7px] text-[13px]"
              />
            </label>

            {!isBackendConfigured ? (
              <fieldset>
                <legend className="mb-1.5 text-[12.5px] font-semibold">
                  Demo role <span className="font-normal text-muted">(no backend yet)</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      aria-pressed={demoRole === r.id}
                      onClick={() => {
                        setDemoRole(r.id);
                        setEmail(demoEmailFor(r.id));
                      }}
                      className={`rounded-full border border-line-2 bg-card px-3 py-1.5 text-[12.5px] font-semibold text-ink-2 ${
                        demoRole === r.id ? 'border-ink bg-ink text-white' : ''
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-muted">
                  Any password works. When the backend goes live this picker disappears
                  and the server assigns your role.
                </p>
              </fieldset>
            ) : null}

            {error ? (
              <Notice variant="err" title="Could not sign you in">
                <p>{error}</p>
              </Notice>
            ) : null}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full rounded-[7px] border border-ink bg-ink px-[13px] py-2 text-[13px] font-semibold text-white hover:bg-black disabled:cursor-wait disabled:opacity-70"
            >
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-[12px] text-muted">
          The Visiola Foundation · Management Information System
        </p>
      </div>
    </div>
  );
}
