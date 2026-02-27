import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <section className="cards-grid" aria-label="Loading dashboard">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="match-card">
          <div className="skeleton skeleton-line w-40" />
          <div className="skeleton skeleton-line w-full" />
          <div className="skeleton skeleton-line w-28" />
          <div className="skeleton skeleton-line w-20" />
        </Card>
      ))}
    </section>
  );
}
