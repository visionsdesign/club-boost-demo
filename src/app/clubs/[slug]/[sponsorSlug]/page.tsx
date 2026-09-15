import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { readDb, findClubBySlug, findSponsorBySlug } from "@/lib/db";

function radiusFor(style: "round" | "square") {
  return style === "square" ? "10px" : "100px";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; sponsorSlug: string }>;
}): Promise<Metadata> {
  const { slug, sponsorSlug } = await params;
  const db = await readDb();
  const club = findClubBySlug(db, slug);
  const sponsor = club ? findSponsorBySlug(club, sponsorSlug) : undefined;
  return {
    title: sponsor && club ? `${sponsor.name} × ${club.clubName} | Club Boost` : "Partner not found",
  };
}

export default async function SponsorPage({
  params,
}: {
  params: Promise<{ slug: string; sponsorSlug: string }>;
}) {
  const { slug, sponsorSlug } = await params;
  const db = await readDb();
  const club = findClubBySlug(db, slug);
  if (!club || club.status !== "active") notFound();

  const sponsor = findSponsorBySlug(club, sponsorSlug);
  if (!sponsor) notFound();

  const accent = club.branding.accentColor || "#c6ff3d";
  const btnText = club.branding.buttonTextColor || "#05130a";
  const btnRadius = radiusFor(club.branding.buttonStyle);

  return (
    <div className="min-h-full bg-ink text-cream">
      <header className="border-b border-[var(--line)]">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href={`/clubs/${slug}`} className="flex items-center gap-3">
            {club.branding.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={club.branding.logoDataUrl}
                alt={club.clubName}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center font-display font-bold text-sm"
                style={{ background: accent, color: "#05130a" }}
              >
                {club.clubName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="font-display font-bold text-lg">{club.clubName}</div>
          </Link>
          <Link href={`/clubs/${slug}#offers`} className="text-sm text-cream-dim hover:text-cream">
            ← All partners
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 pt-10 pb-2">
        <div className="kicker mb-4" style={{ color: accent }}>
          {sponsor.tier === "principal" ? "Principal partner" : "Partner"} · {club.clubName}
        </div>

        <div className="flex items-center gap-4">
          {sponsor.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sponsor.logoDataUrl}
              alt={sponsor.name}
              className="h-16 w-16 rounded-xl object-cover bg-white/5"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-ink-2 flex items-center justify-center text-lg font-semibold text-cream-dim">
              {sponsor.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl">{sponsor.name}</h1>
        </div>
      </div>

      {sponsor.bannerImageDataUrl && (
        <div className="mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sponsor.bannerImageDataUrl}
            alt={`${sponsor.name} banner`}
            className="w-full max-h-[420px] object-cover"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {sponsor.infoHtml && (
          <div>
            <div className="kicker mb-3" style={{ color: accent }}>
              About {sponsor.name}
            </div>
            <div
              className="prose-info text-cream-dim leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sponsor.infoHtml }}
            />
          </div>
        )}

        <div>
          <div className="kicker mb-3" style={{ color: accent }}>
            {sponsor.offers.length > 1 ? "Offers" : "Offer"}
          </div>

          {sponsor.offers.length === 0 ? (
            <div className="card p-8 text-center text-cream-dim">No offers have been added yet.</div>
          ) : (
            <div className="space-y-5">
              {sponsor.offers.map((offer) => (
                <div key={offer.id} className="card p-8">
                  <div className="font-display font-bold text-2xl sm:text-3xl leading-snug">{offer.title}</div>
                  <p className="text-cream-dim mt-4 text-lg leading-relaxed">{offer.description}</p>
                  <a
                    href={`/api/go/${slug}/${sponsor.id}/${offer.id}`}
                    className="btn mt-8"
                    style={{ background: accent, color: btnText, borderRadius: btnRadius }}
                  >
                    Claim this offer →
                  </a>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-cream-dim mt-4">
            Every click here is tracked back to {club.clubName}, so they can prove exactly what this
            partnership is worth.
          </p>
        </div>

        <div className="text-center">
          <Link href={`/clubs/${slug}#offers`} className="text-sm hover:underline" style={{ color: accent }}>
            ← Back to all {club.clubName} partners
          </Link>
        </div>
      </div>

      <footer className="border-t border-[var(--line)]">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center text-xs text-cream-dim">
          {club.clubName} is powered by <span className="text-lime font-semibold">Club Boost</span>
        </div>
      </footer>
    </div>
  );
}
