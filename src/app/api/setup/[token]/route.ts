import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readDb, writeDb, uniqueSlug } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json();
  const { password, slug, accentColor, buttonStyle, heroHeading, tagline, ctaText } = body ?? {};

  if (!password || String(password).length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const db = readDb();
  const club = db.clubs.find((c) => c.setupToken === token && c.status === "awaiting_setup");
  if (!club) {
    return NextResponse.json({ error: "This setup link is invalid or has already been used." }, { status: 404 });
  }

  club.passwordHash = bcrypt.hashSync(String(password), 10);
  club.status = "active";
  club.activatedAt = new Date().toISOString();
  club.setupToken = undefined;
  if (slug && typeof slug === "string" && slug.trim()) {
    club.slug = uniqueSlug(db, slug, club.id);
  }
  club.branding = {
    accentColor: accentColor || club.branding.accentColor,
    buttonTextColor: club.branding.buttonTextColor,
    buttonStyle: buttonStyle === "square" ? "square" : "round",
    heroHeading: heroHeading || club.branding.heroHeading,
    tagline: tagline || club.branding.tagline,
    ctaText: ctaText || club.branding.ctaText,
    logoDataUrl: club.branding.logoDataUrl,
    heroImageDataUrl: club.branding.heroImageDataUrl,
  };

  writeDb(db);

  const sessionToken = createSessionToken({ type: "club", id: club.id });
  const res = NextResponse.json({ ok: true, slug: club.slug });
  res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
