import type { Club } from "./types";

export interface DayBucket {
  date: string;
  label: string;
  count: number;
}

export interface SponsorBreakdown {
  id: string;
  name: string;
  tier: string;
  clicks: number;
  share: number;
}

export interface RecentClick {
  id: string;
  sponsorName: string;
  createdAt: string;
}

export interface ClubAnalytics {
  totals: {
    fansReached: number;
    totalClicks: number;
    liveOffers: number;
    avgClicksPerOffer: number;
  };
  sponsorBreakdown: SponsorBreakdown[];
  dailySignups: DayBucket[];
  dailyClicks: DayBucket[];
  recentSignups: Club["fanSignups"];
  recentClicks: RecentClick[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 14;

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function last14Days(now: Date): { date: string; label: string }[] {
  const days: { date: string; label: string }[] = [];
  for (let i = WINDOW_DAYS - 1; i >= 0; i -= 1) {
    const d = new Date(now.getTime() - i * DAY_MS);
    const date = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
    days.push({ date, label });
  }
  return days;
}

function bucketByDay(dates: string[], now: Date): DayBucket[] {
  const counts = new Map<string, number>();
  for (const iso of dates) {
    const key = dayKey(iso);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return last14Days(now).map(({ date, label }) => ({
    date,
    label,
    count: counts.get(date) ?? 0,
  }));
}

function sponsorClicks(sponsor: Club["sponsors"][number]): number {
  return sponsor.offers.reduce((sum, o) => sum + o.clicks, 0);
}

export function buildAnalytics(club: Club, now: Date = new Date()): ClubAnalytics {
  const totalClicks = club.sponsors.reduce((sum, s) => sum + sponsorClicks(s), 0);
  const liveOffers = club.sponsors.reduce((sum, s) => sum + s.offers.length, 0);

  const sponsorBreakdown: SponsorBreakdown[] = [...club.sponsors]
    .map((s) => ({ sponsor: s, clicks: sponsorClicks(s) }))
    .sort((a, b) => b.clicks - a.clicks)
    .map(({ sponsor: s, clicks }) => ({
      id: s.id,
      name: s.name || "Untitled sponsor",
      tier: s.tier,
      clicks,
      share: totalClicks > 0 ? Math.round((clicks / totalClicks) * 100) : 0,
    }));

  const sponsorNameById = new Map(club.sponsors.map((s) => [s.id, s.name || "Untitled sponsor"]));

  const recentClicks: RecentClick[] = [...club.clickEvents]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)
    .map((e) => ({
      id: e.id,
      sponsorName: sponsorNameById.get(e.sponsorId) ?? "Removed sponsor",
      createdAt: e.createdAt,
    }));

  const recentSignups = [...club.fanSignups]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  return {
    totals: {
      fansReached: club.fanSignups.length,
      totalClicks,
      liveOffers,
      avgClicksPerOffer: liveOffers > 0 ? Math.round((totalClicks / liveOffers) * 10) / 10 : 0,
    },
    sponsorBreakdown,
    dailySignups: bucketByDay(
      club.fanSignups.map((f) => f.createdAt),
      now
    ),
    dailyClicks: bucketByDay(
      club.clickEvents.map((e) => e.createdAt),
      now
    ),
    recentSignups,
    recentClicks,
  };
}
