import { EmptyState } from "@/components/ui/empty-state";

export default function UserNotFound() {
  return (
    <main className="page-wrap">
      <EmptyState
        title="Page not found"
        description="This account page does not exist."
        action={{ label: "Go to account", href: "/user/dashboard" }}
      />
    </main>
  );
}
