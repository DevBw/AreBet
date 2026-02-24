import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  meta?: ReactNode[];
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, meta, actions }: PageHeaderProps) {
  return (
    <section className="page-header">
      <div className="page-header-main">
        <p className="eyebrow">AreBet</p>
        <h1>{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        {meta?.length ? (
          <div className="meta-row">
            {meta.map((item, index) => (
              <span key={index} className="meta-pill">
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </section>
  );
}
