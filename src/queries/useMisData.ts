import { useQuery } from '@tanstack/react-query';
import { fetchDashboard, isBackendConfigured } from '../lib/api';
import { queryKeys } from './keys';

/**
 * The dashboard payload. With a backend configured this behaves like any other
 * server query (short staleness, refetch on focus, a couple of retries). In
 * UI-only mode it is cached forever because the bundled snapshot is static.
 */
export function useMisData() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: ({ signal }) => fetchDashboard(signal),
    staleTime: isBackendConfigured ? 60_000 : Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: isBackendConfigured,
    retry: isBackendConfigured ? 2 : 1,
  });
}

