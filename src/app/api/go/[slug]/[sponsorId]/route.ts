import { NextRequest, NextResponse } from "next/server";
import { recordSponsorClick } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; sponsorId: string }> }
) {
  const { slug, sponsorId } = await params;

  const result = await recordSponsorClick(slug, sponsorId, {
    id: `click-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    sponsorId,
    createdAt: new Date().toISOString(),
  });

  if (!result) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.redirect(result.linkUrl);
}
