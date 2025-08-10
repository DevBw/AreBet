import React from 'react';

export default function ErrorState({ title = 'Something went wrong', message = 'Please try again later.' }) {
  return (
    <div className="ab-error" role="alert">
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 7v6M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <div>
        <strong>{title}</strong>
        <div className="ab-error-msg">{message}</div>
      </div>
    </div>
  );
}


