import Link from "next/link";

export default function MarketingNav() {
  return (
    <header className="border-b border-[var(--line)]">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-xl">
          Club <span className="text-lime">Boost</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4 text-sm">
          <Link href="/clubs/chester-fc" className="hidden sm:inline text-cream-dim hover:text-cream">
            Live example
          </Link>
          <Link href="/club/login" className="hidden sm:inline text-cream-dim hover:text-cream">
            Club login
          </Link>
          <Link href="/admin/login" className="text-cream-dim hover:text-cream">
            Admin
          </Link>
          <Link href="/#register" className="btn btn-lime py-2! px-4! text-sm">
            Register your club
          </Link>
        </nav>
      </div>
    </header>
  );
}
