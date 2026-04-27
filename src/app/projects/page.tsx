import Link from "next/link";
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { Button } from "@/components/ui";
import { PLATFORM_META } from "@/lib/types";

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-7 py-4 border-b border-white/7 bg-surface">
          <div>
            <h1 className="text-xl font-bold">Проекты</h1>
            <p className="text-xs text-muted mt-0.5">Все ваши контент-проекты</p>
          </div>
          <Link href="/dashboard/new-project">
            <Button size="sm">+ Новый проект</Button>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-7">
          <div className="grid grid-cols-2 gap-4">
            {MOCK_PROJECTS.map((project) => (
              <Link key={project.id} href="/dashboard/new-project">
                <div className="bg-surface border border-white/7 rounded-2xl p-5 hover:border-white/15 hover:-translate-y-0.5 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-base font-bold">{project.name}</div>
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
                  <div className="h-1 bg-surface3 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-accent to-accent2 rounded-full"
                      style={{ width: project.status === "active" ? "73%" : "40%" }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>{project.status === "active" ? "73%" : "40%"} выполнено</span>
                    <span>Создан: {project.createdAt}</span>
                  </div>
                </div>
              </Link>
            ))}

            {/* New project card */}
            <Link href="/dashboard/new-project">
              <div className="bg-surface border border-dashed border-white/15 rounded-2xl p-5 min-h-[160px] flex flex-col items-center justify-center gap-2 hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer group">
                <div className="text-3xl text-muted2 group-hover:text-accent2 transition-colors">+</div>
                <div className="text-sm text-muted group-hover:text-white transition-colors">Новый проект</div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
