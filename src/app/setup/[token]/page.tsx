import MarketingNav from "@/components/MarketingNav";
import SetupForm from "@/components/SetupForm";
import { readDb } from "@/lib/db";

export default async function SetupPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = await readDb();
  const club = db.clubs.find((c) => c.setupToken === token && c.status === "awaiting_setup");

  return (
    <div className="flex-1">
      <MarketingNav />
      <div className="max-w-md mx-auto px-6 py-20">
        {!club ? (
          <div className="card p-8 text-center">
            <div className="font-display font-bold text-xl text-coral">Link not valid</div>
            <p className="text-cream-dim mt-3 text-sm">
              This setup link is invalid or has already been used. If you&apos;ve already set your password, try
              logging in instead.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="kicker mb-2">Welcome, {club.clubName}</div>
              <h1 className="font-display font-bold text-2xl">You&apos;ve been approved</h1>
              <p className="text-cream-dim mt-3 text-sm">
                Set a password to activate your account. You&apos;ll be able to brand your page and add sponsor
                offers straight after.
              </p>
            </div>
            <SetupForm token={token} />
          </>
        )}
      </div>
    </div>
  );
}
