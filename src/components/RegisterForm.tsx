"use client";

import { useState } from "react";

export default function RegisterForm() {
  const [form, setForm] = useState({
    clubName: "",
    contactName: "",
    contactRole: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="card p-8 text-center max-w-lg mx-auto">
        <div className="font-display font-bold text-xl text-lime">Interest registered.</div>
        <p className="text-cream-dim mt-3">
          Thanks — a Club Boost admin will review your details and be in touch to verify your club before your
          account goes live.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-8 max-w-lg mx-auto space-y-4 text-left">
      <div>
        <label className="field-label">Club name</label>
        <input
          required
          className="field-input"
          value={form.clubName}
          onChange={(e) => set("clubName", e.target.value)}
          placeholder="e.g. Chester FC"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Your name</label>
          <input
            required
            className="field-input"
            value={form.contactName}
            onChange={(e) => set("contactName", e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Your role at the club</label>
          <input
            className="field-input"
            value={form.contactRole}
            onChange={(e) => set("contactRole", e.target.value)}
            placeholder="e.g. Club Secretary"
          />
        </div>
      </div>
      <div>
        <label className="field-label">Email address</label>
        <input
          required
          type="email"
          className="field-input"
          value={form.contactEmail}
          onChange={(e) => set("contactEmail", e.target.value)}
        />
      </div>
      <div>
        <label className="field-label">Phone number</label>
        <input
          required
          className="field-input"
          value={form.contactPhone}
          onChange={(e) => set("contactPhone", e.target.value)}
        />
      </div>
      <button type="submit" disabled={status === "loading"} className="btn btn-lime w-full">
        {status === "loading" ? "Submitting…" : "Register interest"}
      </button>
      {error && <p className="text-coral text-sm">{error}</p>}
      <p className="text-xs text-cream-dim">
        This is a manual, vetted sign-up — a Club Boost admin approves every club before it goes live.
      </p>
    </form>
  );
}
