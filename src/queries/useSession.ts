import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthUser, LoginInput } from '../types/auth';
import type { Role } from '../lib/access';
import { isBackendConfigured, login, logout, restoreSession } from '../lib/api';
import { queryKeys } from './keys';

/**
 * The session: `AuthUser | null`. `undefined` data with `isLoading` means
 * "still restoring" (refresh / first load); `null` means signed out.
 * Cached forever — it only changes via login/logout mutations.
 */
export function useSession() {
  return useQuery<AuthUser | null>({
    queryKey: queryKeys.session,
    queryFn: restoreSession,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { input: LoginInput; demoRole?: Role }) =>
      login(vars.input, vars.demoRole),
    onSuccess: (user) => {
      qc.setQueryData<AuthUser | null>(queryKeys.session, user);
      if (isBackendConfigured) {
        // Dashboard payload is per-user server-side; refetch under the new token.
        qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      }
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      qc.setQueryData<AuthUser | null>(queryKeys.session, null);
      // Never leak one user's dashboard/register state into the next session.
      qc.removeQueries({ queryKey: queryKeys.dashboard });
      qc.setQueryData<string[]>(queryKeys.registerEdits, []);
    },
  });
}
