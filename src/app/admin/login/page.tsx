import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";
import LoginForm from "@/components/LoginForm";
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from "@/lib/db";

export default function AdminLoginPage() {
  return (
    <div className="flex-1">
      <MarketingNav />
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="text-center mb-8">
          <div className="kicker mb-2">Club Boost admin</div>
          <h1 className="font-display font-bold text-2xl">Sign in to review clubs</h1>
        </div>
        <LoginForm
          submitUrl="/api/admin/login"
          redirectTo="/admin"
          demoHint={`${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD}`}
        />
        <p className="text-center text-sm text-cream-dim mt-6">
          Are you a club?{" "}
          <Link href="/club/login" className="text-lime hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
