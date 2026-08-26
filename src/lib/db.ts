import crypto from "crypto";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import type { DB, Club, Admin, Branding, Sponsor, ClickEvent } from "./types";

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
        },
        sponsors: [
          {
            id: "sponsor-1",
            name: "Perfect Getaways",
            tier: "principal",
            offerTitle: "Your Official Holiday Partner",
            offerDescription:
              "Exclusive 12% off summer bookings for Chester FC supporters, plus early access to the Summer Superdraw.",
            linkUrl: "https://example.com/perfect-getaways",
            clicks: 14,
          },
          {
            id: "sponsor-2",
            name: "Enterprise Cars",
            tier: "partner",
            offerTitle: "10% Off Local Rentals",
            offerDescription:
              "Show your Club Boost card at the Chester branch for 10% off weekend rentals.",
            linkUrl: "https://example.com/enterprise",
            clicks: 9,
          },
          {
            id: "sponsor-3",
            name: "MBNA",
            tier: "partner",
            offerTitle: "Fan Reward Card",
            offerDescription:
              "Cashback on everyday spending, with a share of every transaction fed back to the club.",
            linkUrl: "https://example.com/mbna",
            clicks: 5,
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

function normalizeClub(club: Club): Club {
  if (!Array.isArray(club.clickEvents)) club.clickEvents = [];
  if (!Array.isArray(club.fanSignups)) club.fanSignups = [];
  if (!Array.isArray(club.sponsors)) club.sponsors = [];
  if (!club.branding.buttonTextColor) club.branding.buttonTextColor = "#05130a";
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

export async function recordSponsorClick(
  slug: string,
  sponsorId: string,
  event: { id: string; sponsorId: string; createdAt: string }
): Promise<{ linkUrl: string } | null> {
  await ensureInitialized();
  const client = sql();
  const rows = (await client`
    UPDATE clubs
    SET data = data || jsonb_build_object(
      'sponsors', (
        SELECT jsonb_agg(
          CASE WHEN elem->>'id' = ${sponsorId}
            THEN jsonb_set(elem, '{clicks}', to_jsonb(COALESCE((elem->>'clicks')::int, 0) + 1))
            ELSE elem
          END
        )
        FROM jsonb_array_elements(data->'sponsors') AS elem
      ),
      'clickEvents', COALESCE(data->'clickEvents', '[]'::jsonb) || ${JSON.stringify(event)}::jsonb
    )
    WHERE slug = ${slug}
    RETURNING (
      SELECT elem->>'linkUrl'
      FROM jsonb_array_elements(data->'sponsors') AS elem
      WHERE elem->>'id' = ${sponsorId}
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

export interface BrandingUpdatePayload {
  clubName?: string;
  branding: Branding;
  sponsors: Array<Omit<Sponsor, "clicks"> & { clicks?: number }>;
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
  };

  const existingById = new Map(club.sponsors.map((s) => [s.id, s]));
  club.sponsors = (payload.sponsors || []).map((incoming) => {
    const existing = incoming.id ? existingById.get(incoming.id) : undefined;
    return {
      id: existing?.id ?? `sponsor-${crypto.randomBytes(6).toString("hex")}`,
      name: incoming.name,
      tier: incoming.tier === "principal" ? "principal" : "partner",
      logoDataUrl: incoming.logoDataUrl,
      offerTitle: incoming.offerTitle,
      offerDescription: incoming.offerDescription,
      linkUrl: incoming.linkUrl,
      clicks: existing?.clicks ?? 0,
    };
  });
}
