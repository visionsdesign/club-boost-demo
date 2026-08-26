"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface LoginFormProps {
  submitUrl: string;
  redirectTo: string;
  demoHint?: string;
}

export default function LoginForm({ submitUrl, redirectTo, demoHint }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't log you in.");
      router.push(redirectTo);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't log you in.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="card p-8 space-y-4">
      <div>
        <label className="field-label">Email address</label>
        <input
          required
          type="email"
          className="field-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="field-label">Password</label>
        <input
          required
          type="password"
          className="field-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" disabled={status === "loading"} className="btn btn-lime w-full">
        {status === "loading" ? "Signing in…" : "Sign in"}
      </button>
      {error && <p className="text-coral text-sm">{error}</p>}
      {demoHint && (
        <div className="text-xs text-cream-dim border-t border-[var(--line)] pt-4 mt-2">
          <span className="text-lime">Demo access:</span> {demoHint}
        </div>
      )}
    </form>
  );
}
