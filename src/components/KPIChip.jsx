import React from 'react';

export default function KPIChip({ label, value, tone = 'neutral', title, size = 'normal' }) {
  return (
    <div 
      className={`ab-kpi ab-kpi-${tone} ab-kpi-${size}`} 
      role="note" 
      aria-label={`${label} ${value}`} 
      title={title}
    >
      <span className="ab-kpi-label">{String(label).toUpperCase()}</span>
      <strong className="ab-kpi-value">{value}</strong>
    </div>
  );
}


