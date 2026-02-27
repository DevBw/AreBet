import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

export default function UserDashboardPage() {
  return (
    <main className="page-wrap">
      <PageHeader
        title="User Dashboard"
        subtitle="Account overview, recent activity, and shortcuts."
        actions={
          <Link className="btn btn-primary" href="/settings">
            Open settings
          </Link>
        }
      />

      <section className="cards-grid">
        <Card title="Account">
          <p className="muted">Plan: Starter</p>
          <p className="muted">Saved favorites: Synced on this device</p>
        </Card>
        <Card title="Shortcuts">
          <ul>
            <li>
              <Link href="/dashboard/favorites">Favorites</Link>
            </li>
            <li>
              <Link href="/subscription">Subscription</Link>
            </li>
            <li>
              <Link href="/help">Help / FAQ</Link>
            </li>
          </ul>
        </Card>
      </section>
    </main>
  );
}
