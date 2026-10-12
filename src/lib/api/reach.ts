/**
 * Reach resource. Enrolment split by year joined (+ optional filters).
 *
 *   GET /mis/reach?year_from=&year_to=&programme= -> ReachPayload
 */
import type { ReachParams, ReachPayload } from '../../types/mis';
import { getOrFallback, withParams } from './shared';

export async function fetchReach(
  params: ReachParams = {},
  signal?: AbortSignal,
): Promise<ReachPayload> {
  return getOrFallback(withParams('/mis/reach', params), { signal }, (s) => {
    const { year_from, year_to, programme } = params;
    // UI-only: only ASCG enrolments exist in the snapshot, so a non-ASCG
    // programme filter yields an empty series rather than carried-over data.
    const reach =
      programme && programme !== 'ascg'
        ? []
        : s.reach.filter(
            (r) =>
              (year_from === undefined || r.year_joined >= year_from) &&
              (year_to === undefined || r.year_joined <= year_to),
          );
    return {
      totals: { unique_students: s.totals.unique_students, enrolments: s.totals.enrolments },
      reach,
    };
  });
}
