import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

export default function DashboardNotFound() {
  return (
    <main className="page-wrap">
      <PageHeader title="Not found" subtitle="This dashboard page does not exist." />
      <Card>
        <p className="muted">Check the URL or head back to the dashboard.</p>
        <Link href="/dashboard" className="btn btn-muted mt-4">
          Back to dashboard
        </Link>
      </Card>
    </main>
  );
}
