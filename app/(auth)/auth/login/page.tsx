"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextInput } from "@/components/ui/text-input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const passwordValid = password.length >= 8;
  const canSubmit = emailValid && passwordValid;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="page-wrap">
      <Card className="auth-panel">
        <h1>Login</h1>
        <p className="muted">Front-end validation only. Backend auth wiring is intentionally deferred.</p>
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
            Continue
          </Button>
        </form>

        {submitted && canSubmit && (
          <div className="notice-success" role="status">
            Form validated successfully. Auth integration is next.
          </div>
        )}
      </Card>
    </main>
  );
}
