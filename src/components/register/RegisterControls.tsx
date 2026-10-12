import { useEffect, useRef, useState } from 'react';

const FIELD =
  'rounded-[7px] border border-line-2 bg-card px-2.5 py-[7px] text-[13px] text-ink';
const BTN =
  'rounded-[7px] border border-line-2 bg-card px-[13px] py-[7px] text-[13px] font-semibold hover:border-ink disabled:cursor-not-allowed disabled:opacity-60';

export interface RegisterFilters {
  text: string;
  school: string;
  match: string;
  missing: boolean;
}

export function RegisterControls({
  filters,
  schools,
  busy = false,
  onChange,
  onAdd,
  onExport,
}: {
  filters: RegisterFilters;
  schools: string[];
  busy?: boolean;
  onChange: (patch: Partial<RegisterFilters>) => void;
  onAdd: () => void;
  onExport: () => void;
}) {
  const [local, setLocal] = useState(filters.text);
  const tmr = useRef<number | undefined>(undefined);

  // Keep the input in sync if the URL changes from outside (e.g. back button).
  useEffect(() => {
    setLocal(filters.text);
  }, [filters.text]);

  useEffect(() => () => window.clearTimeout(tmr.current), []);

  return (
    <div className="mb-[13px] flex flex-wrap items-center gap-2.5">
      <input
        type="search"
        value={local}
        placeholder="Search ID, name or school"
        style={{ minWidth: 220 }}
        onChange={(e) => {
          const v = e.target.value;
          setLocal(v);
          window.clearTimeout(tmr.current);
          tmr.current = window.setTimeout(() => onChange({ text: v }), 260);
        }}
        className={FIELD}
      />
      <select
        value={filters.school}
        onChange={(e) => onChange({ school: e.target.value })}
        className={FIELD}
        aria-label="Filter by school"
      >
        <option value="">All schools</option>
        {schools.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={filters.match}
        onChange={(e) => onChange({ match: e.target.value })}
        className={FIELD}
        aria-label="Filter by link status"
      >
        <option value="">Any link status</option>
        <option value="confirmed">Confirmed</option>
        <option value="ambiguous">Ambiguous</option>
        <option value="unmatched">Unmatched</option>
      </select>
      <button
        type="button"
        aria-pressed={filters.missing}
        onClick={() => onChange({ missing: !filters.missing })}
        className={`rounded-full border px-3 py-1.5 text-[12.5px] font-semibold ${
          filters.missing
            ? 'border-ink bg-ink text-white'
            : 'border-line-2 bg-card text-ink-2'
        }`}
      >
        Consent not recorded
      </button>
      <span className="flex-1" />
      <button type="button" onClick={onAdd} className={BTN} disabled={busy}>
        {busy ? 'Adding…' : 'Add student'}
      </button>
      <button
        type="button"
        onClick={onExport}
        disabled={busy}
        className="rounded-[7px] border border-ink bg-ink px-[13px] py-[7px] text-[13px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        Export changes as CSV
      </button>
    </div>
  );
}
