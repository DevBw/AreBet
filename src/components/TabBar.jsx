import React, { useRef } from 'react';

export default function TabBar({ tabs, active, onChange, ariaLabel }) {
  const refs = useRef([]);
  function onKeyDown(e) {
    const idx = tabs.findIndex((t) => t.value === active);
    if (e.key === 'ArrowRight') {
      const next = (idx + 1) % tabs.length;
      onChange?.(tabs[next].value);
      refs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = (idx - 1 + tabs.length) % tabs.length;
      onChange?.(tabs[prev].value);
      refs.current[prev]?.focus();
    }
  }
  return (
    <div className="tab-book" role="tablist" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      {tabs.map((tab, i) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={active === tab.value}
          className={`tab-book-item ${active === tab.value ? 'is-active' : ''}`}
          onClick={() => onChange?.(tab.value)}
          ref={(el) => (refs.current[i] = el)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}


