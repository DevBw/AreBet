"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextInput } from "@/components/ui/text-input";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = emailValid && passwordValid && passwordsMatch && !loading;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
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
        <h1>Create Account</h1>
        <p className="muted">Start tracking matches, odds, and insights.</p>
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
          <TextInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            error={!passwordsMatch && confirmPassword.length > 0 ? "Passwords do not match." : undefined}
            required
          />
          <Button type="submit" disabled={!canSubmit}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        {error && (
          <div className="notice-error" role="alert" style={{ color: "red", marginTop: "1rem" }}>
            {error}
          </div>
        )}

        <p className="muted" style={{ marginTop: "1rem", textAlign: "center" }}>
          Already have an account? <Link href="/auth/login" style={{ color: "#22c55e" }}>Sign in</Link>
        </p>
      </Card>
    </main>
  );
}
