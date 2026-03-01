import { EmptyState } from "@/components/ui/empty-state";

export default function AdminNotFound() {
  return (
    <main className="page-wrap">
      <EmptyState
        title="Page not found"
        description="This admin page does not exist."
        action={{ label: "Admin panel", href: "/admin" }}
      />
    </main>
  );
}
