import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { readDb, findClubById } from "@/lib/db";
import { buildAnalytics } from "@/lib/analytics";
import AnalyticsView from "@/components/AnalyticsView";
import DashboardTabs from "@/components/DashboardTabs";

export default async function AdminClubAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.type !== "admin") {
    redirect("/admin/login");
  }

  const { id } = await params;
  const db = readDb();
  const club = findClubById(db, id);
  if (!club) notFound();

  const analytics = buildAnalytics(club);

  return (
    <div className="flex-1">
      <header className="border-b border-[var(--line)]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/admin" className="text-sm text-cream-dim hover:text-cream">
            ← Back to admin
          </Link>
          <span
            className="status-pill"
            style={{
              background: club.status === "active" ? "var(--lime)" : "var(--ink-2)",
              color: club.status === "active" ? "#05130a" : "var(--cream-dim)",
              border: club.status === "active" ? "none" : "1px solid var(--line)",
            }}
          >
            {club.status === "active" ? "Active" : "Awaiting club setup"}
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="kicker mb-2">Viewing as admin</div>
          <h1 className="font-display font-bold text-3xl">{club.clubName} — Analytics</h1>
          <p className="text-cream-dim mt-2 text-sm">
            {club.contactName} · {club.contactEmail} · {club.contactPhone}
          </p>
        </div>

        <DashboardTabs
          editHref={`/admin/clubs/${club.id}`}
          analyticsHref={`/admin/clubs/${club.id}/analytics`}
          active="analytics"
        />

        <AnalyticsView analytics={analytics} />
      </div>
    </div>
  );
}
