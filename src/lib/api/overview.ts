/**
 * Overview resource. Supplies the headline KPIs + completeness gauges.
 *
 *   GET /mis/overview -> OverviewPayload
 */
import type { OverviewPayload } from '../../types/mis';
import { getOrFallback } from './shared';

export async function fetchOverview(signal?: AbortSignal): Promise<OverviewPayload> {
  return getOrFallback(
    '/stats/overview',
    { signal },
    (s) => ({ generated: s.generated, totals: s.totals, completeness: s.completeness }),
  );
}

