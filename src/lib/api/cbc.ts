/**
 * Coding Boot Camp resource. No CBC records exist in the snapshot, so the
 * UI-only fallbacks return empty (hatched) figures — never carried-over data.
 * Field names match the table copy on the CBC page.
 *
 *   GET  /mis/cbc/summary                                  -> CbcSummary
 *   GET  /mis/cbc/graduates?track=&outcome=&page=          -> Paged<CbcGraduate>
 *   GET  /mis/cbc/graduates/:id                            -> CbcGraduate
 *   POST /mis/cbc/graduates            {…}                -> CbcGraduate
 *   PATCH /mis/cbc/graduates/:id       {…}                -> CbcGraduate
 *   GET  /mis/cbc/outcomes?months_after=                   -> CbcOutcome[]
 *   POST /mis/cbc/outcomes             {…}                -> CbcOutcome
 */
import type {
  CbcGraduate,
  CbcGraduateParams,
  CbcGraduatePatch,
  CbcOutcome,
  CbcOutcomeParams,
  CbcSummary,
  NewCbcGraduate,
  NewCbcOutcome,
  Paged,
} from '../../types/mis';
import { isBackendConfigured } from './config';
import { apiRequest } from './client';
import { withParams } from './shared';

const EMPTY_SUMMARY: CbcSummary = {
  enrolled: null,
  completed: null,
  employed_6mo: null,
  employed_12mo: null,
  unemployed_12mo: null,
  further_education: null,
  engaged_full: null,
  engaged_partial: null,
  median_months_to_role: null,
  response_rate: null,
};

export async function fetchCbcSummary(signal?: AbortSignal): Promise<CbcSummary> {
  if (!isBackendConfigured) return EMPTY_SUMMARY;
  return apiRequest<CbcSummary>('/mis/cbc/summary', { signal });
}

export async function fetchCbcGraduates(
  params: CbcGraduateParams = {},
  signal?: AbortSignal,
): Promise<Paged<CbcGraduate>> {
  if (!isBackendConfigured) {
    return { items: [], total: 0, page: params.page ?? 1, page_size: params.page_size ?? 25 };
  }
  return apiRequest<Paged<CbcGraduate>>(withParams('/mis/cbc/graduates', params), { signal });
}

export async function fetchCbcGraduate(id: string, signal?: AbortSignal): Promise<CbcGraduate> {
  return apiRequest<CbcGraduate>(`/mis/cbc/graduates/${encodeURIComponent(id)}`, { signal });
}

export async function createCbcGraduate(input: NewCbcGraduate): Promise<CbcGraduate> {
  return apiRequest<CbcGraduate>('/mis/cbc/graduates', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function patchCbcGraduate(id: string, patch: CbcGraduatePatch): Promise<CbcGraduate> {
  return apiRequest<CbcGraduate>(`/mis/cbc/graduates/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function fetchCbcOutcomes(
  params: CbcOutcomeParams = {},
  signal?: AbortSignal,
): Promise<CbcOutcome[]> {
  if (!isBackendConfigured) return [];
  return apiRequest<CbcOutcome[]>(withParams('/mis/cbc/outcomes', params), { signal });
}

export async function createCbcOutcome(input: NewCbcOutcome): Promise<CbcOutcome> {
  return apiRequest<CbcOutcome>('/mis/cbc/outcomes', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
