import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: { label: string; href: string };
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="panel empty-state" role="status">
      <h2>{title}</h2>
      <p>{description}</p>
      {action && (
        <Link href={action.href} className="btn btn-primary mt-4">
          {action.label}
        </Link>
      )}
    </section>
  );
}
