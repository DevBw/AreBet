"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function titleCase(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (!segments.length) return null;

  return (
    <div className="breadcrumbs-wrap">
      <div className="site-container">
        <nav className="breadcrumbs" aria-label="Breadcrumbs">
          <Link href="/">Home</Link>
          {segments.map((segment, index) => {
            const href = `/${segments.slice(0, index + 1).join("/")}`;
            const isLast = index === segments.length - 1;
            return (
              <span key={href} className="crumb">
                <span className="crumb-separator">/</span>
                {isLast ? <span aria-current="page">{titleCase(segment)}</span> : <Link href={href}>{titleCase(segment)}</Link>}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
