type ErrorStateProps = {
  title?: string;
  description?: string;
  retry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  retry,
}: ErrorStateProps) {
  return (
    <section className="panel empty-state" role="alert">
      <h2>{title}</h2>
      <p>{description}</p>
      {retry && (
        <button className="btn btn-muted mt-4" onClick={retry}>
          Try again
        </button>
      )}
    </section>
  );
}
