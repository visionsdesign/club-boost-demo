import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { DB, Club, Branding, Sponsor, ClickEvent } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

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

function seedData(): DB {
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

function ensureDb(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(seedData(), null, 2));
  }
}

function normalize(db: DB): DB {
  for (const club of db.clubs) {
    if (!Array.isArray(club.clickEvents)) club.clickEvents = [];
    if (!Array.isArray(club.fanSignups)) club.fanSignups = [];
    if (!Array.isArray(club.sponsors)) club.sponsors = [];
    if (!club.branding.buttonTextColor) club.branding.buttonTextColor = "#05130a";
  }
  return db;
}

export function readDb(): DB {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return normalize(JSON.parse(raw) as DB);
}

export function writeDb(db: DB): void {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function resetDb(): void {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(seedData(), null, 2));
}

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
  const taken = (s: string) =>
    db.clubs.some((c) => c.slug === s && c.id !== ignoreId);
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
