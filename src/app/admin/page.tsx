import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import PendingClubCard from "@/components/PendingClubCard";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.type !== "admin") {
    redirect("/admin/login");
  }

  const db = readDb();
  const admin = db.admins.find((a) => a.id === session.id);
  const pending = db.clubs.filter((c) => c.status === "pending");
  const live = db.clubs.filter((c) => c.status === "active" || c.status === "awaiting_setup");
  const rejected = db.clubs.filter((c) => c.status === "rejected");

  return (
    <div className="flex-1">
      <header className="border-b border-[var(--line)]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl">
            Club <span className="text-lime">Boost</span>{" "}
            <span className="text-cream-dim text-sm font-normal">admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-cream-dim">{admin?.name}</span>
            <LogoutButton logoutUrl="/api/admin/logout" redirectTo="/admin/login" />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">
        <section>
          <div className="kicker mb-2">Awaiting review</div>
          <h1 className="font-display font-bold text-2xl mb-6">
            Pending clubs {pending.length > 0 && <span className="text-lime">({pending.length})</span>}
          </h1>
          {pending.length === 0 ? (
            <div className="card p-8 text-center text-cream-dim">No clubs waiting for review right now.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {pending.map((c) => (
                <PendingClubCard
                  key={c.id}
                  id={c.id}
                  clubName={c.clubName}
                  contactName={c.contactName}
                  contactRole={c.contactRole}
                  contactEmail={c.contactEmail}
                  contactPhone={c.contactPhone}
                  createdAt={c.createdAt}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="kicker mb-2">Live &amp; onboarding</div>
          <h2 className="font-display font-bold text-2xl mb-6">Clubs on the platform</h2>
          {live.length === 0 ? (
            <div className="card p-8 text-center text-cream-dim">No approved clubs yet.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {live.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/clubs/${c.id}`}
                  className="card p-5 flex items-center justify-between gap-3 hover:border-lime/50 transition-colors"
                >
                  <div>
                    <div className="font-display font-semibold">{c.clubName}</div>
                    <div className="text-xs text-cream-dim mt-1">
                      {c.sponsors.length} sponsor{c.sponsors.length === 1 ? "" : "s"} · {c.fanSignups.length} fan
                      signup{c.fanSignups.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <span
                    className="status-pill"
                    style={{
                      background: c.status === "active" ? "var(--lime)" : "var(--ink-2)",
                      color: c.status === "active" ? "#05130a" : "var(--cream-dim)",
                      border: c.status === "active" ? "none" : "1px solid var(--line)",
                    }}
                  >
                    {c.status === "active" ? "Active" : "Awaiting setup"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {rejected.length > 0 && (
          <section>
            <div className="kicker mb-2">Rejected</div>
            <div className="grid sm:grid-cols-2 gap-5">
              {rejected.map((c) => (
                <div key={c.id} className="card p-5 opacity-60">
                  <div className="font-semibold">{c.clubName}</div>
                  <div className="text-xs text-cream-dim mt-1">{c.contactEmail}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
