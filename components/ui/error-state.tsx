import Link from "next/link";

type ErrorStateProps = {
  title?: string;
  description?: string;
  retry?: () => void;
  backHref?: string;
  backLabel?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  retry,
  backHref,
  backLabel = "Go back",
}: ErrorStateProps) {
  return (
    <section className="panel empty-state" role="alert">
      <h2>{title}</h2>
      <p>{description}</p>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        {retry && (
          <button className="btn btn-primary" onClick={retry}>
            Try again
          </button>
        )}
        {backHref && (
          <Link href={backHref} className="btn btn-muted">
            {backLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
