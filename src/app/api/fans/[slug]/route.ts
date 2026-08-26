import { NextRequest, NextResponse } from "next/server";
import { appendFanSignup } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { name, email } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const ok = await appendFanSignup(slug, {
    id: `fan-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    name,
    email,
    createdAt: new Date().toISOString(),
  });

  if (!ok) {
    return NextResponse.json({ error: "Club not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
