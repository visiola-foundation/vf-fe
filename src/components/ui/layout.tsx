import type { ReactNode } from 'react';

/* ── Typography ────────────────────────────────────────────────────── */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
      {children}
    </p>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="mb-1 text-[26px] font-bold tracking-[-0.02em] max-[820px]:text-[21px]">
      {children}
    </h1>
  );
}

export function Lede({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`mb-[22px] mt-1.5 max-w-[68ch] text-ink-2 ${className ?? ''}`}>
      {children}
    </p>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 mt-8 flex items-center gap-2.5 text-[15px] font-bold tracking-normal">
      {children}
      <span className="h-px flex-1 bg-line" />
    </h2>
  );
}

/* ── Layout helpers ────────────────────────────────────────────────── */
export function Grid4({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(215px,1fr))]">
      {children}
    </div>
  );
}

export function Grid2({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(330px,1fr))]">
      {children}
    </div>
  );
}

/* ── Legend ────────────────────────────────────────────────────────── */
export function Legend({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-4 text-[12px] text-ink-2">{children}</div>
  );
}

export function LegendSwatch({ color }: { color: string }) {
  return (
    <i
      className="mr-[5px] inline-block h-[11px] w-[11px] rounded-[3px] align-[-1px]"
      style={{ background: color }}
    />
  );
}
