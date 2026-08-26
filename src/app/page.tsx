import MarketingNav from "@/components/MarketingNav";
import RegisterForm from "@/components/RegisterForm";
import Link from "next/link";

const steps = [
  {
    n: "01",
    title: "Club registers interest",
    body: "A quick form — club name, contact details and role. No tech knowledge needed.",
  },
  {
    n: "02",
    title: "Neil vets the club",
    body: "A short call to verify who they are, then a manual approve in the admin dashboard.",
  },
  {
    n: "03",
    title: "Club sets up their page",
    body: "The club logs in and brands their own Club Boost landing page — logo, colours, sponsor offers.",
  },
  {
    n: "04",
    title: "Fans get tracked offers",
    body: "Every sponsor click and fan signup is logged, so the club can finally prove sponsorship value.",
  },
];

export default function Home() {
  return (
    <div className="flex-1">
      <MarketingNav />

      <section className="bg-grid border-b border-[var(--line)]">
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-1.5 text-xs kicker mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            Platform prototype
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl leading-tight max-w-3xl mx-auto">
            Your fans are worth more than a logo on a shirt.
          </h1>
          <p className="mt-6 text-cream-dim max-w-xl mx-auto text-lg">
            Club Boost turns club sponsorships into a tracked, measurable revenue stream. This is a working
            prototype of Workstream 1 — club sign-up, admin approval, and each club&apos;s own branded page.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
            <a href="#register" className="btn btn-lime">
              Register your club
            </a>
            <Link href="/clubs/chester-fc" className="btn btn-outline">
              See Chester FC&apos;s live page →
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="kicker mb-2">How the prototype works</div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl mb-10 max-w-2xl">
          Phase 1: platform foundation &amp; club admin.
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="card p-6">
              <div className="font-display font-bold text-lime text-sm">{s.n}</div>
              <div className="font-display font-semibold text-lg mt-2">{s.title}</div>
              <p className="text-cream-dim text-sm mt-2">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="register" className="border-t border-[var(--line)] bg-surface/30">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-10">
            <div className="kicker mb-2">Register interest</div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl">Bring your club onto Club Boost.</h2>
            <p className="text-cream-dim mt-3 max-w-lg mx-auto">
              This is a manual, vetted process — every club is reviewed by an admin before their account goes
              live.
            </p>
          </div>
          <RegisterForm />
        </div>
      </section>

      <footer className="border-t border-[var(--line)]">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-cream-dim">
          <div className="font-display font-semibold text-cream">
            Club <span className="text-lime">Boost</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/admin/login" className="hover:text-cream">
              Admin login
            </Link>
            <Link href="/club/login" className="hover:text-cream">
              Club login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
