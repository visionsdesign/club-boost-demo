import crypto from "crypto";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import type { DB, Club, Admin, Branding, Sponsor, SponsorOffer, ClickEvent } from "./types";

export const DEMO_ADMIN_EMAIL = "cto@visionsdesign.co.uk";
export const DEMO_ADMIN_PASSWORD = "clubboost2026";
export const DEMO_CLUB_EMAIL = "secretary@chesterfc-demo.co.uk";
export const DEMO_CLUB_PASSWORD = "chesterfc2026";

function seededClickEvents(counts: Record<string, number>, days = 14): ClickEvent[] {
  const events: ClickEvent[] = [];
  let n = 0;
  for (const [sponsorId, count] of Object.entries(counts)) {
    for (let i = 0; i < count; i += 1) {
      n += 1;
      const dayOffset = Math.floor((i / count) * days);
      const at = new Date();
      at.setDate(at.getDate() - (days - dayOffset));
      at.setHours(9 + (n % 10), (n * 7) % 60, 0, 0);
      events.push({ id: `click-seed-${n}`, sponsorId, createdAt: at.toISOString() });
    }
  }
  return events.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function seedData(): { admins: Admin[]; clubs: Club[] } {
  const now = new Date().toISOString();
  return {
    admins: [
      {
        id: "admin-1",
        email: DEMO_ADMIN_EMAIL,
        name: "Neil",
        passwordHash: bcrypt.hashSync(DEMO_ADMIN_PASSWORD, 10),
      },
    ],
    clubs: [
      {
        id: "club-chester-fc",
        slug: "chester-fc",
        clubName: "Chester FC",
        contactName: "Sam Whitfield",
        contactRole: "Club Secretary",
        contactEmail: DEMO_CLUB_EMAIL,
        contactPhone: "07700 900123",
        status: "active",
        passwordHash: bcrypt.hashSync(DEMO_CLUB_PASSWORD, 10),
        createdAt: now,
        approvedAt: now,
        activatedAt: now,
        branding: {
          accentColor: "#1c64f2",
          buttonTextColor: "#ffffff",
          buttonStyle: "round",
          heroHeading: "Your fans are worth more than a logo on a shirt.",
          tagline:
            "Chester FC has teamed up with Club Boost to turn our sponsors into real deals for our supporters — and give our partners the proof they've earned.",
          ctaText: "Get our fan offers",
          aboutHtml:
            "<p>Chester FC is a proud non-league football club with deep roots in the local community. We're teaming up with Club Boost to give our sponsors real, measurable value — and our fans genuinely useful offers in return.</p>",
        },
        sponsors: [
          {
            id: "sponsor-1",
            slug: "perfect-getaways",
            name: "Perfect Getaways",
            tier: "principal",
            infoHtml:
              "<p>Perfect Getaways has been Chester FC's official holiday partner since 2019, helping supporters get away without breaking the bank.</p>",
            offers: [
              {
                id: "offer-1a",
                title: "Your Official Holiday Partner",
                description:
                  "Exclusive 12% off summer bookings for Chester FC supporters, plus early access to the Summer Superdraw.",
                linkUrl: "https://example.com/perfect-getaways",
                clicks: 14,
              },
            ],
          },
          {
            id: "sponsor-2",
            slug: "enterprise-cars",
            name: "Enterprise Cars",
            tier: "partner",
            offers: [
              {
                id: "offer-2a",
                title: "10% Off Local Rentals",
                description: "Show your Club Boost card at the Chester branch for 10% off weekend rentals.",
                linkUrl: "https://example.com/enterprise",
                clicks: 9,
              },
            ],
          },
          {
            id: "sponsor-3",
            slug: "mbna",
            name: "MBNA",
            tier: "partner",
            offers: [
              {
                id: "offer-3a",
                title: "Fan Reward Card",
                description: "Cashback on everyday spending, with a share of every transaction fed back to the club.",
                linkUrl: "https://example.com/mbna",
                clicks: 5,
              },
            ],
          },
        ],
        fanSignups: [
          { id: "fan-1", name: "J. Roberts", email: "j.roberts@example.com", createdAt: now },
          { id: "fan-2", name: "K. Owens", email: "k.owens@example.com", createdAt: now },
          { id: "fan-3", name: "A. Price", email: "a.price@example.com", createdAt: now },
        ],
        clickEvents: seededClickEvents({ "sponsor-1": 14, "sponsor-2": 9, "sponsor-3": 5 }),
      },
    ],
  };
}

// A sponsor used to carry a single offer directly (offerTitle/offerDescription/
// linkUrl/clicks). Older records — local or already in the database — may still
// be in that shape. Wrap them into the new `offers` array so every reader can
// assume the new shape unconditionally.
function migrateLegacySponsor(sponsor: Sponsor): Sponsor {
  if (Array.isArray(sponsor.offers)) return sponsor;
  const legacy = sponsor as unknown as {
    offerTitle?: string;
    offerDescription?: string;
    linkUrl?: string;
    clicks?: number;
  };
  const offers: SponsorOffer[] =
    legacy.offerTitle || legacy.linkUrl
      ? [
          {
            id: `${sponsor.id}-offer-1`,
            title: legacy.offerTitle ?? "",
            description: legacy.offerDescription ?? "",
            linkUrl: legacy.linkUrl ?? "",
            clicks: legacy.clicks ?? 0,
          },
        ]
      : [];
  return { ...sponsor, offers };
}

function normalizeClub(club: Club): Club {
  if (!Array.isArray(club.clickEvents)) club.clickEvents = [];
  if (!Array.isArray(club.fanSignups)) club.fanSignups = [];
  if (!Array.isArray(club.sponsors)) club.sponsors = [];
  if (!club.branding.buttonTextColor) club.branding.buttonTextColor = "#05130a";

  club.sponsors = club.sponsors.map(migrateLegacySponsor);

  const takenSlugs = new Set(club.sponsors.map((s) => s.slug).filter(Boolean));
  for (const sponsor of club.sponsors) {
    if (!sponsor.slug) {
      sponsor.slug = uniqueSponsorSlug(takenSlugs, sponsor.name || sponsor.id);
      takenSlugs.add(sponsor.slug);
    }
  }
  return club;
}

// --- Postgres connection -------------------------------------------------

function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add a Postgres connection string to your environment " +
        "(a Neon database provisioned via Netlify DB, or your own Postgres instance) — see README.md."
    );
  }
  return url;
}

let sqlClient: ReturnType<typeof neon> | null = null;
function sql() {
  if (!sqlClient) sqlClient = neon(connectionString());
  return sqlClient;
}

let initPromise: Promise<void> | null = null;

async function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = sql();
      await db`
        CREATE TABLE IF NOT EXISTS admins (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL
        )
      `;
      await db`
        CREATE TABLE IF NOT EXISTS clubs (
          id TEXT PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL,
          contact_email TEXT NOT NULL,
          setup_token TEXT UNIQUE,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await db`CREATE INDEX IF NOT EXISTS clubs_status_idx ON clubs (status)`;
      await db`CREATE INDEX IF NOT EXISTS clubs_contact_email_idx ON clubs (lower(contact_email))`;

      const [{ count }] = (await db`SELECT count(*)::int AS count FROM admins`) as {
        count: number;
      }[];

      if (count === 0) {
        const seed = seedData();
        for (const admin of seed.admins) {
          await db`
            INSERT INTO admins (id, email, name, password_hash)
            VALUES (${admin.id}, ${admin.email}, ${admin.name}, ${admin.passwordHash})
            ON CONFLICT (id) DO NOTHING
          `;
        }
        for (const club of seed.clubs) {
          await db`
            INSERT INTO clubs (id, slug, status, contact_email, setup_token, data)
            VALUES (${club.id}, ${club.slug}, ${club.status}, ${club.contactEmail}, ${club.setupToken ?? null}, ${JSON.stringify(club)})
            ON CONFLICT (id) DO NOTHING
          `;
        }
      }

      // One-time, idempotent migration: wrap any sponsor still in the old
      // single-offer shape (no `offers` array) into `offers: [...]`, directly
      // in the database. Needed because the atomic click-tracking update below
      // reads/writes `sponsors[].offers` straight in SQL — it can't rely on
      // normalizeClub() having run in JS first.
      await db`
        UPDATE clubs
        SET data = jsonb_set(
          data,
          '{sponsors}',
          (
            SELECT jsonb_agg(
              CASE WHEN sp ? 'offers' THEN sp
              ELSE (sp - 'offerTitle' - 'offerDescription' - 'linkUrl' - 'clicks') || jsonb_build_object(
                'offers',
                CASE WHEN sp->>'offerTitle' IS NOT NULL OR sp->>'linkUrl' IS NOT NULL THEN
                  jsonb_build_array(
                    jsonb_build_object(
                      'id', (sp->>'id') || '-offer-1',
                      'title', COALESCE(sp->>'offerTitle', ''),
                      'description', COALESCE(sp->>'offerDescription', ''),
                      'linkUrl', COALESCE(sp->>'linkUrl', ''),
                      'clicks', COALESCE((sp->>'clicks')::int, 0)
                    )
                  )
                ELSE '[]'::jsonb
                END
              )
              END
            )
            FROM jsonb_array_elements(data->'sponsors') AS sp
          )
        )
        WHERE data->'sponsors' IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements(data->'sponsors') AS sp WHERE NOT (sp ? 'offers')
          )
      `;
    })();
  }
  return initPromise;
}

// --- Public data-access API (same shape as before, now async) -----------

export async function readDb(): Promise<DB> {
  await ensureInitialized();
  const db = sql();
  const adminRows = (await db`SELECT id, email, name, password_hash AS "passwordHash" FROM admins`) as Admin[];
  const clubRows = (await db`SELECT data FROM clubs ORDER BY (data->>'createdAt') ASC`) as {
    data: Club;
  }[];
  return {
    admins: adminRows,
    clubs: clubRows.map((r) => normalizeClub(r.data)),
  };
}

export async function writeDb(db: DB): Promise<void> {
  await ensureInitialized();
  const client = sql();
  for (const admin of db.admins) {
    await client`
      INSERT INTO admins (id, email, name, password_hash)
      VALUES (${admin.id}, ${admin.email}, ${admin.name}, ${admin.passwordHash})
      ON CONFLICT (id) DO UPDATE SET email = excluded.email, name = excluded.name, password_hash = excluded.password_hash
    `;
  }
  for (const club of db.clubs) {
    await client`
      INSERT INTO clubs (id, slug, status, contact_email, setup_token, data, updated_at)
      VALUES (${club.id}, ${club.slug}, ${club.status}, ${club.contactEmail}, ${club.setupToken ?? null}, ${JSON.stringify(club)}, now())
      ON CONFLICT (id) DO UPDATE SET
        slug = excluded.slug,
        status = excluded.status,
        contact_email = excluded.contact_email,
        setup_token = excluded.setup_token,
        data = excluded.data,
        updated_at = now()
    `;
  }
}

// These two writes happen on the public club page and can realistically fire
// concurrently for the same club (one fan clicking an offer while another
// submits the join form). A plain readDb()/writeDb() round-trip would race —
// each request overwrites the whole `data` blob with its own stale snapshot,
// silently dropping the other's write. These do the mutation as a single
// atomic SQL statement instead, computed from the row's current value.

export async function appendFanSignup(
  slug: string,
  fan: { id: string; name: string; email: string; createdAt: string }
): Promise<boolean> {
  await ensureInitialized();
  const client = sql();
  const rows = (await client`
    UPDATE clubs
    SET data = jsonb_set(
      data,
      '{fanSignups}',
      COALESCE(data->'fanSignups', '[]'::jsonb) || ${JSON.stringify(fan)}::jsonb
    )
    WHERE slug = ${slug}
    RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}

export async function recordOfferClick(
  slug: string,
  sponsorId: string,
  offerId: string,
  event: { id: string; sponsorId: string; offerId: string; createdAt: string }
): Promise<{ linkUrl: string } | null> {
  await ensureInitialized();
  const client = sql();
  const rows = (await client`
    UPDATE clubs
    SET data = data || jsonb_build_object(
      'sponsors', (
        SELECT jsonb_agg(
          CASE WHEN sp->>'id' = ${sponsorId}
            THEN sp || jsonb_build_object(
              'offers', (
                SELECT jsonb_agg(
                  CASE WHEN off->>'id' = ${offerId}
                    THEN jsonb_set(off, '{clicks}', to_jsonb(COALESCE((off->>'clicks')::int, 0) + 1))
                    ELSE off
                  END
                )
                FROM jsonb_array_elements(sp->'offers') AS off
              )
            )
            ELSE sp
          END
        )
        FROM jsonb_array_elements(data->'sponsors') AS sp
      ),
      'clickEvents', COALESCE(data->'clickEvents', '[]'::jsonb) || ${JSON.stringify(event)}::jsonb
    )
    WHERE slug = ${slug}
    RETURNING (
      SELECT off->>'linkUrl'
      FROM jsonb_array_elements(data->'sponsors') AS sp, jsonb_array_elements(sp->'offers') AS off
      WHERE sp->>'id' = ${sponsorId} AND off->>'id' = ${offerId}
    ) AS "linkUrl"
  `) as { linkUrl: string | null }[];
  const linkUrl = rows[0]?.linkUrl;
  return linkUrl ? { linkUrl } : null;
}

export async function resetDb(): Promise<void> {
  await ensureInitialized();
  const client = sql();
  await client`DELETE FROM clubs`;
  await client`DELETE FROM admins`;
  initPromise = null;
  await ensureInitialized();
}

// --- Pure helpers (no I/O) ------------------------------------------------

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function uniqueSlug(db: DB, base: string, ignoreId?: string): string {
  let slug = slugify(base) || "club";
  let n = 2;
  const taken = (s: string) => db.clubs.some((c) => c.slug === s && c.id !== ignoreId);
  while (taken(slug)) {
    slug = `${slugify(base)}-${n}`;
    n += 1;
  }
  return slug;
}

export function findClubBySlug(db: DB, slug: string): Club | undefined {
  return db.clubs.find((c) => c.slug === slug);
}

export function findClubById(db: DB, id: string): Club | undefined {
  return db.clubs.find((c) => c.id === id);
}

export function findSponsorBySlug(club: Club, sponsorSlug: string): Sponsor | undefined {
  return club.sponsors.find((s) => s.slug === sponsorSlug);
}

export function uniqueSponsorSlug(taken: Set<string>, base: string): string {
  let slug = slugify(base) || "partner";
  let n = 2;
  while (taken.has(slug)) {
    slug = `${slugify(base)}-${n}`;
    n += 1;
  }
  return slug;
}

export interface BrandingUpdatePayload {
  clubName?: string;
  branding: Branding;
  sponsors: Array<
    Omit<Sponsor, "offers"> & { offers: Array<Omit<SponsorOffer, "clicks"> & { clicks?: number }> }
  >;
}

export function applyBrandingUpdate(club: Club, payload: BrandingUpdatePayload): void {
  if (payload.clubName && payload.clubName.trim()) {
    club.clubName = payload.clubName.trim();
  }

  const isHex = (value: unknown): value is string =>
    typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);

  club.branding = {
    logoDataUrl: payload.branding.logoDataUrl,
    heroImageDataUrl: payload.branding.heroImageDataUrl,
    accentColor: isHex(payload.branding.accentColor)
      ? payload.branding.accentColor
      : club.branding.accentColor,
    buttonTextColor: isHex(payload.branding.buttonTextColor)
      ? payload.branding.buttonTextColor
      : club.branding.buttonTextColor,
    buttonStyle: payload.branding.buttonStyle === "square" ? "square" : "round",
    heroHeading: payload.branding.heroHeading || club.branding.heroHeading,
    tagline: payload.branding.tagline || club.branding.tagline,
    ctaText: payload.branding.ctaText || club.branding.ctaText,
    aboutHtml: payload.branding.aboutHtml,
    aboutImageDataUrl: payload.branding.aboutImageDataUrl,
  };

  const existingById = new Map(club.sponsors.map((s) => [s.id, s]));
  const takenSlugs = new Set(club.sponsors.map((s) => s.slug));

  club.sponsors = (payload.sponsors || []).map((incoming) => {
    const existing = incoming.id ? existingById.get(incoming.id) : undefined;
    let slug = existing?.slug;
    if (!slug) {
      slug = uniqueSponsorSlug(takenSlugs, incoming.name);
      takenSlugs.add(slug);
    }

    const existingOffersById = new Map((existing?.offers ?? []).map((o) => [o.id, o]));
    const offers: SponsorOffer[] = (incoming.offers || []).map((incomingOffer) => {
      const existingOffer = incomingOffer.id ? existingOffersById.get(incomingOffer.id) : undefined;
      return {
        id: existingOffer?.id ?? `offer-${crypto.randomBytes(6).toString("hex")}`,
        title: incomingOffer.title,
        description: incomingOffer.description,
        linkUrl: incomingOffer.linkUrl,
        clicks: existingOffer?.clicks ?? 0,
      };
    });

    return {
      id: existing?.id ?? `sponsor-${crypto.randomBytes(6).toString("hex")}`,
      slug,
      name: incoming.name,
      tier: incoming.tier === "principal" ? "principal" : "partner",
      logoDataUrl: incoming.logoDataUrl,
      bannerImageDataUrl: incoming.bannerImageDataUrl,
      infoHtml: incoming.infoHtml,
      offers,
    };
  });
}
