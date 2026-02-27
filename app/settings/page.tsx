import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <main className="page-wrap">
      <PageHeader title="Settings" subtitle="Manage preferences, notifications, and profile behavior." />

      <section className="cards-grid">
        <Card title="Notifications">
          <p className="muted">Match alerts: Enabled</p>
          <p className="muted">Price movement alerts: Enabled</p>
        </Card>
        <Card title="Preferences">
          <p className="muted">Timezone: Local browser time</p>
          <p className="muted">Default view: Dashboard</p>
        </Card>
      </section>
    </main>
  );
}
