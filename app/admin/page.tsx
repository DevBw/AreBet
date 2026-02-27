import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <main className="page-wrap">
      <PageHeader title="Admin Panel" subtitle="Operational controls and system overview." />

      <section className="cards-grid">
        <Card title="System Health">
          <p className="muted">Status: Operational</p>
          <p className="muted">Demo data feed: Active</p>
        </Card>
        <Card title="Moderation">
          <p className="muted">User flags: 0</p>
          <p className="muted">Pending actions: 0</p>
        </Card>
      </section>
    </main>
  );
}
