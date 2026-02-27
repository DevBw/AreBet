"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextInput } from "@/components/ui/text-input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const authConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const passwordValid = password.length >= 8;
  const canSubmit = emailValid && passwordValid && !loading;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!authConfigured) {
      setError("Authentication is not configured yet. Please add Supabase env variables.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="page-wrap">
      <Card className="auth-panel">
        <Image src="/arebet-logo.png" alt="AreBet" width={170} height={51} className="auth-logo" priority />
        <h1>Sign in</h1>
        <p className="muted">Access your saved matches, alerts, and preferences.</p>
        <form onSubmit={onSubmit} className="auth-form">
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            error={!emailValid && email.length > 0 ? "Enter a valid email address." : undefined}
            required
          />
          <TextInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            error={!passwordValid && password.length > 0 ? "Password must be at least 8 characters." : undefined}
            required
          />
          <Button type="submit" disabled={!canSubmit}>
            {loading ? "Signing in..." : "Continue"}
          </Button>
        </form>

        {error && (
          <div className="notice-error" role="alert" style={{ color: "red", marginTop: "1rem" }}>
            {error}
          </div>
        )}

        <p className="muted" style={{ marginTop: "1rem", textAlign: "center" }}>
          Don't have an account? <Link href="/auth/signup" style={{ color: "#22c55e" }}>Sign up</Link>
        </p>
      </Card>
    </main>
  );
}
