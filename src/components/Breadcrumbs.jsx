import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumbs({ items = [], className = '' }) {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from location if no items provided
  const breadcrumbs = items.length > 0 ? items : generateBreadcrumbs(location.pathname);
  
  if (breadcrumbs.length <= 1) return null;
  
  return (
    <nav className={`ab-breadcrumbs ${className}`} aria-label="Breadcrumb">
      <ol>
        {breadcrumbs.map((item, index) => (
          <li key={item.path || index}>
            {index === breadcrumbs.length - 1 ? (
              <span className="ab-breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link to={item.path} className="ab-breadcrumb-link">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function generateBreadcrumbs(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', path: '/dashboard' }];
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/([A-Z])/g, ' $1');
    breadcrumbs.push({ label, path: currentPath });
  });
  
  return breadcrumbs;
}


