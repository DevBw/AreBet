import React from 'react';

export default function AnalyticsPanel({ title, children, actions }) {
  return (
    <section className="ab-analytics" aria-label={title}>
      <div className="ab-analytics-header">
        <h3>{title}</h3>
        {actions && <div className="ab-analytics-actions">{actions}</div>}
      </div>
      <div className="ab-analytics-body">{children}</div>
    </section>
  );
}


