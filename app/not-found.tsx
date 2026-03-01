import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <main className="page-wrap">
      <EmptyState
        title="Page not found"
        description="The page you are looking for doesn't exist or has been moved."
        action={{ label: "Go home", href: "/" }}
      />
      <p className="muted" style={{ textAlign: "center", marginTop: "1rem" }}>
        Or try the <Link href="/dashboard">Dashboard</Link> or <Link href="/help">Help / FAQ</Link>.
      </p>
    </main>
  );
}
