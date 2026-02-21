"use client";

import { useMemo, useState } from "react";

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
      <section className="auth-panel panel">
        <h1>Login</h1>
        <p className="muted">Front-end validation only. Backend auth wiring is intentionally deferred.</p>
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          {!emailValid && email.length > 0 && <p className="field-error">Enter a valid email address.</p>}

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </label>
          {!passwordValid && password.length > 0 && <p className="field-error">Password must be at least 8 characters.</p>}

          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            Continue
          </button>
        </form>

        {submitted && canSubmit && (
          <div className="notice-success" role="status">
            Form validated successfully. Auth integration is next.
          </div>
        )}
      </section>
    </main>
  );
}
