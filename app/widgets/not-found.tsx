import { EmptyState } from "@/components/ui/empty-state";

export default function WidgetsNotFound() {
  return (
    <main className="page-wrap">
      <EmptyState
        title="Page not found"
        description="This Football Hub page does not exist."
        action={{ label: "Open Football Hub", href: "/widgets" }}
      />
    </main>
  );
}
