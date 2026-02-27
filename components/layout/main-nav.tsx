"use client";

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

  const links = user ? [...PUBLIC_LINKS.slice(0, 1), ...PROTECTED_LINKS, ...PUBLIC_LINKS.slice(1)] : PUBLIC_LINKS;

  return (
    <nav className="site-nav" aria-label="Primary">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href === "/dashboard" && pathname.startsWith("/dashboard/"));
        return (
          <Link key={link.href} href={link.href} className={cn(isActive ? "is-active" : undefined)} aria-current={isActive ? "page" : undefined}>
            {link.label}
          </Link>
        );
      })}
      {!loading && (
        <>
          {user ? (
            <button
              onClick={() => signOut()}
              className="site-nav-button"
              style={{ marginLeft: "1rem", cursor: "pointer", border: "1px solid #22c55e", padding: "0.5rem 1rem", borderRadius: "4px", background: "transparent", color: "#22c55e" }}
            >
              Logout
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="site-nav-button"
              style={{ marginLeft: "1rem", padding: "0.5rem 1rem", borderRadius: "4px", background: "#22c55e", color: "black", textDecoration: "none" }}
            >
              Login
            </Link>
          )}
        </>
      )}
    </nav>
  );
}
