import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, uniqueSlug } from "@/lib/db";
import type { Club } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clubName, contactName, contactRole, contactEmail, contactPhone } = body ?? {};

  if (!clubName || !contactName || !contactEmail || !contactPhone) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  const db = await readDb();

  const alreadyExists = db.clubs.some(
    (c) => c.contactEmail.toLowerCase() === String(contactEmail).toLowerCase()
  );
  if (alreadyExists) {
    return NextResponse.json(
      { error: "A club has already registered interest with this email address." },
      { status: 409 }
    );
  }

  const id = `club-${Date.now()}-${Math.round(Math.random() * 1000)}`;
  const club: Club = {
    id,
    slug: uniqueSlug(db, clubName),
    clubName,
    contactName,
    contactRole: contactRole || "Club Contact",
    contactEmail,
    contactPhone,
    status: "pending",
    createdAt: new Date().toISOString(),
    branding: {
      accentColor: "#c6ff3d",
      buttonTextColor: "#05130a",
      buttonStyle: "round",
      heroHeading: `${clubName} × Club Boost`,
      tagline: "We're setting up our fan offers — check back soon.",
      ctaText: "Get our fan offers",
    },
    sponsors: [],
    fanSignups: [],
    clickEvents: [],
  };

  db.clubs.push(club);
  await writeDb(db);

  return NextResponse.json({ ok: true, clubId: club.id });
}
