import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readDb } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const db = readDb();
  const club = db.clubs.find(
    (c) => c.contactEmail.toLowerCase() === String(email ?? "").toLowerCase()
  );

  if (!club || club.status !== "active" || !club.passwordHash) {
    return NextResponse.json(
      { error: "Incorrect email or password, or your club isn't active yet." },
      { status: 401 }
    );
  }

  if (!bcrypt.compareSync(String(password ?? ""), club.passwordHash)) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const token = createSessionToken({ type: "club", id: club.id });
  const res = NextResponse.json({ ok: true, slug: club.slug });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
