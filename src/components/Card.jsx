import React from 'react';

export default function Card({ title, children, footer, className = '', ariaLabel }) {
  return (
    <section className={`ab-card ${className}`} aria-label={ariaLabel}>
      {title && <h3 className="ab-card-title">{title}</h3>}
      <div className="ab-card-body">{children}</div>
      {footer && <div className="ab-card-footer">{footer}</div>}
    </section>
  );
}


