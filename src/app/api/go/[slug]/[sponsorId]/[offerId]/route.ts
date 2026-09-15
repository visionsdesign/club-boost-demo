import { NextRequest, NextResponse } from "next/server";
import { recordOfferClick } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; sponsorId: string; offerId: string }> }
) {
  const { slug, sponsorId, offerId } = await params;

  const result = await recordOfferClick(slug, sponsorId, offerId, {
    id: `click-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    sponsorId,
    offerId,
    createdAt: new Date().toISOString(),
  });

  if (!result) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.redirect(result.linkUrl);
}
