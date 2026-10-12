/**
 * Board + governance resources. Aggregate-only by contract: this module never
 * returns names, contacts, or individual records. Serve from reporting views
 * / a separate schema + DB role server-side.
 *
 *   GET /mis/board-summary                 -> BoardSummaryPayload
 *   GET /mis/finance/spend?programme=&year= -> ProgrammeSpend[]
 *   GET /mis/metrics-proposals              -> MetricProposal[]
 */
import type {
  BoardSummaryPayload,
  MetricProposal,
  ProgrammeSpend,
  ProgrammeSpendParams,
} from '../../types/mis';
import { isBackendConfigured } from './config';
import { apiRequest } from './client';
import { getOrFallback, withParams } from './shared';

export async function fetchBoardSummary(signal?: AbortSignal): Promise<BoardSummaryPayload> {
  return getOrFallback('/mis/board-summary', { signal }, (s) => ({
    unique_students: s.totals.unique_students,
    schools: s.totals.schools,
    improved_pct:
      s.progress.assessed > 0 ? (s.progress.improved / s.progress.assessed) * 100 : null,
    assessed: s.progress.assessed,
    // Consent was never collected — surface the gap, not a zero.
    consent_pct: null,
    reach_by_year: s.reach,
    outcome_split: s.progress,
    terms: s.terms,
  }));
}

export async function fetchProgrammeSpend(
  params: ProgrammeSpendParams = {},
  signal?: AbortSignal,
): Promise<ProgrammeSpend[]> {
  if (!isBackendConfigured) return [];
  return apiRequest<ProgrammeSpend[]>(withParams('/mis/finance/spend', params), { signal });
}

export async function fetchMetricProposals(signal?: AbortSignal): Promise<MetricProposal[]> {
  return getOrFallback('/mis/metrics-proposals', { signal }, () => []);
}
