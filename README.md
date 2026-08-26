# Club Boost — Platform Prototype

A working demo of Workstream 1 (Platform Foundation & Club Admin) from the Club Boost
discovery plan: club sign-up, manual admin approval, and each club's own branded,
editable landing page. Built to show Neil something concrete in a sales meeting —
not a production system.

Styled to match [clubboost.co.uk](https://clubboost.co.uk) (dark theme, lime accent,
Sora / Bricolage Grotesque type).

## Running it

Data lives in a real Postgres database (via [Neon](https://neon.tech)'s serverless
driver), so it persists properly on serverless hosts like Netlify — not in a local
file. You need a connection string before the app will start:

1. Get a `DATABASE_URL`:
   - **Easiest if deploying to Netlify:** in the Netlify dashboard, open your site →
     **Databases** → enable **Netlify DB**. It provisions a free Neon Postgres
     instance and sets `DATABASE_URL` (or a similarly-named var) on the deployed
     site automatically. Copy that value for local use too (Site settings →
     Environment variables, or `netlify env:pull`).
   - **Or standalone:** create a free database at [neon.tech](https://neon.tech) and
     copy its connection string.
2. `cp .env.example .env.local` and paste the connection string in as `DATABASE_URL`.
3. Install and run:

```bash
npm install
npm run dev
```

Open the URL it prints (defaults to `http://localhost:3000` — pass `-- -p 3010` etc. if
that port's taken locally). The database schema and seed data (a demo admin and an
active Chester FC club) are created automatically the first time the app connects.

Nothing to reset manually — since real registrations/edits persist properly now, treat
it like a real (if small) database rather than a disposable file.

## The flow

1. **Register a club** — homepage → "Register your club". Goes into a pending queue.
2. **Approve as admin** — `/admin/login` → approve the pending club → a setup link is
   shown on that club's admin page (in production this would be emailed; here it's
   copy-paste since there's no mail sending in the prototype).
3. **Club activates & edits** — open the setup link → set a password → lands straight
   in the club dashboard → edit logo, accent colour, button style, copy, and sponsor
   offers, with a live preview alongside the form.
4. **Live page** — saved changes appear immediately at `/clubs/<slug>`. Sponsor "Claim
   this offer" links route through `/api/go/<slug>/<sponsorId>` so clicks are tracked,
   demonstrating the "digital audit trail" from the meeting. The fan signup form on
   each club page logs interest the same way.
5. **Admin can also edit any club's page** directly from `/admin/clubs/<id>` — same
   editor, so both admin and club can customise a landing page as discussed.

## Deploying to Netlify

Netlify auto-detects Next.js and the defaults it suggests are correct as-is: base
directory blank, build command `npm run build`, publish directory `.next`, functions
directory blank. The one thing to set explicitly is `DATABASE_URL` under Site settings
→ Environment variables — if you provisioned the database via Netlify DB (see above),
that's likely already done for you under a Netlify-managed variable name; just confirm
`DATABASE_URL` is set to that same value (or update `src/lib/db.ts` if Netlify's
variable is named differently).

## Demo credentials

- **Admin:** `cto@visionsdesign.co.uk` / `clubboost2026`
- **Chester FC (seeded, active):** `secretary@chesterfc-demo.co.uk` / `chesterfc2026`

## What this deliberately does / doesn't do

Matches what was agreed for the Phase 1 prototype: manual, vetted club onboarding
(no self-serve), no real subdomains yet (`/clubs/<slug>` instead of
`<slug>.clubboost.co.uk`), no real email delivery, no payment/bank verification, no
Stripe. Logos are stored as data URLs for simplicity. None of this is meant to be
production-ready — it's here to make the logic and structure visible before the real
build starts, per the plan in `Club_Boost_Portal_Questions_and_Plan.pdf`.
