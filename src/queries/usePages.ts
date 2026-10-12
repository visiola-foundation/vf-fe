import { useQuery } from '@tanstack/react-query';
import type {
  AscgAcademicParams,
  AscgAcademicPayload,
  BoardSummaryPayload,
  CbcGraduate,
  CbcGraduateParams,
  CbcOutcome,
  CbcOutcomeParams,
  CbcSummary,
  MetricProposal,
  OverviewPayload,
  Paged,
  ProgrammeSpend,
  ProgrammeSpendParams,
  QualityIssuesParams,
  QualitySummary,
  ReachParams,
  ReachPayload,
  IssueRow,
} from '../types/mis';
import { isBackendConfigured } from '../lib/api';
import {
  fetchAscgAcademic,
  fetchBoardSummary,
  fetchCbcGraduates,
  fetchCbcOutcomes,
  fetchCbcSummary,
  fetchMetricProposals,
  fetchOverview,
  fetchProgrammeSpend,
  fetchQualityIssues,
  fetchQualitySummary,
  fetchReach,
} from '../lib/api';
import { queryKeys } from './keys';

function liveOptions() {
  return {
    staleTime: isBackendConfigured ? 60_000 : Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: isBackendConfigured,
    retry: isBackendConfigured ? 2 : 1,
  } as const;
}

/**
 * Per-page queries. Each wraps one resource function in `src/lib/api/`; in
 * UI-only mode the payload is derived from the bundled snapshot, with a
 * backend it is the matching HTTP path. Pages keep consuming `useMisData()`
 * until they are migrated one by one — these hooks are the migration target.
 */
export function useOverview() {
  return useQuery<OverviewPayload>({
    queryKey: queryKeys.overview,
    queryFn: ({ signal }) => fetchOverview(signal),
    ...liveOptions(),
  });
}

export function useReach(params: ReachParams = {}) {
  return useQuery<ReachPayload>({
    queryKey: queryKeys.reach(params as Record<string, string | number | undefined>),
    queryFn: ({ signal }) => fetchReach(params, signal),
    ...liveOptions(),
  });
}

export function useAscgAcademic(params: AscgAcademicParams = {}) {
  return useQuery<AscgAcademicPayload>({
    queryKey: queryKeys.ascg(params),
    queryFn: ({ signal }) => fetchAscgAcademic(params, signal),
    ...liveOptions(),
  });
}

export function useCbcSummary() {
  return useQuery<CbcSummary>({
    queryKey: queryKeys.cbcSummary,
    queryFn: ({ signal }) => fetchCbcSummary(signal),
    ...liveOptions(),
  });
}

export function useCbcGraduates(params: CbcGraduateParams = {}) {
  return useQuery<Paged<CbcGraduate>>({
    queryKey: queryKeys.cbcGraduates(params as Record<string, string | number | undefined>),
    queryFn: ({ signal }) => fetchCbcGraduates(params, signal),
    ...liveOptions(),
  });
}

export function useCbcOutcomes(params: CbcOutcomeParams = {}) {
  return useQuery<CbcOutcome[]>({
    queryKey: queryKeys.cbcOutcomes(params),
    queryFn: ({ signal }) => fetchCbcOutcomes(params, signal),
    ...liveOptions(),
  });
}

export function useQualitySummary() {
  return useQuery<QualitySummary>({
    queryKey: queryKeys.qualitySummary,
    queryFn: ({ signal }) => fetchQualitySummary(signal),
    ...liveOptions(),
  });
}

export function useQualityIssues(params: QualityIssuesParams = {}) {
  return useQuery<Paged<IssueRow>>({
    queryKey: queryKeys.qualityIssues(params as Record<string, string | number | undefined>),
    queryFn: ({ signal }) => fetchQualityIssues(params, signal),
    ...liveOptions(),
  });
}

export function useBoardSummary() {
  return useQuery<BoardSummaryPayload>({
    queryKey: queryKeys.boardSummary,
    queryFn: ({ signal }) => fetchBoardSummary(signal),
    ...liveOptions(),
  });
}

export function useProgrammeSpend(params: ProgrammeSpendParams = {}) {
  return useQuery<ProgrammeSpend[]>({
    queryKey: queryKeys.programmeSpend(
      params as Record<string, string | number | undefined>,
    ),
    queryFn: ({ signal }) => fetchProgrammeSpend(params, signal),
    ...liveOptions(),
  });
}

export function useMetricProposals() {
  return useQuery<MetricProposal[]>({
    queryKey: queryKeys.metricProposals,
    queryFn: ({ signal }) => fetchMetricProposals(signal),
    ...liveOptions(),
  });
}
