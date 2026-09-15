import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.SESSION_SECRET || "club-boost-demo-secret-do-not-use-in-prod";
const COOKIE_NAME = "cb_session";

export type SessionType = "admin" | "club";

export interface SessionPayload {
  type: SessionType;
  id: string;
  exp: number;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(data: string): string {
  return base64url(crypto.createHmac("sha256", SECRET).update(data).digest());
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">, ttlSeconds = 60 * 60 * 24 * 7): string {
  const full: SessionPayload = { ...payload, exp: Date.now() + ttlSeconds * 1000 };
  const data = base64url(JSON.stringify(full));
  const sig = sign(data);
  return `${data}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expectedSig = sign(data);
  if (sig !== expectedSig) return null;
  try {
    const json = Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
    const payload = JSON.parse(json) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

export function randomToken(bytes = 24): string {
  return crypto.randomBytes(bytes).toString("hex");
}

// Tracks which clubs a visitor has registered as a fan with, so their offer
// links unlock without needing a full account. Not a security boundary (a
// fan could tamper with their own cookie to skip registering) — it's a
// marketing gate, not an auth check, so it's kept simple and unsigned.
export const FAN_COOKIE_NAME = "cb_fan_clubs";

export function parseFanClubs(raw: string | undefined | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export async function isFanOfClub(slug: string): Promise<boolean> {
  const store = await cookies();
  const clubs = parseFanClubs(store.get(FAN_COOKIE_NAME)?.value);
  return clubs.includes(slug);
}
