import { notFound } from "next/navigation";
import Link from "next/link";
import { readDb, findClubBySlug } from "@/lib/db";
import ClubLandingPage from "@/components/ClubLandingPage";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = await readDb();
  const club = findClubBySlug(db, slug);
  return { title: club ? `${club.clubName} × Club Boost` : "Club not found" };
}

export default async function PublicClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await readDb();
  const club = findClubBySlug(db, slug);

  if (!club || club.status !== "active") {
    if (!club) notFound();
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="card p-8 max-w-md text-center">
          <div className="font-display font-bold text-xl">{club.clubName}&apos;s page isn&apos;t live yet</div>
          <p className="text-cream-dim mt-3 text-sm">
            This club is still completing setup on Club Boost. Check back soon.
          </p>
          <Link href="/" className="btn btn-outline mt-6 inline-block">
            Back to Club Boost
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ClubLandingPage
      slug={club.slug}
      clubName={club.clubName}
      branding={club.branding}
      sponsors={club.sponsors}
      fansReached={club.fanSignups.length}
      mode="live"
    />
  );
}
