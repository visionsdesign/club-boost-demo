import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { readDb, findClubById } from "@/lib/db";
import BrandingEditor from "@/components/BrandingEditor";
import CopyField from "@/components/CopyField";
import DashboardTabs from "@/components/DashboardTabs";

export default async function AdminClubEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.type !== "admin") {
    redirect("/admin/login");
  }

  const { id } = await params;
  const db = await readDb();
  const club = findClubById(db, id);
  if (!club) notFound();

  const hdrs = await headers();
  const origin = `${hdrs.get("x-forwarded-proto") || "http"}://${hdrs.get("host")}`;
  const setupUrl = club.setupToken ? `${origin}/setup/${club.setupToken}` : null;

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
          <div className="kicker mb-2">Editing as admin</div>
          <h1 className="font-display font-bold text-3xl">{club.clubName}</h1>
          <p className="text-cream-dim mt-2 text-sm">
            {club.contactName} · {club.contactEmail} · {club.contactPhone}
          </p>
        </div>

        {setupUrl && (
          <div className="card p-5 mb-8 border-lime/40 bg-lime/5 space-y-2">
            <div className="text-lime font-semibold text-sm">Awaiting club setup</div>
            <p className="text-cream-dim text-xs">
              {club.clubName} hasn&apos;t activated their account yet. In production this link is emailed to them
              automatically — for the demo, copy it and open it as the club to set a password and continue.
            </p>
            <CopyField value={setupUrl} />
          </div>
        )}

        <DashboardTabs
          editHref={`/admin/clubs/${club.id}`}
          analyticsHref={`/admin/clubs/${club.id}/analytics`}
          active="editor"
        />

        <BrandingEditor
          clubId={club.id}
          slug={club.slug}
          clubName={club.clubName}
          branding={club.branding}
          sponsors={club.sponsors}
          fansReached={club.fanSignups.length}
          saveUrl={`/api/admin/clubs/${club.id}/branding`}
          publicUrl={`/clubs/${club.slug}`}
          analyticsUrl={`/admin/clubs/${club.id}/analytics`}
        />
      </div>
    </div>
  );
}
