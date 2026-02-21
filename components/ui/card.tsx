import { cn } from "@/lib/utils/cn";

type CardProps = {
  title?: string;
  className?: string;
  children: React.ReactNode;
};

export function Card({ title, className, children }: CardProps) {
  return (
    <section className={cn("panel", className)}>
      {title ? <h3 className="card-title">{title}</h3> : null}
      {children}
    </section>
  );
}
