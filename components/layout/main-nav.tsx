"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/auth/context";
import { signOut } from "@/lib/auth/actions";
import { FavoritesSwitcher } from "@/components/features/favorites-switcher";

const PUBLIC_LINKS = [
  { href: "/", label: "Home" },
];

const PROTECTED_LINKS = [
  { href: "/insights", label: "Insights" },
  { href: "/user/dashboard", label: "User" },
];

const COMMON_LINKS = [
  { href: "/help", label: "Help" },
];

export function MainNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = user
    ? [...PUBLIC_LINKS, ...PROTECTED_LINKS, ...COMMON_LINKS]
    : [...PUBLIC_LINKS, ...COMMON_LINKS];

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
          const isActive = pathname === link.href;
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
        <FavoritesSwitcher />
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
