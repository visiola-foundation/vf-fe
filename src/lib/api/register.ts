/**
 * Student register resource. The heaviest surface: paginated reads, single
 * cell writes, blank-row creation, and CSV export of session edits.
 *
 *   GET   /mis/schools -> string[]
 *   GET   /mis/students?q=&school=&match=&missing_consent=&page=&page_size=&sort=&order=
 *     -> Paged<RosterRow>
 *   GET   /mis/students/:uid                                   -> RosterRow
 *   PATCH /mis/students/:uid/fields/:field  {value}            -> RosterRow | 204
 *   POST  /mis/students                      {}                -> {uid?}
 *   POST  /mis/students/export               {edits}           -> CSV (download)
 *   GET   /mis/dashboard (v0 monolith fallback)                -> MisData
 */
import type {
  MisData,
  RegisterCellPatch,
  RegisterFilters,
  RegisterPage,
  RosterRow,
} from '../../types/mis';
import { buildRegisterEditsCsv } from '../csv';
import { registerBlankRow } from '../registerColumns';
import { isBackendConfigured } from './config';
import { apiRequest } from './client';
import { getOrFallback, withParams } from './shared';

/** v0 monolith accessor — the whole snapshot until per-page splits land. */
export async function fetchDashboard(signal?: AbortSignal): Promise<MisData> {
  return getOrFallback('/mis/dashboard', { signal }, (s) => s);
}

export async function fetchSchools(signal?: AbortSignal): Promise<string[]> {
  return getOrFallback('/mis/schools', { signal }, (s) => s.schools);
}

function applyRegisterFilters(
  rows: RosterRow[],
  f: RegisterFilters,
): { rows: RosterRow[]; total: number } {
  const q = (f.q ?? '').trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (f.school && r.school !== f.school) return false;
    if (f.match && r.match !== f.match) return false;
    if (f.missing_consent && r.consent) return false;
    if (q) {
      const hay = `${r.uid} ${r.last ?? ''} ${r.first ?? ''} ${r.school ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  return { rows: filtered, total: filtered.length };
}

export async function fetchRegisterPage(
  filters: RegisterFilters = {},
  signal?: AbortSignal,
): Promise<RegisterPage> {
  const { page = 1, page_size = 100, q, school, match, missing_consent, sort, order } = filters;
  return getOrFallback(
    withParams('/mis/students', {
      q,
      school,
      match,
      missing_consent,
      page,
      page_size,
      sort,
      order,
    }),
    { signal },
    (s) => {
      const { rows, total } = applyRegisterFilters(s.roster, filters);
      const start = (page - 1) * page_size;
      return { items: rows.slice(start, start + page_size), total, page, page_size };
    },
  );
}

export async function fetchStudent(uid: string, signal?: AbortSignal): Promise<RosterRow> {
  return getOrFallback(
    `/mis/students/${encodeURIComponent(uid)}`,
    { signal },
    (s) => {
      const row = s.roster.find((r) => r.uid === uid);
      if (!row) throw new Error(`Student ${uid} not found in the loaded snapshot`);
      return row;
    },
  );
}

/** PATCH one editable register cell. No-op in UI-only mode. */
export async function saveRegisterCell(patch: RegisterCellPatch): Promise<void> {
  if (!isBackendConfigured) return;
  await apiRequest<void>(
    `/mis/students/${encodeURIComponent(patch.uid)}/fields/${encodeURIComponent(patch.field)}`,
    { method: 'PATCH', body: JSON.stringify({ value: patch.value }) },
  );
}

export interface CreatedStudent {
  uid?: string;
}

/** POST a new blank student row. Returns the created uid when supplied. */
export async function createRegisterStudent(): Promise<CreatedStudent | void> {
  if (!isBackendConfigured) return;
  return apiRequest<CreatedStudent>('/mis/students', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * Export session edits as CSV. UI-only: build locally from the snapshot
 * rows. Backend: POST the edits and download the returned file.
 */
export async function exportRegisterEdits(
  edits: RegisterCellPatch[],
  localRows: RosterRow[],
): Promise<Blob> {
  if (!isBackendConfigured) {
    const csv = buildRegisterEditsCsv(localRows, edits);
    if (!csv) throw new Error('No edits to export yet. Change a cell first.');
    return new Blob([csv], {
      type: 'text/csv;charset=utf-8',
    });
  }
  const res = await fetch('/mis/students/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ edits }),
  });
  if (!res.ok) throw new Error(`Export failed (HTTP ${res.status})`);
  return await res.blob();
}

/** Local blank row for the optimistic "Add student" insert. */
export function blankRegisterRow(uid: string): RosterRow {
  return registerBlankRow(uid);
}
