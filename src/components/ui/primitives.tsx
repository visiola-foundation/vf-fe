import type { ReactNode } from 'react';
import { isBlank, cellText } from '../../lib/format';

/* ── The hatch that stands for "we do not have this data" ───────────── */
export function Blank() {
  return (
    <span
      className="hatch inline-block h-3 min-w-[34px] rounded-[3px] align-[-2px]"
      title="No data recorded"
      aria-label="No data recorded"
      role="img"
    />
  );
}

/** Renders a value, or the hatch when the field was never collected. */
export function Cell({ value }: { value: unknown }) {
  if (isBlank(value)) return <Blank />;
  return <>{cellText(value)}</>;
}

/* ── Cards ─────────────────────────────────────────────────────────── */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-card border border-line bg-card p-4 ${className ?? ''}`}>
      {children}
    </div>
  );
}

const ACCENTS = {
  blue: 'border-l-[3px] border-l-vf-blue',
  green: 'border-l-[3px] border-l-vf-green',
  red: 'border-l-[3px] border-l-vf-red',
  purple: 'border-l-[3px] border-l-vf-purple',
} as const;

export type Accent = keyof typeof ACCENTS;

export function Kpi({
  label,
  value,
  sub,
  accent,
  children,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  accent?: Accent;
  children?: ReactNode;
}) {
  return (
    <div
      className={`rounded-card border border-line bg-card p-4 ${
        accent ? ACCENTS[accent] : ''
      }`}
    >
      <div className="text-[12px] font-semibold tracking-[0.01em] text-muted">{label}</div>
      <div className="mt-1 font-mono text-[33px] font-semibold leading-[1.15] tracking-[-0.03em]">
        {value}
      </div>
      {sub ? <div className="mt-[3px] text-[12px] text-muted">{sub}</div> : null}
      {children}
    </div>
  );
}

/** Signature element: the fill gauge that shows how much of a field exists. */
export function Gauge({
  filled,
  total,
  variant = 'green',
}: {
  filled: number;
  total: number;
  variant?: 'green' | 'blue';
}) {
  const p = total ? (filled / total) * 100 : 0;
  return (
    <div className="mt-2.5 flex h-[7px] overflow-hidden rounded-[4px] border border-line">
      <div
        className={variant === 'blue' ? 'bg-vf-blue' : 'bg-vf-green'}
        style={{ width: `${p.toFixed(1)}%` }}
      />
      <div className="hatch flex-1" />
    </div>
  );
}

/* ── Pills ─────────────────────────────────────────────────────────── */
const PILLS = {
  ok: 'bg-[#EDF6DC] text-[#4A6410]',
  amb: 'bg-[#FBF1DB] text-[#7A5713]',
  no: 'bg-[#F7EAEA] text-[#8A2027]',
  up: 'bg-[#EDF6DC] text-[#4A6410]',
  down: 'bg-[#F7EAEA] text-[#8A2027]',
  flat: 'bg-[#EDEFF2] text-[#4A5057]',
} as const;

export type PillVariant = keyof typeof PILLS;

export function Pill({
  variant,
  children,
}: {
  variant: PillVariant;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 font-mono text-[11px] font-[650] ${PILLS[variant]}`}
    >
      {children}
    </span>
  );
}

/* ── Notices ───────────────────────────────────────────────────────── */
const NOTICES = {
  err: 'bg-[#FDF2F2] border-[#F0C4C4] text-[#7A1A1F]',
  info: 'bg-[#F0F9FD] border-[#BDE3F3] text-[#0B4F68]',
  warn: 'bg-[#FBF8EE] border-[#E6DCB8] text-[#6B5A16]',
} as const;

export type NoticeVariant = keyof typeof NOTICES;

export function Notice({
  variant,
  title,
  children,
  className,
}: {
  variant: NoticeVariant;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mb-[18px] rounded-card border px-4 py-3.5 text-[13.5px] [&>p]:mb-0 [&>p]:mt-[5px] ${NOTICES[variant]} ${className ?? ''}`}
    >
      {title ? <h3 className="mb-[5px] text-[13.5px]">{title}</h3> : null}
      {children}
    </div>
  );
}

/* ── Empty states ──────────────────────────────────────────────────── */
export function EmptyState({
  title,
  children,
  className,
}: {
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card border border-dashed border-line-2 bg-card p-6 text-center text-muted ${className ?? ''}`}
    >
      <strong className="mb-1 block text-[14px] text-ink">{title}</strong>
      {children}
    </div>
  );
}
