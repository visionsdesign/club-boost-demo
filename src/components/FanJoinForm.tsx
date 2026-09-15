"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface FanJoinFormProps {
  slug: string;
  mode: "live" | "preview";
  accent: string;
  btnText: string;
  btnRadius: string;
  doneMessage?: string;
  align?: "center" | "left";
}

type AuthMode = "join" | "login";

export default function FanJoinForm({
  slug,
  mode,
  accent,
  btnText,
  btnRadius,
  doneMessage,
  align = "left",
}: FanJoinFormProps) {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("join");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function toggleAuthMode() {
    setAuthMode((m) => (m === "join" ? "login" : "join"));
    setStatus("idle");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode !== "live") {
      setStatus("done");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const url = authMode === "join" ? `/api/fans/${slug}` : `/api/fans/${slug}/login`;
      const body = authMode === "join" ? { name, email, password } : { email, password };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
      setTimeout(() => router.refresh(), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const blockAlignClass = align === "center" ? "mx-auto" : "";

  if (status === "done") {
    return (
      <div className={`card p-6 text-left max-w-sm ${blockAlignClass}`}>
        <div className="font-semibold" style={{ color: accent }}>
          {authMode === "join" ? "You're on the list." : "Welcome back."}
        </div>
        <p className="text-sm text-cream-dim mt-1">
          {doneMessage ??
            (mode === "live"
              ? "Your offers are unlocked below."
              : "This is a preview — signups aren't saved here.")}
        </p>
      </div>
    );
  }

  return (
    <div className={`max-w-sm ${blockAlignClass} ${align === "center" ? "text-center" : "text-left"}`}>
      <form onSubmit={submit} className="space-y-3 text-left">
        {authMode === "join" && (
          <input
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field-input"
          />
        )}
        <input
          required
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
        />
        <input
          required
          type="password"
          minLength={authMode === "join" ? 6 : undefined}
          placeholder={authMode === "join" ? "Choose a password (min 6 characters)" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn w-full"
          style={{ background: accent, color: btnText, borderRadius: btnRadius }}
        >
          {status === "loading"
            ? authMode === "join"
              ? "Joining…"
              : "Checking…"
            : authMode === "join"
              ? "Join"
              : "Unlock my offers"}
        </button>
      </form>
      {status === "error" && error && <p className="text-coral text-sm mt-3">{error}</p>}
      <button type="button" onClick={toggleAuthMode} className="text-xs text-cream-dim hover:text-cream mt-3 underline">
        {authMode === "join" ? "Already registered? Log in with your email" : "New here? Register instead"}
      </button>
    </div>
  );
}
