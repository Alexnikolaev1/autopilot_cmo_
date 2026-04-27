import Link from "next/link";
import { getSession } from "@/lib/get-session";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MOCK_PROJECTS, STATS } from "@/lib/mock-data";
import { Button } from "@/components/ui";
import { PLATFORM_META } from "@/lib/types";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="flex items-center justify-between px-7 py-4 border-b border-white/7 bg-surface">
        <div>
          <h1 className="text-xl font-bold">Дашборд</h1>
          <p className="text-xs text-muted mt-0.5">Обзор вашей маркетинговой активности</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/competitors">
            <Button variant="ghost" size="sm">Анализ конкурентов →</Button>
          </Link>
          <Link href="/dashboard/analytics">
            <Button variant="ghost" size="sm">Отчёт недели →</Button>
          </Link>
          <Link href="/dashboard/new-project">
            <Button size="sm">✦ Создать контент</Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-7">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-7">
          <StatsCard
            label="Постов создано"
            value={STATS.postsGenerated}
            delta="↑ +12 за неделю"
            positive
            color="#a78bfa"
          />
          <StatsCard
            label="Запланировано"
            value={STATS.postsScheduled}
            delta="↑ 3 на сегодня"
            positive
            color="#38bdf8"
          />
          <StatsCard
            label="Опубликовано"
            value={STATS.postsPublished}
            delta="↑ +8% охваты"
            positive
            color="#34d399"
          />
          <StatsCard
            label="Вовлечённость"
            value={`${STATS.engagementRate}%`}
            delta="↓ -0.2% от нормы"
            positive={false}
            color="#fbbf24"
          />
        </div>

        {/* Projects */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold">Активные проекты</h2>
          <Link href="/projects" className="text-xs text-muted hover:text-accent2 transition-colors">
            Все проекты →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-7">
          {MOCK_PROJECTS.map((project) => (
            <Link key={project.id} href="/dashboard/new-project">
              <div className="bg-surface border border-white/7 rounded-2xl p-4 hover:border-white/15 hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-bold">{project.name}</div>
                    <div className="text-xs text-muted">{project.businessType}</div>
                  </div>
                  <span className={`text-[10px] font-semibold ${project.status === "active" ? "text-green-400" : "text-amber-400"}`}>
                    ● {project.status === "active" ? "Активен" : "Пауза"}
                  </span>
                </div>
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {project.plan?.platforms.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                      style={{
                        background: `${PLATFORM_META[p].color}15`,
                        color: PLATFORM_META[p].color,
                        borderColor: `${PLATFORM_META[p].color}40`,
                      }}
                    >
                      {PLATFORM_META[p].shortLabel}
                    </span>
                  ))}
                </div>
                <div className="h-1 bg-surface3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-accent2 rounded-full"
                    style={{ width: project.status === "active" ? "73%" : "40%" }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[11px] text-muted">
                  <span>{project.status === "active" ? "73%" : "40%"} выполнено</span>
                  <span>{project.plan?.posts.length ?? 0} постов</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Upcoming posts */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold">Ближайшие публикации</h2>
        </div>
        <div className="flex flex-col gap-2">
          {MOCK_PROJECTS[0].plan?.posts.map((post) => (
            <div key={post.id} className="flex items-start gap-3 p-4 bg-surface2 border border-white/7 rounded-xl">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: `${PLATFORM_META[post.platform].color}20`,
                  color: PLATFORM_META[post.platform].color,
                }}
              >
                {PLATFORM_META[post.platform].shortLabel}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white leading-relaxed line-clamp-2">{post.text}</p>
                <p className="text-[10px] text-muted mt-1">
                  {post.bestTime} · {post.hashtags.slice(0, 3).join(" ")}
                </p>
              </div>
              <button className="text-xs text-muted border border-white/10 px-3 py-1.5 rounded-lg hover:text-white hover:border-white/20 transition-all flex-shrink-0">
                Опубликовать
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
