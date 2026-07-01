function SkeletonBar({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="card overflow-hidden" role="status" aria-label="Loading table data">
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3.5 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBar key={i} className="h-3 flex-1 max-w-[80px]" />
        ))}
      </div>
      <div className="divide-y divide-slate-50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-3.5 flex items-center gap-4">
            <SkeletonBar className="h-8 w-8 skeleton-circle shrink-0" />
            <SkeletonBar className="h-4 flex-1 max-w-[140px]" />
            <SkeletonBar className="h-4 flex-1 max-w-[180px] hidden sm:block" />
            <SkeletonBar className="h-4 flex-1 max-w-[100px] hidden md:block" />
            <SkeletonBar className="h-5 w-20 rounded-full hidden lg:block" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

function StatCardsSkeleton({ count = 4 }) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
      role="status"
      aria-label="Loading statistics"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card card-pad card-hover">
          <SkeletonBar className="h-10 w-10 rounded-xl mb-4" />
          <SkeletonBar className="h-8 w-16 mb-2" />
          <SkeletonBar className="h-4 w-24" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

function DetailSkeleton({ blocks = 3 }) {
  return (
    <div className="page-stack max-w-4xl" role="status" aria-label="Loading details">
      <SkeletonBar className="h-4 w-16" />
      <div className="card card-pad">
        <SkeletonBar className="h-7 w-48 mb-2" />
        <SkeletonBar className="h-4 w-64 mb-4" />
        <SkeletonBar className="h-5 w-24 rounded-full" />
      </div>
      {Array.from({ length: blocks }).map((_, i) => (
        <div key={i} className="card card-pad space-y-3">
          <SkeletonBar className="h-4 w-32" />
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="flex justify-between items-center py-1">
              <SkeletonBar className="h-4 w-40" />
              <SkeletonBar className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="page-stack" role="status" aria-label="Loading analytics">
      <StatCardsSkeleton count={4} />
      <div className="card card-pad">
        <SkeletonBar className="h-4 w-40 mb-4" />
        <SkeletonBar className="h-10 w-24 mb-2" />
        <SkeletonBar className="h-3 w-full rounded-full" />
      </div>
      <div className="card card-pad space-y-4">
        <SkeletonBar className="h-4 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <SkeletonBar className="h-4 w-28" />
              <SkeletonBar className="h-4 w-16" />
            </div>
            <SkeletonBar className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
      <TableSkeleton rows={4} cols={3} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export default function SkeletonLoader({
  variant = 'table',
  rows = 6,
  cols = 5,
  count = 4,
  blocks = 3,
}) {
  if (variant === 'stat-cards') return <StatCardsSkeleton count={count} />;
  if (variant === 'detail') return <DetailSkeleton blocks={blocks} />;
  if (variant === 'analytics') return <AnalyticsSkeleton />;
  return <TableSkeleton rows={rows} cols={cols} />;
}
