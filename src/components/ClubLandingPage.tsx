"use client";

import { useState } from "react";
import type { Branding, Sponsor } from "@/lib/types";

export interface ClubLandingPageProps {
  slug: string;
  clubName: string;
  branding: Branding;
  sponsors: Sponsor[];
  fansReached: number;
  mode: "live" | "preview";
}

function radiusFor(style: Branding["buttonStyle"]) {
  return style === "square" ? "10px" : "100px";
}

export default function ClubLandingPage({
  slug,
  clubName,
  branding,
  sponsors,
  fansReached,
  mode,
}: ClubLandingPageProps) {
  const accent = branding.accentColor || "#c6ff3d";
  const btnText = branding.buttonTextColor || "#05130a";
  const btnRadius = radiusFor(branding.buttonStyle);

  const [fanName, setFanName] = useState("");
  const [fanEmail, setFanEmail] = useState("");
  const [fanStatus, setFanStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submitFan(e: React.FormEvent) {
    e.preventDefault();
    if (mode !== "live") {
      setFanStatus("done");
      return;
    }
    setFanStatus("loading");
    try {
      const res = await fetch(`/api/fans/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fanName, email: fanEmail }),
      });
      if (!res.ok) throw new Error();
      setFanStatus("done");
    } catch {
      setFanStatus("error");
    }
  }

  const totalClicks = sponsors.reduce((sum, s) => sum + s.clicks, 0);

  return (
    <div
      className="min-h-full bg-ink text-cream"
      style={{ ["--club-accent" as string]: accent }}
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
                backgroundImage: `linear-gradient(180deg, rgba(10,20,16,0.55), rgba(10,20,16,0.92)), url(${branding.heroImageDataUrl})`,
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

      {/* Stats strip */}
      <section className="border-b border-[var(--line)]">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-display font-bold" style={{ color: accent }}>
              {sponsors.length}
            </div>
            <div className="text-xs text-cream-dim mt-1 uppercase tracking-wide">Live partner offers</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display font-bold" style={{ color: accent }}>
              {fansReached}
            </div>
            <div className="text-xs text-cream-dim mt-1 uppercase tracking-wide">Fans reached</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display font-bold" style={{ color: accent }}>
              {totalClicks}
            </div>
            <div className="text-xs text-cream-dim mt-1 uppercase tracking-wide">Tracked clicks</div>
          </div>
        </div>
      </section>

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
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {sponsor.logoDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sponsor.logoDataUrl}
                        alt={sponsor.name}
                        className="h-10 w-10 rounded-lg object-cover bg-white/5"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-ink-2 flex items-center justify-center text-xs font-semibold text-cream-dim">
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
                </div>
                <div>
                  <div className="font-display font-semibold text-lg">{sponsor.offerTitle}</div>
                  <p className="text-sm text-cream-dim mt-1">{sponsor.offerDescription}</p>
                </div>
                <a
                  href={mode === "live" ? `/api/go/${slug}/${sponsor.id}` : sponsor.linkUrl || "#"}
                  target={mode === "live" ? undefined : "_blank"}
                  rel="noreferrer"
                  className="btn btn-outline self-start mt-auto"
                  style={{ borderRadius: btnRadius }}
                >
                  Claim this offer →
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Fan signup */}
      <section id="join" className="border-t border-[var(--line)] bg-surface/40">
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display font-bold text-2xl sm:text-3xl">Join the {clubName} fan list.</h2>
          <p className="text-cream-dim mt-3">
            Register once with Club Boost to unlock every current and future partner offer — and go into the
            club&apos;s prize pot draw.
          </p>

          {fanStatus === "done" ? (
            <div className="card mt-8 p-6 text-left">
              <div className="font-semibold" style={{ color: accent }}>
                You&apos;re on the list.
              </div>
              <p className="text-sm text-cream-dim mt-1">
                {mode === "live"
                  ? "We've logged your details — Club Boost will be in touch with fresh offers."
                  : "This is a preview — signups aren't saved here."}
              </p>
            </div>
          ) : (
            <form onSubmit={submitFan} className="mt-8 grid sm:grid-cols-[1fr_1fr_auto] gap-3 text-left">
              <input
                required
                placeholder="Full name"
                value={fanName}
                onChange={(e) => setFanName(e.target.value)}
                className="field-input"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={fanEmail}
                onChange={(e) => setFanEmail(e.target.value)}
                className="field-input"
              />
              <button
                type="submit"
                disabled={fanStatus === "loading"}
                className="btn"
                style={{ background: accent, color: btnText, borderRadius: btnRadius }}
              >
                {fanStatus === "loading" ? "Joining…" : "Join"}
              </button>
            </form>
          )}
          {fanStatus === "error" && (
            <p className="text-coral text-sm mt-3">Something went wrong — please try again.</p>
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
