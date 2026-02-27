import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <main className="page-wrap">
      <section className="cards-grid" aria-label="Loading content">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="match-card">
            <div className="skeleton skeleton-line w-40" />
            <div className="skeleton skeleton-line w-full" />
            <div className="skeleton skeleton-line w-28" />
            <div className="skeleton skeleton-line w-20" />
          </Card>
        ))}
      </section>
    </main>
  );
}
