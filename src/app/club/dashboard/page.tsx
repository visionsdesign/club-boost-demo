import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { readDb, findClubById } from "@/lib/db";
import BrandingEditor from "@/components/BrandingEditor";
import LogoutButton from "@/components/LogoutButton";
import DashboardTabs from "@/components/DashboardTabs";

export default async function ClubDashboardPage() {
  const session = await getSession();
  if (!session || session.type !== "club") {
    redirect("/club/login");
  }

  const db = readDb();
  const club = findClubById(db, session.id);
  if (!club) {
    redirect("/club/login");
  }

  return (
    <div className="flex-1">
      <header className="border-b border-[var(--line)]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl">
            Club <span className="text-lime">Boost</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-cream-dim">{club.clubName}</span>
            <LogoutButton logoutUrl="/api/club/logout" redirectTo="/club/login" />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="kicker mb-2">Your club page</div>
          <h1 className="font-display font-bold text-3xl">Edit your Club Boost page</h1>
          <p className="text-cream-dim mt-2 text-sm max-w-2xl">
            Changes here update your live page at{" "}
            <span className="text-lime">clubboost.co.uk/clubs/{club.slug}</span> as soon as you save.
          </p>
        </div>

        <DashboardTabs editHref="/club/dashboard" analyticsHref="/club/dashboard/analytics" active="editor" />

        <BrandingEditor
          clubId={club.id}
          slug={club.slug}
          clubName={club.clubName}
          branding={club.branding}
          sponsors={club.sponsors}
          fansReached={club.fanSignups.length}
          saveUrl="/api/club/branding"
          publicUrl={`/clubs/${club.slug}`}
          analyticsUrl="/club/dashboard/analytics"
          allowClubNameEdit
        />
      </div>
    </div>
  );
}
