import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, findClubById, applyBrandingUpdate, type BrandingUpdatePayload } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.type !== "club") {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const payload = (await req.json()) as BrandingUpdatePayload;
  const db = await readDb();
  const club = findClubById(db, session.id);
  if (!club) {
    return NextResponse.json({ error: "Club not found." }, { status: 404 });
  }

  applyBrandingUpdate(club, payload);
  await writeDb(db);

  return NextResponse.json({ ok: true, slug: club.slug });
}
