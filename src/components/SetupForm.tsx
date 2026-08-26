"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`/api/setup/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't complete setup.");
      router.push("/club/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't complete setup.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="card p-8 space-y-4">
      <div>
        <label className="field-label">Choose a password</label>
        <input
          required
          minLength={8}
          type="password"
          className="field-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="field-label">Confirm password</label>
        <input
          required
          minLength={8}
          type="password"
          className="field-input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <button type="submit" disabled={status === "loading"} className="btn btn-lime w-full">
        {status === "loading" ? "Setting up…" : "Activate account & continue"}
      </button>
      {error && <p className="text-coral text-sm">{error}</p>}
    </form>
  );
}
