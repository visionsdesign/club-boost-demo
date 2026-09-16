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

  function switchTo(next: AuthMode) {
    if (next === authMode) return;
    setAuthMode(next);
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
  const justifyClass = align === "center" ? "justify-center" : "justify-start";

  if (status === "done") {
    return (
      <div className={`card p-6 text-left w-full ${blockAlignClass}`}>
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
    <div className={`w-full ${blockAlignClass} text-left`}>
      {/* Tab switcher */}
      <div className={`flex ${justifyClass} mb-4`}>
        <div className="inline-flex rounded-full border border-[var(--line)] p-1 bg-ink-2">
          <button
            type="button"
            onClick={() => switchTo("join")}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
            style={
              authMode === "join"
                ? { background: accent, color: btnText }
                : { background: "transparent", color: "var(--cream-dim)" }
            }
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={() => switchTo("login")}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
            style={
              authMode === "login"
                ? { background: accent, color: btnText }
                : { background: "transparent", color: "var(--cream-dim)" }
            }
          >
            Log in
          </button>
        </div>
      </div>

      <p className={`text-xs text-cream-dim mb-4 ${align === "center" ? "text-center" : "text-left"}`}>
        {authMode === "join"
          ? "New here? Create an account to unlock every partner offer."
          : "Already registered? Enter your email and password to unlock your offers again."}
      </p>

      <form onSubmit={submit} className="space-y-3">
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
    </div>
  );
}
