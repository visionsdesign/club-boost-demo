import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readDb, findClubBySlug, findFanByEmail } from "@/lib/db";
import { FAN_COOKIE_NAME, parseFanClubs } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const db = await readDb();
  const club = findClubBySlug(db, slug);
  if (!club) {
    return NextResponse.json({ error: "Club not found." }, { status: 404 });
  }

  const fan = findFanByEmail(club, String(email));
  const invalid = () =>
    NextResponse.json(
      { error: "Incorrect email or password — or you registered before passwords existed. Register below to set one." },
      { status: 401 }
    );

  if (!fan || !fan.passwordHash) return invalid();
  if (!bcrypt.compareSync(String(password), fan.passwordHash)) return invalid();

  const res = NextResponse.json({ ok: true });
  const clubs = parseFanClubs(req.cookies.get(FAN_COOKIE_NAME)?.value);
  if (!clubs.includes(slug)) clubs.push(slug);
  res.cookies.set(FAN_COOKIE_NAME, encodeURIComponent(JSON.stringify(clubs)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
