"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface PendingClubCardProps {
  id: string;
  clubName: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
}

export default function PendingClubCard(props: PendingClubCardProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejected, setRejected] = useState(false);

  async function act(action: "approve" | "reject") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clubs/${props.id}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      if (action === "approve") {
        router.push(`/admin/clubs/${props.id}`);
        router.refresh();
      } else {
        setRejected(true);
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (rejected) {
    return (
      <div className="card p-5 opacity-60">
        <div className="font-semibold">{props.clubName}</div>
        <div className="text-sm text-coral mt-1">Rejected</div>
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display font-semibold text-lg">{props.clubName}</div>
          <div className="text-sm text-cream-dim mt-0.5">
            {props.contactName} · {props.contactRole || "Contact"}
          </div>
        </div>
        <span
          className="status-pill"
          style={{ background: "var(--ink-2)", color: "var(--cream-dim)", border: "1px solid var(--line)" }}
        >
          Pending
        </span>
      </div>
      <div className="text-sm text-cream-dim space-y-0.5">
        <div>{props.contactEmail}</div>
        <div>{props.contactPhone}</div>
        <div className="text-xs mt-1">Registered {new Date(props.createdAt).toLocaleString("en-GB")}</div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => act("approve")} disabled={busy} className="btn btn-lime text-sm py-2! px-4!">
          Approve
        </button>
        <button onClick={() => act("reject")} disabled={busy} className="btn btn-outline text-sm py-2! px-4!">
          Reject
        </button>
      </div>
      {error && <p className="text-coral text-sm">{error}</p>}
    </div>
  );
}
