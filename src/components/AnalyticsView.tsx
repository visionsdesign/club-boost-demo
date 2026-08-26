import type { ClubAnalytics } from "@/lib/analytics";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function BarChart({ title, data }: { title: string; data: ClubAnalytics["dailySignups"] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="card p-5">
      <div className="kicker mb-4">{title}</div>
      <div className="flex items-end gap-1.5 h-28">
        {data.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group">
            <div className="text-[10px] text-cream-dim mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {d.count}
            </div>
            <div
              className="w-full rounded-t-sm bg-lime/80 group-hover:bg-lime transition-colors"
              style={{ height: `${Math.max(3, (d.count / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-2">
        {data.map((d, i) => (
          <div key={d.date} className="flex-1 text-center text-[9px] text-cream-dim">
            {i % 3 === 0 ? d.label : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsView({ analytics }: { analytics: ClubAnalytics }) {
  const { totals, sponsorBreakdown, dailySignups, dailyClicks, recentSignups, recentClicks } = analytics;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Fans reached", value: totals.fansReached },
          { label: "Tracked clicks", value: totals.totalClicks },
          { label: "Live offers", value: totals.liveOffers },
          { label: "Avg. clicks / offer", value: totals.avgClicksPerOffer },
        ].map((tile) => (
          <div key={tile.label} className="card p-5">
            <div className="text-2xl font-display font-bold text-lime">{tile.value}</div>
            <div className="text-xs text-cream-dim mt-1">{tile.label}</div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <BarChart title="Fan signups — last 14 days" data={dailySignups} />
        <BarChart title="Sponsor clicks — last 14 days" data={dailyClicks} />
      </div>

      <div className="card p-5">
        <div className="kicker mb-4">Sponsor performance</div>
        {sponsorBreakdown.length === 0 ? (
          <p className="text-sm text-cream-dim">No sponsors added yet.</p>
        ) : (
          <div className="space-y-3">
            {sponsorBreakdown.map((s) => (
              <div key={s.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium flex items-center gap-2">
                    {s.name}
                    <span
                      className="status-pill"
                      style={{
                        background: s.tier === "principal" ? "var(--lime)" : "var(--ink-2)",
                        color: s.tier === "principal" ? "#05130a" : "var(--cream-dim)",
                        border: s.tier === "principal" ? "none" : "1px solid var(--line)",
                      }}
                    >
                      {s.tier === "principal" ? "Principal" : "Partner"}
                    </span>
                  </span>
                  <span className="text-cream-dim">
                    {s.clicks} click{s.clicks === 1 ? "" : "s"} · {s.share}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-ink-2 overflow-hidden">
                  <div className="h-full bg-lime rounded-full" style={{ width: `${s.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="kicker mb-4">Recent signups</div>
          {recentSignups.length === 0 ? (
            <p className="text-sm text-cream-dim">No fan signups yet.</p>
          ) : (
            <div className="space-y-3">
              {recentSignups.map((f) => (
                <div key={f.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{f.name}</div>
                    <div className="text-cream-dim text-xs">{f.email}</div>
                  </div>
                  <span className="text-cream-dim text-xs shrink-0">{timeAgo(f.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="kicker mb-4">Recent offer clicks</div>
          {recentClicks.length === 0 ? (
            <p className="text-sm text-cream-dim">No clicks tracked yet.</p>
          ) : (
            <div className="space-y-3">
              {recentClicks.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <div className="font-medium">{c.sponsorName}</div>
                  <span className="text-cream-dim text-xs shrink-0">{timeAgo(c.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
