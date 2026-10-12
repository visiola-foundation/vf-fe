/**
 * Central query-key factory. Keeping every key here means cache reads/writes
 * and invalidations can never drift apart as more resources are added.
 */
export const queryKeys = {
  /** The signed-in user (`AuthUser | null`). Source of truth for role/menu. */
  session: ['session'] as const,
  /** The whole dashboard snapshot / backing payload (v0 monolith). */
  dashboard: ['mis-data'] as const,
  /** Overview KPIs + completeness gauges. */
  overview: ['mis', 'overview'] as const,
  /** Reach series, optionally filtered by year range / programme. */
  reach: (params?: Record<string, string | number | undefined>) =>
    ['mis', 'reach', params ?? {}] as const,
  /** ASCG academic aggregates for a cohort. */
  ascg: (params?: { cohort?: number }) => ['mis', 'ascg', params ?? {}] as const,
  /** CBC summary (empty until graduate records exist). */
  cbcSummary: ['mis', 'cbc', 'summary'] as const,
  /** CBC graduates list. */
  cbcGraduates: (params?: Record<string, string | number | undefined>) =>
    ['mis', 'cbc', 'graduates', params ?? {}] as const,
  /** CBC outcomes list. */
  cbcOutcomes: (params?: { months_after?: number }) =>
    ['mis', 'cbc', 'outcomes', params ?? {}] as const,
  /** School names for register filters. */
  schools: ['mis', 'schools'] as const,
  /** One paginated register page for a filter set. */
  registerPage: (filters?: Record<string, string | number | boolean | undefined>) =>
    ['mis', 'students', filters ?? {}] as const,
  /** The set of `uid|field` pairs edited this session. */
  registerEdits: ['register-edits'] as const,
  /** Data-quality summary aggregates. */
  qualitySummary: ['mis', 'quality', 'summary'] as const,
  /** One paginated quality-issue page for a filter set. */
  qualityIssues: (params?: Record<string, string | number | undefined>) =>
    ['mis', 'quality', 'issues', params ?? {}] as const,
  /** Board aggregate summary (never individual records). */
  boardSummary: ['mis', 'board-summary'] as const,
  /** Programme spend rows (empty until finance data exists). */
  programmeSpend: (params?: Record<string, string | number | undefined>) =>
    ['mis', 'finance', 'spend', params ?? {}] as const,
  /** Metrics-to-add proposals (static today). */
  metricProposals: ['mis', 'metrics-proposals'] as const,
};

