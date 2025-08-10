import React from 'react';

export default function Loader({ label = 'Loading', size = 'normal' }) {
  return (
    <div className={`ab-loader ab-loader-${size}`} role="status" aria-live="polite" aria-label={label}>
      <div className="ab-loader-container" aria-hidden="true">
        <span className="ab-loader-text">AreBet</span>
        <div className="ab-loader-dots">
          <span className="ab-loader-dot"></span>
          <span className="ab-loader-dot"></span>
          <span className="ab-loader-dot"></span>
        </div>
      </div>
      <span className="sr-only">{label}...</span>
    </div>
  );
}


