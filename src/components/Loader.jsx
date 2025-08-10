import React from 'react';

export default function Loader({ label = 'Loading' }) {
  return (
    <div className="ab-loader" role="status" aria-live="polite" aria-label={label}>
      <span aria-hidden="true" className="ab-loader-pulse">AreBet</span>
      <span className="sr-only">{label}...</span>
    </div>
  );
}


