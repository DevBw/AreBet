import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} aria-hidden="true" />;
}

export function SkeletonCard() {
  return (
    <Card className="match-card">
      <Skeleton className="skeleton-line w-40" />
      <Skeleton className="skeleton-line w-full" />
      <Skeleton className="skeleton-line w-28" />
      <Skeleton className="skeleton-line w-20" />
    </Card>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <section className="cards-grid" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </section>
  );
}

// ── Command Center skeleton shapes ──────────────────────────────────────────

export function SkeletonMatchRow() {
  return (
    <div className="sk-match-row" aria-hidden="true">
      <div className="sk-match-row-left">
        <Skeleton className="sk-badge" />
        <div className="sk-match-teams">
          <Skeleton className="skeleton-line w-28" />
          <Skeleton className="skeleton-line w-20" />
        </div>
      </div>
      <div className="sk-match-row-right">
        <Skeleton className="sk-odds-pill" />
        <Skeleton className="sk-odds-pill" />
        <Skeleton className="sk-odds-pill" />
      </div>
    </div>
  );
}

export function SkeletonInsightPanel() {
  return (
    <div className="sk-insight-panel" aria-hidden="true">
      <div className="sk-insight-header">
        <Skeleton className="skeleton-line w-48" />
        <Skeleton className="skeleton-line w-32" />
      </div>
      <div className="sk-insight-section">
        <Skeleton className="sk-section-label" />
        <div className="sk-stat-row">
          <Skeleton className="sk-stat-block" />
          <Skeleton className="sk-stat-block" />
          <Skeleton className="sk-stat-block" />
        </div>
      </div>
      <div className="sk-insight-section">
        <Skeleton className="sk-section-label" />
        <Skeleton className="skeleton-line w-full" />
        <Skeleton className="skeleton-line w-3/4" />
      </div>
      <div className="sk-insight-section">
        <Skeleton className="sk-section-label" />
        <div className="sk-odds-row">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="sk-insight-odd" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonCommandCenter() {
  return (
    <div className="sk-command-center" aria-label="Loading Command Center">
      {/* Left column — match list */}
      <div className="sk-col-left">
        <Skeleton className="sk-col-header" />
        <div className="sk-match-list">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonMatchRow key={i} />
          ))}
        </div>
      </div>

      {/* Centre column — detail */}
      <div className="sk-col-center">
        <SkeletonInsightPanel />
      </div>

      {/* Right column — signals */}
      <div className="sk-col-right">
        <Skeleton className="sk-col-header" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="sk-signal-card">
            <Skeleton className="skeleton-line w-20" />
            <Skeleton className="skeleton-line w-full" />
            <Skeleton className="skeleton-line w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
