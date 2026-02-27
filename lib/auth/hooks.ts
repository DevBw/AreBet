"use client";

import { useAuth } from "./context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export { useAuth };

export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useSession() {
  const { user, loading } = useAuth();
  return { user, loading };
}

export function useRequireAuth(redirectTo: string = "/auth/login") {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, redirectTo, router]);

  return { user, loading };
}
