import Link from "next/link";

export default function DashboardTabs({
  editHref,
  analyticsHref,
  active,
}: {
  editHref: string;
  analyticsHref: string;
  active: "editor" | "analytics";
}) {
  const tabs = [
    { href: editHref, key: "editor" as const, label: "Page editor" },
    { href: analyticsHref, key: "analytics" as const, label: "Analytics" },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-[var(--line)] mb-8">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            active === tab.key
              ? "border-lime text-cream"
              : "border-transparent text-cream-dim hover:text-cream"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
