import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readDb } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const db = await readDb();
  const admin = db.admins.find((a) => a.email.toLowerCase() === String(email ?? "").toLowerCase());

  if (!admin || !bcrypt.compareSync(String(password ?? ""), admin.passwordHash)) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const token = createSessionToken({ type: "admin", id: admin.id });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
