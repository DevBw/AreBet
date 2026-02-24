import { Card } from "@/components/ui/card";
export default function AdminPage() {
  return (
    <main className="page-wrap">
      <Card>
        <h1>Access restricted</h1>
        <p className="muted">This area is reserved for internal operations.</p>
      </Card>
    </main>
  );
}
