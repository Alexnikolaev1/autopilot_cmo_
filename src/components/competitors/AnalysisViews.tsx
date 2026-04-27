"use client";

import { useState } from "react";
import { PLATFORM_META } from "@/lib/types";
import type { CompetitorAnalysis, CompetitorComparisonReport } from "@/lib/competitors/types";

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const map = {
    high: { label: "Высокий", cls: "text-red-400 bg-red-400/10 border-red-400/20" },
    medium: { label: "Средний", cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    low: { label: "Низкий", cls: "text-green-400 bg-green-400/10 border-green-400/20" },
  };
  const { label, cls } = map[priority];
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${cls}`}>
      {label}
    </span>
  );
}

function ContentMixBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted">{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-surface3 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function SwotGrid({
  swot,
}: {
  swot: NonNullable<CompetitorAnalysis["swot"]>;
}) {
  const cells: { key: keyof typeof swot; title: string; color: string }[] = [
    { key: "strengths", title: "S — Сильные", color: "#34d399" },
    { key: "weaknesses", title: "W — Слабые", color: "#f87171" },
    { key: "opportunities", title: "O — Возможности", color: "#38bdf8" },
    { key: "threats", title: "T — Угрозы", color: "#a78bfa" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {cells.map(({ key, title, color }) => (
        <div
          key={key}
          className="bg-surface2 border border-white/7 rounded-xl p-3"
          style={{ borderColor: `${color}30` }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color }}>
            {title}
          </div>
          <ul className="space-y-1">
            {(swot[key] as string[]).map((s, i) => (
              <li key={i} className="text-xs text-muted">
                {s}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function AnalysisCard({ analysis }: { analysis: CompetitorAnalysis }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface border border-white/7 rounded-2xl overflow-hidden">
      <div className="p-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold text-base">{analysis.competitorName}</div>
          <div className="text-xs text-muted mt-0.5">
            Анализ: {new Date(analysis.analyzedAt).toLocaleString("ru-RU")}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {analysis.smmMaturityScore != null && (
            <div
              className="text-center px-2.5 py-1 rounded-lg border border-accent/30 bg-accent/5"
              title="Оценка зрелости SMM (эвристика)"
            >
              <div className="text-[9px] text-muted uppercase">SMM</div>
              <div className="text-lg font-black text-accent2 leading-none">
                {analysis.smmMaturityScore}
                <span className="text-xs text-muted">/10</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-muted hover:text-accent2 transition-colors whitespace-nowrap"
          >
            {expanded ? "Свернуть ↑" : "Подробнее ↓"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0 border-t border-white/7">
        <div className="p-4 border-r border-white/7">
          <div className="text-[10px] uppercase tracking-wider text-muted mb-1">Тон</div>
          <div className="text-xs font-semibold text-white">{analysis.tone}</div>
        </div>
        <div className="p-4 border-r border-white/7">
          <div className="text-[10px] uppercase tracking-wider text-muted mb-1">Частота</div>
          <div className="text-xs font-semibold text-white">{analysis.postingFrequency}</div>
        </div>
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted mb-1">Аудитория</div>
          <div className="text-xs font-semibold text-white">{analysis.targetAudience}</div>
        </div>
      </div>

      {(analysis.keyInsights?.length ?? 0) > 0 && (
        <div className="px-5 py-3 border-t border-white/7 bg-surface2/50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-accent2 mb-2">
            Ключевые инсайты
          </div>
          <div className="flex flex-col gap-2">
            {(analysis.keyInsights ?? []).map((ins, i) => (
              <div key={i} className="text-xs">
                <span className="font-bold text-white">{ins.title}.</span>{" "}
                <span className="text-muted">{ins.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && (
        <div className="border-t border-white/7 p-5 flex flex-col gap-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Позиционирование</div>
            <p className="text-sm text-white leading-relaxed">{analysis.positioning}</p>
            <p className="text-xs text-muted mt-1">{analysis.valueProposition}</p>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Контент-микс</div>
            <div className="flex flex-col gap-2.5">
              <ContentMixBar label="Промо" value={analysis.contentMix.promo} color="#f87171" />
              <ContentMixBar label="Образовательный" value={analysis.contentMix.educational} color="#34d399" />
              <ContentMixBar label="Развлекательный" value={analysis.contentMix.entertaining} color="#a78bfa" />
              <ContentMixBar label="Новости" value={analysis.contentMix.news} color="#38bdf8" />
            </div>
          </div>

          {analysis.swot && <SwotGrid swot={analysis.swot} />}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-green-400 mb-2">✓ Сильные стороны</div>
              <ul className="flex flex-col gap-1.5">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-muted flex items-start gap-1.5">
                    <span className="text-green-400 mt-0.5">●</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">✗ Слабые стороны</div>
              <ul className="flex flex-col gap-1.5">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-muted flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">●</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">⚡ Возможности для вас</div>
            <div className="flex flex-col gap-2">
              {analysis.contentGaps.map((gap, i) => (
                <div key={i} className="text-xs text-white bg-amber-400/5 border border-amber-400/15 rounded-lg px-3 py-2">
                  {gap}
                </div>
              ))}
            </div>
          </div>

          {analysis.topHashtags.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Топ хештеги</div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.topHashtags.map((tag) => (
                  <span key={tag} className="text-[11px] text-accent2 font-mono bg-accent/10 px-2 py-0.5 rounded">
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.samplePosts.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Типичные посты</div>
              <div className="flex flex-col gap-2">
                {analysis.samplePosts.map((post, i) => {
                  const meta = PLATFORM_META[post.platform];
                  return (
                    <div key={i} className="bg-surface2 rounded-xl p-3 border border-white/7">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-white font-black text-[10px]"
                          style={{ background: meta?.color ?? "#666" }}
                        >
                          {meta?.shortLabel ?? "?"}
                        </div>
                        <span className="text-[10px] text-muted">{meta?.label}</span>
                        <span className="text-[10px] text-muted">·</span>
                        <span className="text-[10px] text-muted">охват ~{post.estimatedReach}</span>
                        <span className="text-[10px] text-green-400">вовл. {post.engagement}</span>
                      </div>
                      <p className="text-xs text-white leading-relaxed">{post.text}</p>
                      {post.hooks && post.hooks.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {post.hooks.map((h, j) => (
                            <span key={j} className="text-[10px] text-muted2 bg-surface3 px-2 py-0.5 rounded">
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-accent2 mb-2">★ Рекомендации</div>
            <div className="flex flex-col gap-2">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="bg-surface2 rounded-xl p-3 border border-white/7">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="text-xs font-bold text-white">{rec.title}</div>
                    <PriorityBadge priority={rec.priority} />
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Возможности дифференциации</div>
            <ul className="flex flex-col gap-1">
              {analysis.differentiationOpportunities.map((op, i) => (
                <li key={i} className="text-xs text-muted flex items-start gap-1.5">
                  <span className="text-accent2">✦</span> {op}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function ComparisonReportView({ report }: { report: CompetitorComparisonReport }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-surface border border-accent/20 rounded-2xl p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-accent2 mb-3">✦ Общие выводы</div>
        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{report.overallInsights}</p>
      </div>

      {report.marketSnapshot && (
        <div className="bg-surface border border-sky-500/25 rounded-2xl p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2">Снимок рынка</div>
          <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{report.marketSnapshot}</p>
        </div>
      )}

      {report.riskWatchlist && report.riskWatchlist.length > 0 && (
        <div className="bg-surface border border-amber-500/25 rounded-2xl p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Риски к мониторингу</div>
          <ul className="space-y-1.5">
            {report.riskWatchlist.map((r, i) => (
              <li key={i} className="text-sm text-white flex gap-2">
                <span className="text-amber-400">▸</span> {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-surface border border-green-500/20 rounded-2xl p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-green-400 mb-3">⚡ Быстрые победы</div>
        <div className="flex flex-col gap-2">
          {report.quickWins.map((win, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm">
              <span className="text-green-400 font-bold flex-shrink-0">{i + 1}.</span>
              <span className="text-white">{win}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-white/7 rounded-2xl p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Стратегические рекомендации</div>
        <div className="flex flex-col gap-2">
          {report.strategicRecommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm">
              <span className="text-accent2 font-bold flex-shrink-0">→</span>
              <span className="text-white">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs font-bold uppercase tracking-wider text-muted mb-1 mt-2">
        Детальный анализ ({report.competitors.length} конкурентов)
      </div>
      {report.competitors.map((analysis) => (
        <AnalysisCard key={analysis.competitorId} analysis={analysis} />
      ))}
    </div>
  );
}
