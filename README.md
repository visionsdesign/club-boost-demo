# Club Boost — Platform Prototype

A working demo of Workstream 1 (Platform Foundation & Club Admin) from the Club Boost
discovery plan: club sign-up, manual admin approval, and each club's own branded,
editable landing page. Built to show Neil something concrete in a sales meeting —
not a production system.

Styled to match [clubboost.co.uk](https://clubboost.co.uk) (dark theme, lime accent,
Sora / Bricolage Grotesque type).

## Running it

```bash
npm install
npm run dev
```

Open the URL it prints (defaults to `http://localhost:3000` — pass `-- -p 3010` etc. if
that port's taken locally).

Data is stored in `data/db.json` (created on first run, seeded with a demo admin and an
active Chester FC club). Delete that file and restart to reset the demo to a clean state.

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
