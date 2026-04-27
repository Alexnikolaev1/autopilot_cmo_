"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button, Input } from "@/components/ui";
import { ALL_PLATFORMS, PLATFORM_META } from "@/lib/types";
import type { Platform } from "@/lib/types";
import type { Competitor, CompetitorAnalysis, CompetitorComparisonReport } from "@/lib/competitors/types";
import { AnalysisCard, ComparisonReportView } from "@/components/competitors/AnalysisViews";

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [yourBusiness, setYourBusiness] = useState("");
  const [marketContext, setMarketContext] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{
    type: "single" | "full";
    data: CompetitorAnalysis | CompetitorComparisonReport;
  } | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    url: "",
    platforms: [] as Platform[],
    notes: "",
  });
  const [adding, setAdding] = useState(false);

  const fetchCompetitors = useCallback(async () => {
    try {
      const res = await fetch("/api/competitors");
      if (res.ok) {
        const data = await res.json();
        setCompetitors(data.competitors ?? []);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  const togglePlatform = (p: Platform) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p],
    }));
  };

  const handleAdd = async () => {
    if (!form.name || !form.url || form.platforms.length === 0) {
      toast.error("Заполните название, URL и выберите платформы");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Ошибка");
        return;
      }
      toast.success(`${form.name} добавлен`);
      setForm({ name: "", url: "", platforms: [], notes: "" });
      setShowAddForm(false);
      await fetchCompetitors();
    } catch {
      toast.error("Ошибка сети");
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch("/api/competitors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      toast.success("Конкурент удалён");
      await fetchCompetitors();
      if (
        analysisResult?.type === "single" &&
        (analysisResult.data as CompetitorAnalysis).competitorId === id
      ) {
        setAnalysisResult(null);
      }
    } catch {
      toast.error("Ошибка удаления");
    }
    setDeleting(null);
  };

  const analyzeBody = (extra?: { competitorId?: string }) => ({
    yourBusiness,
    ...(marketContext.trim() ? { marketContext: marketContext.trim() } : {}),
    ...extra,
  });

  const handleAnalyzeSingle = async (competitor: Competitor) => {
    if (!yourBusiness.trim() || yourBusiness.trim().length < 15) {
      toast.error("Опишите ваш бизнес (не меньше 15 символов)");
      return;
    }
    setAnalyzing(competitor.id);
    setAnalysisResult(null);
    try {
      const res = await fetch("/api/competitors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analyzeBody({ competitorId: competitor.id })),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Ошибка анализа");
        return;
      }
      setAnalysisResult({ type: "single", data: data.analysis });
      toast.success(`Анализ «${competitor.name}» готов`);
    } catch {
      toast.error("Ошибка сети");
    }
    setAnalyzing(null);
  };

  const handleFullReport = async () => {
    if (!yourBusiness.trim() || yourBusiness.trim().length < 15) {
      toast.error("Опишите ваш бизнес (не меньше 15 символов)");
      return;
    }
    if (competitors.length === 0) {
      toast.error("Добавьте конкурентов");
      return;
    }
    setAnalyzing("all");
    setAnalysisResult(null);
    try {
      const res = await fetch("/api/competitors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analyzeBody()),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Ошибка");
        return;
      }
      setAnalysisResult({ type: "full", data: data.report });
      toast.success("Полный отчёт готов");
    } catch {
      toast.error("Ошибка сети");
    }
    setAnalyzing(null);
  };

  const resultTitle = analysisResult
    ? analysisResult.type === "single"
      ? `Анализ: ${(analysisResult.data as CompetitorAnalysis).competitorName}`
      : "Сравнительный отчёт по конкурентам"
    : "";

  const resultDate =
    analysisResult &&
    (analysisResult.type === "single"
      ? (analysisResult.data as CompetitorAnalysis).analyzedAt
      : (analysisResult.data as CompetitorComparisonReport).generatedAt);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        <div className="w-80 min-w-[280px] sm:min-w-80 border-r border-white/7 flex flex-col bg-surface">
          <div className="px-5 py-4 border-b border-white/7">
            <h1 className="text-base font-bold">Анализ конкурентов</h1>
            <p className="text-[11px] text-muted mt-0.5">
              AI-разведка: стратегия, контент-микс, SWOT, действия для вас
            </p>
          </div>

          <div className="p-4 border-b border-white/7">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">Ваш бизнес</div>
            <textarea
              className="w-full bg-surface2 border border-white/10 rounded-xl text-white text-xs px-3 py-2.5 outline-none focus:border-accent resize-none placeholder:text-muted2"
              rows={3}
              placeholder="Ниша, УТП, целевая аудитория (от 15 символов)…"
              value={yourBusiness}
              onChange={(e) => setYourBusiness(e.target.value)}
            />
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2 mt-3">Контекст рынка (опц.)</div>
            <textarea
              className="w-full bg-surface2 border border-white/10 rounded-xl text-white text-xs px-3 py-2 outline-none focus:border-accent resize-none placeholder:text-muted2"
              rows={2}
              placeholder="Регион, сезон, ограничения, юрисдикция…"
              value={marketContext}
              onChange={(e) => setMarketContext(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Конкуренты ({competitors.length})
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-[11px] text-accent2 hover:text-white transition-colors font-semibold"
                type="button"
              >
                + Добавить
              </button>
            </div>

            {showAddForm && (
              <div className="mx-3 mb-3 bg-surface2 border border-white/10 rounded-xl p-3 flex flex-col gap-2.5">
                <Input
                  className="!bg-surface3"
                  placeholder="Название конкурента"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
                <Input
                  className="!bg-surface3"
                  placeholder="competitor.ru"
                  value={form.url}
                  onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                />
                <div>
                  <div className="text-[10px] text-muted mb-1.5">Площадки</div>
                  <div className="flex flex-wrap gap-1">
                    {ALL_PLATFORMS.map((p) => {
                      const meta = PLATFORM_META[p];
                      const sel = form.platforms.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePlatform(p)}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg border transition-all"
                          style={
                            sel
                              ? { background: `${meta.color}20`, borderColor: `${meta.color}60`, color: meta.color }
                              : { background: "transparent", borderColor: "rgba(255,255,255,0.1)", color: "#555566" }
                          }
                        >
                          {meta.shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <textarea
                  className="w-full bg-surface3 border border-white/10 rounded-lg text-white text-xs px-2.5 py-2 outline-none focus:border-accent placeholder:text-muted2 resize-none"
                  rows={2}
                  placeholder="Заметки (опционально)"
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button size="sm" loading={adding} onClick={handleAdd} className="flex-1">
                    Добавить
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                    Отмена
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col gap-2 px-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-surface2 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : competitors.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-muted2">
                <div className="text-3xl mb-2">🔍</div>
                Добавьте конкурентов — список хранится в зашифрованной сессии
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 px-3 pb-3">
                {competitors.map((comp) => {
                  const isAnalyzing = analyzing === comp.id;
                  return (
                    <div key={comp.id} className="bg-surface2 border border-white/7 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{comp.name}</div>
                          <div className="text-[10px] text-muted truncate">{comp.url}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(comp.id)}
                          disabled={deleting === comp.id}
                          className="text-muted2 hover:text-red-400 transition-colors text-xs flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex gap-1 flex-wrap mb-2">
                        {comp.platforms.map((p) => {
                          const meta = PLATFORM_META[p];
                          return (
                            <span
                              key={p}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{ background: `${meta.color}15`, color: meta.color }}
                            >
                              {meta.shortLabel}
                            </span>
                          );
                        })}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={isAnalyzing}
                        onClick={() => handleAnalyzeSingle(comp)}
                        className="w-full text-[11px]"
                      >
                        {isAnalyzing ? "Анализ…" : "✦ Анализировать"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {competitors.length > 1 && (
            <div className="p-4 border-t border-white/7 flex-shrink-0">
              <Button className="w-full" loading={analyzing === "all"} onClick={handleFullReport}>
                {analyzing === "all" ? "Формирую отчёт…" : `✦ Сводный отчёт (${competitors.length})`}
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0">
          {analyzing && (
            <div className="flex flex-col items-center justify-center min-h-[240px] gap-4">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-accent2 animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <p className="text-muted text-sm">AI строит отчёт (до 1 мин)…</p>
              <p className="text-xs text-muted2 text-center max-w-md">
                Учитываем ваше описание, площадки конкурентов, опциональный контекст рынка
              </p>
            </div>
          )}

          {!analyzing && !analysisResult && (
            <div className="flex flex-col items-center justify-center min-h-[320px] gap-4 text-center px-2">
              <div className="text-5xl">🔬</div>
              <div>
                <div className="text-base font-bold mb-1">Конкурентная разведка</div>
                <p className="text-sm text-muted max-w-md">
                  Одиночный анализ — глубокий разбор. Сводный отчёт — сравнение, риски, стратегия. Данные
                  остаются в вашей сессии.
                </p>
              </div>
            </div>
          )}

          {!analyzing && analysisResult && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-base font-bold">{resultTitle}</h2>
                  <p className="text-xs text-muted mt-0.5">
                    {resultDate
                      ? new Date(resultDate).toLocaleString("ru-RU")
                      : ""}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setAnalysisResult(null)}>
                  Очистить
                </Button>
              </div>

              {analysisResult.type === "single" ? (
                <AnalysisCard analysis={analysisResult.data as CompetitorAnalysis} />
              ) : (
                <ComparisonReportView report={analysisResult.data as CompetitorComparisonReport} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
