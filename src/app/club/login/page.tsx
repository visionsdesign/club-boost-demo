import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";
import LoginForm from "@/components/LoginForm";
import { DEMO_CLUB_EMAIL, DEMO_CLUB_PASSWORD } from "@/lib/db";

export default function ClubLoginPage() {
  return (
    <div className="flex-1">
      <MarketingNav />
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="text-center mb-8">
          <div className="kicker mb-2">Club login</div>
          <h1 className="font-display font-bold text-2xl">Sign in to your club dashboard</h1>
        </div>
        <LoginForm
          submitUrl="/api/club/login"
          redirectTo="/club/dashboard"
          demoHint={`Chester FC — ${DEMO_CLUB_EMAIL} / ${DEMO_CLUB_PASSWORD}`}
        />
        <p className="text-center text-sm text-cream-dim mt-6">
          New to Club Boost?{" "}
          <Link href="/#register" className="text-lime hover:underline">
            Register your club&apos;s interest
          </Link>
        </p>
      </div>
    </div>
  );
}
