"use client";

import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "arebet:theme:v1";
export type Theme = "dark" | "light";

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch { /* storage unavailable */ }
  // Notify other hook instances on the same page
  window.dispatchEvent(new CustomEvent("arebet:theme", { detail: theme }));
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  // Hydrate from localStorage once on mount
  useEffect(() => {
    const stored = readStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  // Stay in sync when another instance calls applyTheme
  useEffect(() => {
    function onThemeChange(e: Event) {
      setTheme((e as CustomEvent<Theme>).detail);
    }
    window.addEventListener("arebet:theme", onThemeChange);
    return () => window.removeEventListener("arebet:theme", onThemeChange);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }, [theme]);

  return { theme, toggleTheme };
}
