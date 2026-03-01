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
