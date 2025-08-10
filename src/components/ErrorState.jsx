import React from 'react';

export default function ErrorState({ title, message, icon = '⚽', action, className = '' }) {
  return (
    <div className={`ab-error-state ${className}`} role="alert" aria-live="polite">
      <div className="ab-error-icon" aria-hidden="true">{icon}</div>
      <div className="ab-error-content">
        {title && <h3 className="ab-error-title">{title}</h3>}
        {message && <p className="ab-error-message">{message}</p>}
        {action && <div className="ab-error-action">{action}</div>}
      </div>
    </div>
  );
}


