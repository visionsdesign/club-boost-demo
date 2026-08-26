import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, findClubById } from "@/lib/db";
import { getSession, randomToken } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.type !== "admin") {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await params;
  const db = readDb();
  const club = findClubById(db, id);
  if (!club) {
    return NextResponse.json({ error: "Club not found." }, { status: 404 });
  }
  if (club.status !== "pending") {
    return NextResponse.json({ error: "This club has already been reviewed." }, { status: 409 });
  }

  club.status = "awaiting_setup";
  club.approvedAt = new Date().toISOString();
  club.setupToken = randomToken();

  writeDb(db);

  return NextResponse.json({ ok: true, setupToken: club.setupToken });
}
