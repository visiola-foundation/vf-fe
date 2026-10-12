import { Grid4 } from './layout';

/** A single shimmering placeholder block. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-line ${className ?? ''}`}
    />
  );
}

export function KpiSkeletons({ count = 4 }: { count?: number }) {
  return (
    <Grid4>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-card border border-line bg-card p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-[30px] w-32" />
          <Skeleton className="mt-3 h-2.5 w-40" />
        </div>
      ))}
    </Grid4>
  );
}

export function BlockSkeleton({ className = 'h-[210px]' }: { className?: string }) {
  return (
    <div className="rounded-card border border-line bg-card p-4">
      <Skeleton className={className} />
    </div>
  );
}

export function TableSkeleton({
  rows = 8,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-card">
      <div className="flex gap-4 border-b border-line bg-paper px-[11px] py-2.5">
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-4 border-b border-line px-[11px] py-2.5">
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Approximates a typical page's shape while its data loads. */
export function PageSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading dashboard…</span>
      <Skeleton className="h-2.5 w-40" />
      <Skeleton className="mt-2.5 h-7 w-72" />
      <div className="mb-[22px] mt-3 max-w-[68ch] space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
      <KpiSkeletons count={4} />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-3.5 w-44" />
        <BlockSkeleton />
      </div>
      <div className="mt-8 space-y-3">
        <Skeleton className="h-3.5 w-52" />
        <TableSkeleton />
      </div>
    </div>
  );
}

export function ErrorPanel({
  title = 'Could not load the dashboard data',
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-card border border-[#F0C4C4] bg-[#FDF2F2] p-6 text-center text-[#7A1A1F]">
      <strong className="block text-[14px] text-ink">{title}</strong>
      {message ? <p className="mt-1.5 text-[13px]">{message}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-[7px] border border-ink bg-ink px-[13px] py-[7px] text-[13px] font-semibold text-white hover:bg-black"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
