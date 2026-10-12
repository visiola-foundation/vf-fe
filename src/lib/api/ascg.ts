/**
 * ASCG academic resource. Term means, progress split, bands, subjects.
 *
 *   GET /mis/ascg/academic?cohort= -> AscgAcademicPayload
 */
import type { AscgAcademicParams, AscgAcademicPayload } from '../../types/mis';
import { getOrFallback, withParams } from './shared';

export async function fetchAscgAcademic(
  params: AscgAcademicParams = {},
  signal?: AbortSignal,
): Promise<AscgAcademicPayload> {
  return getOrFallback(withParams('/mis/ascg/academic', params), { signal }, (s) => ({
    cohort: s.progress.cohort,
    terms: s.terms,
    progress: s.progress,
    performance: s.performance,
    bandByTerm: s.bandByTerm,
    subjects: s.subjects,
  }));
}
