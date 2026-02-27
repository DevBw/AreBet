import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const authConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!authConfigured) {
    return (
      <main className="page-wrap">
        <PageHeader title="Admin Panel" subtitle="Operational controls and system overview." />

        <section className="cards-grid">
          <Card title="Auth Setup Required">
            <p className="muted">Supabase environment variables are not configured in this deployment.</p>
            <p className="muted">Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable admin auth.</p>
          </Card>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/auth/login");
  }

  // Note: Role-based access control will be added in Phase 2
  // For now, any authenticated user can access admin panel

  return (
    <main className="page-wrap">
      <PageHeader title="Admin Panel" subtitle="Operational controls and system overview." />

      <section className="cards-grid">
        <Card title="System Health">
          <p className="muted">Status: Operational</p>
        </Card>
        <Card title="Moderation">
          <p className="muted">User flags: 0</p>
          <p className="muted">Pending actions: 0</p>
        </Card>
      </section>
    </main>
  );
}
