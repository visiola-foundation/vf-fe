/** Thousands-separated integer, or an em dash when there is no value. */
export const fmt = (n: number | null | undefined): string =>
  n === null || n === undefined || Number.isNaN(n) ? '—' : n.toLocaleString('en-US');

/** One-decimal percentage, or an em dash. */
export const pct = (n: number | null | undefined): string =>
  n === null || n === undefined || Number.isNaN(n) ? '—' : n.toFixed(1) + '%';

/**
 * Age is derived at read time, so it is right on whatever day this is opened.
 * Returns null for missing, unparseable, or implausible dates.
 */
export function ageOf(dob: unknown): number | null {
  if (dob === null || dob === undefined || dob === '') return null;
  const d = new Date(String(dob));
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a < 0 || a > 100 ? null : a;
}

/** A value is "blank" when it was never collected — never confused with zero. */
export function isBlank(v: unknown): boolean {
  return v === null || v === undefined || v === '';
}

/** Human-readable rendering of a cell value (falls back to em dash). */
export function cellText(v: unknown): string {
  if (isBlank(v)) return '';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
}
