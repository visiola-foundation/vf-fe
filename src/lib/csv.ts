import type { RosterRow } from '../types/mis';
import { COLS } from './registerColumns';

function escCsv(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

/**
 * Builds the CSV text for every row that has at least one edited cell.
 * Column order follows the register table (minus derived columns).
 * Returns null when there is nothing to export.
 */
export function buildRegisterEditsCsv(
  roster: RosterRow[],
  dirtyKeys: string[] | Array<{ uid: string; field: string; value: string | null }>,
): string | null {
  const keys = COLS.filter((c) => !c.derived).map((c) => c.k as keyof RosterRow);
  const changed = new Set(
    dirtyKeys.map((d) => (typeof d === 'string' ? d.split('|')[0] : d.uid)),
  );
  const rows = roster.filter((r) => changed.has(r.uid));

  if (rows.length === 0) return null;

  const csv = [
    keys.join(','),
    ...rows.map((r) => keys.map((k) => escCsv(r[k])).join(',')),
  ].join('\n');
  return csv;
}

/**
 * Builds a CSV of every row that has at least one edited cell and triggers a
 * download. Mirrors the original export: only genuinely touched rows are written
 * and column order follows the register table (minus derived columns).
 * Returns false when there is nothing to export.
 */
export function exportRegisterEdits(
  roster: RosterRow[],
  dirtyKeys: string[],
): boolean {
  const csv = buildRegisterEditsCsv(roster, dirtyKeys);
  if (!csv) return false;

  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'vf_register_edits.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  return true;
}
