"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/insights", label: "Insights" },
  { href: "/auth/login", label: "Login" },
  { href: "/admin", label: "Admin" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="Primary">
      {LINKS.map((link) => {
        const isActive = pathname === link.href || (link.href === "/dashboard" && pathname.startsWith("/dashboard/"));
        return (
          <Link key={link.href} href={link.href} className={cn(isActive ? "is-active" : undefined)} aria-current={isActive ? "page" : undefined}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
