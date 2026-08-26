import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, findClubById, applyBrandingUpdate, type BrandingUpdatePayload } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.type !== "admin") {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await params;
  const payload = (await req.json()) as BrandingUpdatePayload;
  const db = readDb();
  const club = findClubById(db, id);
  if (!club) {
    return NextResponse.json({ error: "Club not found." }, { status: 404 });
  }

  applyBrandingUpdate(club, payload);
  writeDb(db);

  return NextResponse.json({ ok: true, slug: club.slug });
}
