import React from 'react';

export default function Card({ title, children, footer, className = '', ariaLabel, onClick, interactive = false }) {
  return (
    <section 
      className={`ab-card ${interactive ? 'ab-card-interactive' : ''} ${className}`} 
      aria-label={ariaLabel}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {title && <h3 className="ab-card-title">{title}</h3>}
      <div className="ab-card-body">{children}</div>
      {footer && <div className="ab-card-footer">{footer}</div>}
    </section>
  );
}


