import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { readDb, findClubById } from "@/lib/db";
import { buildAnalytics } from "@/lib/analytics";
import AnalyticsView from "@/components/AnalyticsView";
import LogoutButton from "@/components/LogoutButton";
import DashboardTabs from "@/components/DashboardTabs";

export default async function ClubAnalyticsPage() {
  const session = await getSession();
  if (!session || session.type !== "club") {
    redirect("/club/login");
  }

  const db = await readDb();
  const club = findClubById(db, session.id);
  if (!club) {
    redirect("/club/login");
  }

  const analytics = buildAnalytics(club);

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
          <h1 className="font-display font-bold text-3xl">Analytics</h1>
          <p className="text-cream-dim mt-2 text-sm max-w-2xl">
            How fans and sponsors are engaging with{" "}
            <span className="text-lime">clubboost.co.uk/clubs/{club.slug}</span>.
          </p>
        </div>

        <DashboardTabs editHref="/club/dashboard" analyticsHref="/club/dashboard/analytics" active="analytics" />

        <AnalyticsView analytics={analytics} />
      </div>
    </div>
  );
}
