import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PerformanceChart } from "@/components/analytics/PerformanceChart";
import { MOCK_ANALYTICS } from "@/lib/mock-data";
import { WeeklyReportButton } from "./WeeklyReportButton";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-7 py-4 border-b border-white/7 bg-surface">
        <div>
          <h1 className="text-xl font-bold">Аналитика</h1>
          <p className="text-xs text-muted mt-0.5">Статистика охватов и вовлечённости</p>
        </div>
        <WeeklyReportButton />
      </div>

      <div className="flex-1 overflow-y-auto p-7">
        <div className="grid grid-cols-4 gap-4 mb-7">
          <StatsCard label="Охваты за неделю" value="12.4K" delta="↑ +18%" positive color="#a78bfa" />
          <StatsCard label="Лайки" value={MOCK_ANALYTICS.likes} delta="↑ +5%" positive color="#34d399" />
          <StatsCard label="Комментарии" value={MOCK_ANALYTICS.comments} delta="↑ +22%" positive color="#38bdf8" />
          <StatsCard label="Репосты" value={MOCK_ANALYTICS.reposts} delta="↓ -3%" positive={false} color="#fbbf24" />
        </div>

        <PerformanceChart data={MOCK_ANALYTICS} />

        <div className="grid grid-cols-2 gap-4 mt-5">
          {/* Top posts */}
          <div className="bg-surface border border-white/7 rounded-2xl p-5">
            <div className="text-sm font-bold mb-4">Топ постов</div>
            <div className="flex flex-col gap-2">
              {[
                { platform: "IG", title: "Тыквенный латте", reach: "3.2K", color: "text-amber-400" },
                { platform: "TW", title: "Утренний кофе", reach: "2.8K", color: "text-violet-400" },
                { platform: "LI", title: "Автоматизация бизнеса", reach: "1.9K", color: "text-sky-400" },
              ].map((p) => (
                <div key={p.title} className="flex items-center justify-between p-3 bg-surface2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${p.color}`}>{p.platform}</span>
                    <span className="text-xs text-muted">{p.title}</span>
                  </div>
                  <span className="text-xs text-green-400 font-semibold">{p.reach} охватов</span>
                </div>
              ))}
            </div>
          </div>

          {/* By platform */}
          <div className="bg-surface border border-white/7 rounded-2xl p-5">
            <div className="text-sm font-bold mb-4">По платформам</div>
            <div className="flex flex-col gap-4">
              {[
                { label: "Instagram", pct: 52, color: "#fbbf24" },
                { label: "Twitter/X", pct: 31, color: "#a78bfa" },
                { label: "LinkedIn", pct: 17, color: "#38bdf8" },
              ].map((p) => (
                <div key={p.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted">{p.label}</span>
                    <span style={{ color: p.color }}>{p.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-surface3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${p.pct}%`, background: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
