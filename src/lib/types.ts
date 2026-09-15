export type ClubStatus = "pending" | "rejected" | "awaiting_setup" | "active";

export type SponsorTier = "principal" | "partner";

export interface SponsorOffer {
  id: string;
  title: string;
  description: string;
  linkUrl: string;
  clicks: number;
}

export interface Sponsor {
  id: string;
  slug: string;
  name: string;
  tier: SponsorTier;
  logoDataUrl?: string;
  bannerImageDataUrl?: string;
  infoHtml?: string;
  offers: SponsorOffer[];
}

export interface Branding {
  logoDataUrl?: string;
  heroImageDataUrl?: string;
  accentColor: string;
  buttonTextColor: string;
  buttonStyle: "round" | "square";
  pageBackground: "dark" | "light";
  heroHeading: string;
  tagline: string;
  ctaText: string;
  aboutHtml?: string;
  aboutImageDataUrl?: string;
}

export interface FanSignup {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  createdAt: string;
}

export interface ClickEvent {
  id: string;
  sponsorId: string;
  offerId?: string;
  createdAt: string;
}

export interface Club {
  id: string;
  slug: string;
  clubName: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  status: ClubStatus;
  passwordHash?: string;
  setupToken?: string;
  createdAt: string;
  approvedAt?: string;
  activatedAt?: string;
  rejectedAt?: string;
  branding: Branding;
  sponsors: Sponsor[];
  fanSignups: FanSignup[];
  clickEvents: ClickEvent[];
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

export interface DB {
  admins: Admin[];
  clubs: Club[];
}
