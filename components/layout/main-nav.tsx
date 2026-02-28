"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/auth/context";
import { signOut } from "@/lib/auth/actions";

const PUBLIC_LINKS = [
  { href: "/", label: "Home" },
  { href: "/widgets", label: "Football Hub" },
  { href: "/help", label: "Help" },
];

const PROTECTED_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/insights", label: "Insights" },
  { href: "/user/dashboard", label: "User" },
];

export function MainNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = user ? [...PUBLIC_LINKS.slice(0, 1), ...PROTECTED_LINKS, ...PUBLIC_LINKS.slice(1)] : PUBLIC_LINKS;

  return (
    <>
      <button
        className="nav-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-label="Toggle navigation"
      >
        <span className="nav-toggle-bar" />
      </button>

      <nav className={cn("site-nav", menuOpen && "is-open")} aria-label="Primary">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href === "/dashboard" && pathname.startsWith("/dashboard/"));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(isActive ? "is-active" : undefined)}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          );
        })}
        {!loading && (
          <>
            {user ? (
              <button
                onClick={() => signOut()}
                className="nav-auth-btn nav-auth-btn--logout"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="nav-auth-btn nav-auth-btn--login"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </>
        )}
      </nav>
    </>
  );
}
