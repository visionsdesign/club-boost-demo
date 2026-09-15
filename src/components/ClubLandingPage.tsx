"use client";

import type { Branding, Sponsor } from "@/lib/types";
import { pageThemeVars } from "@/lib/theme";
import FanJoinForm from "./FanJoinForm";

export interface ClubLandingPageProps {
  slug: string;
  clubName: string;
  branding: Branding;
  sponsors: Sponsor[];
  mode: "live" | "preview";
  isFan?: boolean;
}

function radiusFor(style: Branding["buttonStyle"]) {
  return style === "square" ? "10px" : "100px";
}

export default function ClubLandingPage({
  slug,
  clubName,
  branding,
  sponsors,
  mode,
  isFan = false,
}: ClubLandingPageProps) {
  const accent = branding.accentColor || "#c6ff3d";
  const btnText = branding.buttonTextColor || "#05130a";
  const btnRadius = radiusFor(branding.buttonStyle);

  return (
    <div
      className="min-h-full bg-ink text-cream"
      style={{ ["--club-accent" as string]: accent, ...pageThemeVars(branding.pageBackground) }}
    >
      {/* Nav */}
      <header className="border-b border-[var(--line)]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={branding.logoDataUrl} alt={clubName} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center font-display font-bold text-sm"
                style={{ background: accent, color: "#05130a" }}
              >
                {clubName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="font-display font-bold text-lg">{clubName}</div>
            <span className="text-cream-dim text-xs hidden sm:inline">× Club Boost</span>
          </div>
          <a
            href="#offers"
            className="btn"
            style={{ background: accent, color: btnText, borderRadius: btnRadius }}
          >
            {branding.ctaText || "Get our fan offers"}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section
        className={
          branding.heroImageDataUrl ? "bg-cover bg-center border-0" : "bg-grid border-b border-[var(--line)]"
        }
        style={
          branding.heroImageDataUrl
            ? {
                backgroundImage:
                  branding.pageBackground === "light"
                    ? `linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.92)), url(${branding.heroImageDataUrl})`
                    : `linear-gradient(180deg, rgba(10,10,11,0.55), rgba(10,10,11,0.92)), url(${branding.heroImageDataUrl})`,
              }
            : undefined
        }
      >
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center">
          <div className="kicker mb-4" style={{ color: accent }}>
            {clubName} fan offers
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl leading-tight max-w-3xl mx-auto">
            {branding.heroHeading}
          </h1>
          <p className="mt-5 text-cream-dim max-w-xl mx-auto">{branding.tagline}</p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#offers"
              className="btn"
              style={{ background: accent, color: btnText, borderRadius: btnRadius }}
            >
              {branding.ctaText || "Get our fan offers"}
            </a>
            <a
              href="#join"
              className="btn"
              style={{
                background: btnText,
                color: accent,
                border: `1px solid ${accent}`,
                borderRadius: btnRadius,
              }}
            >
              Join the club list
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      {(branding.aboutHtml || branding.aboutImageDataUrl || branding.logoDataUrl) && (
        <section className="border-b border-[var(--line)]">
          <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="kicker mb-3" style={{ color: accent }}>
                About {clubName}
              </div>
              {branding.aboutHtml ? (
                <div
                  className="prose-info text-cream-dim leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: branding.aboutHtml }}
                />
              ) : (
                <p className="text-cream-dim leading-relaxed">
                  {clubName} has teamed up with Club Boost to give sponsors real, measurable value — and fans
                  genuinely useful offers in return.
                </p>
              )}
            </div>
            <div className="aspect-[4/3] rounded-[var(--radius)] overflow-hidden bg-ink-2 border border-[var(--line)]">
              {branding.aboutImageDataUrl || branding.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={branding.aboutImageDataUrl || branding.logoDataUrl}
                  alt={clubName}
                  className={`w-full h-full ${branding.aboutImageDataUrl ? "object-cover" : "object-contain p-10"}`}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center font-display font-bold text-4xl"
                  style={{ color: accent }}
                >
                  {clubName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Offers */}
      <section id="offers" className="max-w-5xl mx-auto px-6 py-16">
        <div className="kicker mb-2" style={{ color: accent }}>
          Official partners
        </div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl mb-8">
          Every deal here is tracked — so {clubName} can prove what it&apos;s worth.
        </h2>

        {sponsors.length === 0 ? (
          <div className="card p-8 text-center text-cream-dim">
            No partner offers have been added yet. Check back soon.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="card p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  {sponsor.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sponsor.logoDataUrl}
                      alt={sponsor.name}
                      className="w-full h-20 object-contain object-left"
                    />
                  ) : (
                    <div className="w-full h-20 flex items-center justify-start text-sm font-semibold text-cream-dim">
                      {sponsor.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{sponsor.name}</div>
                    <span
                      className="status-pill"
                      style={{
                        background: sponsor.tier === "principal" ? accent : "var(--ink-2)",
                        color: sponsor.tier === "principal" ? "#05130a" : "var(--cream-dim)",
                        border: sponsor.tier === "principal" ? "none" : "1px solid var(--line)",
                      }}
                    >
                      {sponsor.tier === "principal" ? "Principal partner" : "Partner"}
                    </span>
                  </div>
                </div>
                <div>
                  {sponsor.offers.length === 0 ? (
                    <p className="text-sm text-cream-dim">No offers added yet.</p>
                  ) : sponsor.offers.length === 1 ? (
                    <>
                      <div className="font-display font-semibold text-lg">{sponsor.offers[0].title}</div>
                      <p className="text-sm text-cream-dim mt-1">{sponsor.offers[0].description}</p>
                    </>
                  ) : (
                    <p className="text-sm text-cream-dim">{sponsor.offers.length} offers available</p>
                  )}
                </div>
                <a
                  href={mode === "live" ? `/clubs/${slug}/${sponsor.slug}` : sponsor.offers[0]?.linkUrl || "#"}
                  target={mode === "live" ? undefined : "_blank"}
                  rel="noreferrer"
                  className="btn btn-outline btn-brand-hover self-start mt-auto"
                  style={{ borderRadius: btnRadius }}
                >
                  {sponsor.offers.length > 1 ? "View offers →" : "View offer →"}
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Fan signup */}
      <section id="join" className="border-t border-[var(--line)] bg-surface/40">
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          {isFan ? (
            <>
              <h2 className="font-display font-bold text-2xl sm:text-3xl">You&apos;re on the list.</h2>
              <p className="text-cream-dim mt-3">
                Every {clubName} partner offer is unlocked — just visit any partner&apos;s page above and claim
                it.
              </p>
              <div className="mt-8 card p-6 max-w-md mx-auto text-left">
                <div className="font-semibold" style={{ color: accent }}>
                  ✓ Offers unlocked
                </div>
                <p className="text-sm text-cream-dim mt-1">
                  We recognise this browser as a registered {clubName} fan.
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display font-bold text-2xl sm:text-3xl">Join the {clubName} fan list.</h2>
              <p className="text-cream-dim mt-3">
                Register once with Club Boost to unlock every current and future partner offer — and go into
                the club&apos;s prize pot draw.
              </p>

              <div className="mt-8">
                <FanJoinForm
                  slug={slug}
                  mode={mode}
                  accent={accent}
                  btnText={btnText}
                  btnRadius={btnRadius}
                  doneMessage="We've logged your details — your partner offers are unlocked, just visit any partner's page."
                />
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="border-t border-[var(--line)]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream-dim">
          <div>
            {clubName} is powered by{" "}
            <span className="font-semibold" style={{ color: "var(--lime)" }}>
              Club Boost
            </span>
          </div>
          <div>Every click on this page carries a tracked referral code back to Club Boost.</div>
        </div>
      </footer>
    </div>
  );
}
