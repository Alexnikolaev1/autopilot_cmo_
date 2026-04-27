import { generateText } from "ai";
import { getSession } from "@/lib/get-session";
import { CMO_SYSTEM_PROMPT, getModel } from "@/lib/ai/google-client";
import { extractJsonObject } from "@/lib/ai/parse-json";
import { getCompetitorById, getCompetitors } from "@/lib/competitors/storage";
import {
  competitorAnalysisJsonSchema,
  comparisonReportJsonSchema,
} from "@/lib/competitors/schemas";
import type { Competitor, CompetitorAnalysis, CompetitorComparisonReport } from "@/lib/competitors/types";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { ALL_PLATFORMS, PLATFORM_META } from "@/lib/types";
import { z } from "zod";

export const maxDuration = 60;

const bodySchema = z.object({
  yourBusiness: z.string().min(15).max(4000),
  competitorId: z.string().optional(),
  /** Доп. контекст ниши / региона */
  marketContext: z.string().max(2000).optional(),
});

const MAX_FULL = 8;

const ANALYSIS_INSTRUCTIONS = `Ты — ведущий стратег по конкурентной разведке в digital и SMM (Россия/СНГ). Работай с тем, что дал пользователь: без доступа в интернет, используй оценки на основе типа бизнеса, URL, заявленных площадок и косвенных сигналов. Буди конкретен: формулировки для action items.

Верни ТОЛЬКО валидный JSON без markdown-оболочек. Числа в contentMix — примерные проценты (сумма ≈ 100). samplePosts: 2–3 примера, реалистичных для платформ. keyInsights: 2–4 пункта (title + detail). swot: по 2–4 пункта в каждом квадранте. smmMaturityScore: 1–10.`;

function platformHints(): string {
  return ALL_PLATFORMS
    .map((p) => `${p}: ${PLATFORM_META[p].label} — ${PLATFORM_META[p].description}`)
    .join("\n");
}

function normalizeContentMix(
  mix: CompetitorAnalysis["contentMix"]
): CompetitorAnalysis["contentMix"] {
  const t =
    mix.promo + mix.educational + mix.entertaining + mix.news;
  if (t === 0) {
    return { promo: 25, educational: 25, entertaining: 25, news: 25 };
  }
  const f = 100 / t;
  return {
    promo: Math.round(mix.promo * f),
    educational: Math.round(mix.educational * f),
    entertaining: Math.round(mix.entertaining * f),
    news: Math.max(0, 100 - Math.round((mix.promo + mix.educational + mix.entertaining) * f)),
  };
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = await checkRateLimit(`analyze:${session.userId}`, {
    windowMs: 60_000,
    limit: 8,
  });
  if (!rate.allowed) {
    return Response.json(
      { error: "Слишком много запросов", retryAfterMs: rate.retryAfterMs },
      { status: 429 }
    );
  }

  const body = await req.json();
  const parsedBody = bodySchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json(
      { error: "Invalid request", details: parsedBody.error.errors },
      { status: 400 }
    );
  }

  const { yourBusiness, competitorId, marketContext } = parsedBody.data;
  const model = getModel(session.geminiApiKey);

  try {
    if (competitorId) {
      const comp = getCompetitorById(competitorId);
      if (!comp) {
        return Response.json({ error: "Конкурент не найден" }, { status: 404 });
      }
      const prompt = `${ANALYSIS_INSTRUCTIONS}

${platformHints()}

--- Задача: одиночный анализ конкурента ---

Ваш бизнес (клиент): ${yourBusiness}
${marketContext ? `Контекст рынка/региона: ${marketContext}\n` : ""}
Конкурент:
- id: ${comp.id}
- Название: ${comp.name}
- URL: ${comp.url}
- Площадки: ${comp.platforms.join(", ")}
- Заметки: ${comp.notes || "—"}

JSON-формат (пример полей, заполни все):
{
  "competitorId": "${comp.id}",
  "competitorName": "…",
  "tone": "…",
  "postingFrequency": "…",
  "targetAudience": "…",
  "positioning": "…",
  "valueProposition": "…",
  "smmMaturityScore": 7,
  "contentMix": { "promo": 30, "educational": 25, "entertaining": 25, "news": 20 },
  "strengths": [],
  "weaknesses": [],
  "contentGaps": [],
  "topHashtags": [],
  "samplePosts": [ { "platform": "vk", "text": "…", "estimatedReach": "…", "engagement": "…", "hooks": [] } ],
  "recommendations": [ { "title": "…", "description": "…", "priority": "high" } ],
  "differentiationOpportunities": [],
  "swot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
  "keyInsights": [ { "title": "…", "detail": "…" } ]
}`;

      const { text } = await generateText({
        model,
        system: CMO_SYSTEM_PROMPT + "\n\n" + ANALYSIS_INSTRUCTIONS,
        prompt,
      });
      const clean = extractJsonObject(text);
      const json = JSON.parse(clean);
      const safe = competitorAnalysisJsonSchema.parse(json);
      const analysis: CompetitorAnalysis = {
        ...safe,
        analyzedAt: new Date().toISOString(),
        competitorName: safe.competitorName || comp.name,
        contentMix: normalizeContentMix(safe.contentMix),
        competitorId: comp.id,
      };
      return Response.json({ analysis });
    }

    const all = getCompetitors();
    if (all.length === 0) {
      return Response.json(
        { error: "Сначала добавьте конкурентов" },
        { status: 400 }
      );
    }
    const batch = all.slice(0, MAX_FULL);
    const listBlock = batch
      .map(
        (c, i) =>
          `${i + 1}) id=${c.id} | ${c.name} | ${c.url} | площадки: ${c.platforms.join(", ")} | заметки: ${c.notes || "—"}`
      )
      .join("\n");

    const prompt = `${ANALYSIS_INSTRUCTIONS}

${platformHints()}

--- Задача: сравнительный отчёт по нескольким конкурентам ---

Ваш бизнес: ${yourBusiness}
${marketContext ? `Контекст рынка/региона: ${marketContext}\n` : ""}
Конкуренты (до ${MAX_FULL}):
${listBlock}

Верни JSON:
{
  "overallInsights": "2–4 абзаца: ландшафт, кто лидер по подаче, типичные дыры",
  "marketSnapshot": "коротко: тренд ниши, риск копирования, окно возможностей",
  "quickWins": [ "3–5 конкретных шагов на 1–2 недели" ],
  "strategicRecommendations": [ "3–6 на 1–3 месяца" ],
  "riskWatchlist": [ "2–4 риска (юридика, кризис доверия, перегрев ниши)" ],
  "competitors": [ /* для КАЖДОГО id из списка — полный объект как в одиночном анализе, competitorId ДОЛЖЕН совпадать */ ]
}
`;

    const { text } = await generateText({
      model,
      system: CMO_SYSTEM_PROMPT + "\n\n" + ANALYSIS_INSTRUCTIONS,
      prompt,
    });
    const clean = extractJsonObject(text);
    const json = JSON.parse(clean);
    const safe = comparisonReportJsonSchema.parse(json);
    const generatedAt = new Date().toISOString();
    const competitorsOut: CompetitorAnalysis[] = [];
    for (const b of batch) {
      let raw = safe.competitors.find((x) => x.competitorId === b.id);
      if (!raw) {
        raw = safe.competitors.find(
          (x) =>
            x.competitorName &&
            b.name &&
            x.competitorName.toLowerCase() === b.name.toLowerCase()
        );
      }
      if (!raw) {
        try {
          competitorsOut.push(
            await singleFallback(model, yourBusiness, b, marketContext)
          );
        } catch {
          /* пропуск при сбое догоняющего вызова */
        }
        continue;
      }
      const full = competitorAnalysisJsonSchema.parse({
        ...raw,
        competitorId: b.id,
        competitorName: raw.competitorName || b.name,
      });
      competitorsOut.push({
        ...full,
        analyzedAt: generatedAt,
        contentMix: normalizeContentMix(full.contentMix),
        competitorId: b.id,
        competitorName: full.competitorName || b.name,
      });
    }
    const report: CompetitorComparisonReport = {
      generatedAt: safe.generatedAt ?? generatedAt,
      overallInsights: safe.overallInsights,
      marketSnapshot: safe.marketSnapshot,
      quickWins: safe.quickWins,
      strategicRecommendations: safe.strategicRecommendations,
      riskWatchlist: safe.riskWatchlist,
      competitors: competitorsOut,
    };
    return Response.json({ report });
  } catch (e) {
    console.error("competitor analyze", e);
    return Response.json(
      { error: "Не удалось разобрать ответ AI. Попробуйте ещё раз." },
      { status: 500 }
    );
  }
}

/** Дозаполняет одного конкурента, если в отчёте не хватило объекта. */
async function singleFallback(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  yourBusiness: string,
  comp: Competitor,
  marketContext?: string
): Promise<CompetitorAnalysis> {
  const prompt = `${ANALYSIS_INSTRUCTIONS}
Ваш бизнес: ${yourBusiness}
${marketContext ? `Контекст: ${marketContext}\n` : ""}
Конкурент: ${comp.name} | ${comp.url} | ${comp.platforms.join(", ")}
JSON как в одиночном анализе. competitorId: "${comp.id}"`;
  const { text } = await generateText({
    model,
    system: CMO_SYSTEM_PROMPT,
    prompt,
  });
  const clean = extractJsonObject(text);
  const json = JSON.parse(clean);
  const safe = competitorAnalysisJsonSchema.parse(json);
  return {
    ...safe,
    analyzedAt: new Date().toISOString(),
    competitorId: comp.id,
    competitorName: safe.competitorName || comp.name,
    contentMix: normalizeContentMix(safe.contentMix),
  };
}
