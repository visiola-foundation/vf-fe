/**
 * Data quality resource. Summary aggregates + paginated, filterable issue log.
 * The backend redacts row-level PII per role; board logins never see refs.
 *
 *   GET   /mis/quality/summary -> QualitySummary
 *   GET   /mis/quality/issues?severity=&field=&page=&page_size= -> Paged<IssueRow>
 *   PATCH /mis/quality/issues/:id/resolve {resolved} -> IssueRow | 204
 */
import type {
  IssueRow,
  Paged,
  QualityIssuesParams,
  QualitySummary,
} from '../../types/mis';
import { isBackendConfigured } from './config';
import { apiRequest } from './client';
import { getOrFallback, withParams } from './shared';

export async function fetchQualitySummary(signal?: AbortSignal): Promise<QualitySummary> {
  return getOrFallback('/mis/quality/summary', { signal }, (s) => ({
    issues: s.totals.issues,
    errors: s.totals.errors,
    warnings: s.totals.issues - s.totals.errors,
    ambiguous: s.totals.ambiguous,
    issueSummary: s.issueSummary,
  }));
}

export async function fetchQualityIssues(
  params: QualityIssuesParams = {},
  signal?: AbortSignal,
): Promise<Paged<IssueRow>> {
  const { page = 1, page_size = 100, severity, field } = params;
  return getOrFallback(
    withParams('/mis/quality/issues', { severity, field, page, page_size }),
    { signal },
    (s) => {
      const rows = s.issues.filter(
        (i) =>
          (!severity || i.severity === severity) && (!field || i.field === field),
      );
      const start = (page - 1) * page_size;
      return { items: rows.slice(start, start + page_size), total: rows.length, page, page_size };
    },
  );
}

export async function resolveQualityIssue(id: string, resolved = true): Promise<void> {
  if (!isBackendConfigured) return;
  await apiRequest<void>(`/mis/quality/issues/${encodeURIComponent(id)}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify({ resolved }),
  });
}
