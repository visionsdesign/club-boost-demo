import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, findClubBySlug } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; sponsorId: string }> }
) {
  const { slug, sponsorId } = await params;
  const db = readDb();
  const club = findClubBySlug(db, slug);
  const sponsor = club?.sponsors.find((s) => s.id === sponsorId);

  if (!club || !sponsor) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  sponsor.clicks += 1;
  club.clickEvents.push({
    id: `click-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    sponsorId: sponsor.id,
    createdAt: new Date().toISOString(),
  });
  writeDb(db);

  return NextResponse.redirect(sponsor.linkUrl);
}
