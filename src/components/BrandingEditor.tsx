"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ClubLandingPage from "./ClubLandingPage";
import type { Branding, Sponsor } from "@/lib/types";

export interface BrandingEditorProps {
  clubId: string;
  slug: string;
  clubName: string;
  branding: Branding;
  sponsors: Sponsor[];
  fansReached: number;
  saveUrl: string;
  publicUrl: string;
  analyticsUrl?: string;
  allowClubNameEdit?: boolean;
}

type EditableSponsor = Sponsor;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function newSponsor(): EditableSponsor {
  return {
    id: `new-${Math.random().toString(36).slice(2)}`,
    name: "",
    tier: "partner",
    offerTitle: "",
    offerDescription: "",
    linkUrl: "",
    clicks: 0,
  };
}

export default function BrandingEditor({
  slug,
  clubName: initialClubName,
  branding: initialBranding,
  sponsors: initialSponsors,
  fansReached,
  saveUrl,
  publicUrl,
  analyticsUrl,
  allowClubNameEdit = true,
}: BrandingEditorProps) {
  const router = useRouter();
  const [clubName, setClubName] = useState(initialClubName);
  const [branding, setBranding] = useState<Branding>(initialBranding);
  const [sponsors, setSponsors] = useState<EditableSponsor[]>(initialSponsors);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalClicks = useMemo(() => sponsors.reduce((s, sp) => s + sp.clicks, 0), [sponsors]);

  function updateBranding<K extends keyof Branding>(key: K, value: Branding[K]) {
    setBranding((b) => ({ ...b, [key]: value }));
    setSaved(false);
  }

  function updateSponsor(id: string, patch: Partial<EditableSponsor>) {
    setSponsors((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setSaved(false);
  }

  function removeSponsor(id: string) {
    setSponsors((list) => list.filter((s) => s.id !== id));
    setSaved(false);
  }

  async function handleLogoUpload(file: File | null) {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updateBranding("logoDataUrl", dataUrl);
  }

  async function handleHeroImageUpload(file: File | null) {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updateBranding("heroImageDataUrl", dataUrl);
  }

  async function handleSponsorLogoUpload(id: string, file: File | null) {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updateSponsor(id, { logoDataUrl: dataUrl });
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(saveUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubName, branding, sponsors }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save changes.");
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[420px_1fr] gap-8 items-start">
      {/* Editor form */}
      <div className="space-y-6">
        <div className="card p-5 space-y-4">
          <div className="kicker">Club identity</div>

          {allowClubNameEdit && (
            <div>
              <label className="field-label">Club name</label>
              <input
                className="field-input"
                value={clubName}
                onChange={(e) => {
                  setClubName(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
          )}

          <div>
            <label className="field-label">Club logo</label>
            <div className="flex items-center gap-3">
              {branding.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={branding.logoDataUrl} alt="Logo" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-ink-2 border border-[var(--line)]" />
              )}
              <label className="btn btn-outline cursor-pointer text-sm">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="field-label">Hero image (optional)</label>
            <div className="flex items-center gap-3">
              {branding.heroImageDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={branding.heroImageDataUrl}
                  alt="Hero"
                  className="h-12 w-20 rounded-md object-cover border border-[var(--line)]"
                />
              ) : (
                <div className="h-12 w-20 rounded-md bg-ink-2 border border-[var(--line)]" />
              )}
              <label className="btn btn-outline cursor-pointer text-sm">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleHeroImageUpload(e.target.files?.[0] ?? null)}
                />
              </label>
              {branding.heroImageDataUrl && (
                <button
                  type="button"
                  onClick={() => updateBranding("heroImageDataUrl", undefined)}
                  className="text-coral text-xs hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-cream-dim mt-2">
              Shown as a full-width photo behind the hero heading. Leave blank to use the plain
              background instead.
            </p>
          </div>

          <div>
            <label className="field-label">Accent colour</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.accentColor}
                onChange={(e) => updateBranding("accentColor", e.target.value)}
                className="h-10 w-14 rounded-md border border-[var(--line)] bg-transparent"
              />
              <input
                className="field-input"
                value={branding.accentColor}
                onChange={(e) => updateBranding("accentColor", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="field-label">Button text colour</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.buttonTextColor}
                onChange={(e) => updateBranding("buttonTextColor", e.target.value)}
                className="h-10 w-14 rounded-md border border-[var(--line)] bg-transparent"
              />
              <input
                className="field-input"
                value={branding.buttonTextColor}
                onChange={(e) => updateBranding("buttonTextColor", e.target.value)}
              />
            </div>
            <p className="text-xs text-cream-dim mt-2">
              The text colour on your accent-coloured buttons — keep it high-contrast against the
              accent colour above.
            </p>
          </div>

          <div>
            <label className="field-label">Button style</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => updateBranding("buttonStyle", "round")}
                className={`btn btn-outline text-sm ${branding.buttonStyle === "round" ? "border-lime! text-lime" : ""}`}
                style={{ borderRadius: "100px" }}
              >
                Round
              </button>
              <button
                type="button"
                onClick={() => updateBranding("buttonStyle", "square")}
                className={`btn btn-outline text-sm ${branding.buttonStyle === "square" ? "border-lime! text-lime" : ""}`}
                style={{ borderRadius: "8px" }}
              >
                Square
              </button>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <div className="kicker">Page copy</div>
          <div>
            <label className="field-label">Hero heading</label>
            <textarea
              className="field-input"
              rows={2}
              value={branding.heroHeading}
              onChange={(e) => updateBranding("heroHeading", e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Tagline</label>
            <textarea
              className="field-input"
              rows={3}
              value={branding.tagline}
              onChange={(e) => updateBranding("tagline", e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Call-to-action button text</label>
            <input
              className="field-input"
              value={branding.ctaText}
              onChange={(e) => updateBranding("ctaText", e.target.value)}
            />
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="kicker">Sponsors &amp; offers</div>
            <button
              type="button"
              onClick={() => setSponsors((list) => [...list, newSponsor()])}
              className="text-xs text-lime hover:underline"
            >
              + Add sponsor
            </button>
          </div>

          {sponsors.length === 0 && (
            <p className="text-sm text-cream-dim">No sponsors yet — add one to populate the offers section.</p>
          )}

          <div className="space-y-4">
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="rounded-lg border border-[var(--line)] p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    className="field-input flex-1"
                    placeholder="Sponsor name"
                    value={sponsor.name}
                    onChange={(e) => updateSponsor(sponsor.id, { name: e.target.value })}
                  />
                  <select
                    className="field-input w-auto"
                    value={sponsor.tier}
                    onChange={(e) => updateSponsor(sponsor.id, { tier: e.target.value as Sponsor["tier"] })}
                  >
                    <option value="partner">Partner</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  {sponsor.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sponsor.logoDataUrl} alt="" className="h-9 w-9 rounded-md object-cover" />
                  ) : (
                    <div className="h-9 w-9 rounded-md bg-ink-2 border border-[var(--line)]" />
                  )}
                  <label className="text-xs text-lime cursor-pointer hover:underline">
                    Upload logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSponsorLogoUpload(sponsor.id, e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
                <input
                  className="field-input"
                  placeholder="Offer title (e.g. 12% off summer bookings)"
                  value={sponsor.offerTitle}
                  onChange={(e) => updateSponsor(sponsor.id, { offerTitle: e.target.value })}
                />
                <textarea
                  className="field-input"
                  rows={2}
                  placeholder="Offer description"
                  value={sponsor.offerDescription}
                  onChange={(e) => updateSponsor(sponsor.id, { offerDescription: e.target.value })}
                />
                <input
                  className="field-input"
                  placeholder="Destination link (https://…)"
                  value={sponsor.linkUrl}
                  onChange={(e) => updateSponsor(sponsor.id, { linkUrl: e.target.value })}
                />
                <div className="flex items-center justify-between text-xs text-cream-dim">
                  <span>{sponsor.clicks} tracked click{sponsor.clicks === 1 ? "" : "s"} so far</span>
                  <button
                    type="button"
                    onClick={() => removeSponsor(sponsor.id)}
                    className="text-coral hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <div className="kicker">Stats (read-only)</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xl font-display font-bold text-lime">{fansReached}</div>
              <div className="text-cream-dim text-xs">Fans reached</div>
            </div>
            <div>
              <div className="text-xl font-display font-bold text-lime">{totalClicks}</div>
              <div className="text-cream-dim text-xs">Tracked clicks</div>
            </div>
          </div>
          {analyticsUrl && (
            <Link href={analyticsUrl} className="text-xs text-lime hover:underline inline-block">
              View full analytics →
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={save} disabled={saving} className="btn btn-lime">
            {saving ? "Saving…" : "Save changes"}
          </button>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="btn btn-outline">
            View live page →
          </a>
          {saved && <span className="text-lime text-sm">Saved</span>}
          {error && <span className="text-coral text-sm">{error}</span>}
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-6">
        <div className="kicker mb-3">Live preview</div>
        <div className="rounded-2xl border border-[var(--line)] overflow-hidden shadow-2xl">
          <div className="bg-ink-2 px-4 py-2 flex items-center gap-2 border-b border-[var(--line)]">
            <span className="h-2.5 w-2.5 rounded-full bg-coral/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-lime/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-cream-dim/40" />
            <span className="ml-3 text-xs text-cream-dim">clubboost.co.uk/clubs/{slug}</span>
          </div>
          <div className="max-h-[80vh] overflow-y-auto">
            <ClubLandingPage
              slug={slug}
              clubName={clubName}
              branding={branding}
              sponsors={sponsors}
              fansReached={fansReached}
              mode="preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
