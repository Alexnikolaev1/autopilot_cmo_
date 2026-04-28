import { getSession } from "@/lib/get-session";
import { CMO_SYSTEM_PROMPT } from "@/lib/ai/google-client";
import { generateTextWithGeminiFallback } from "@/lib/ai/gemini-generate";
import { ALL_PLATFORMS, PLATFORM_META } from "@/lib/types";
import { z } from "zod";

const planRequestSchema = z.object({
  businessDescription: z.string().min(10),
  targetAudience: z.string().min(5),
  platforms: z.array(z.enum(ALL_PLATFORMS)).min(1),
  tone: z.enum(["professional", "humorous", "inspirational", "warm", "casual"]),
  postsPerWeek: z.number().min(1).max(21),
  additionalContext: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = planRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { businessDescription, targetAudience, platforms, tone, postsPerWeek, additionalContext } = parsed.data;

    // Build platform-specific guidance
    const platformGuide = platforms.map(p => {
      const meta = PLATFORM_META[p];
      return `- ${meta.label}: до ${meta.maxLength} символов, аудитория: ${meta.audience}`;
    }).join("\n");

    const prompt = `Создай детальный контент-план на 1 неделю.

Бизнес: ${businessDescription}
Целевая аудитория: ${targetAudience}
Платформы: ${platforms.map(p => PLATFORM_META[p].label).join(", ")}
Тон: ${tone}
Количество постов в неделю: ${postsPerWeek}
${additionalContext ? `Дополнительный контекст: ${additionalContext}` : ""}

Особенности платформ:
${platformGuide}

Учти специфику каждой платформы:
- ВКонтакте: живой разговорный стиль, эмодзи уместны, хештеги в конце
- Одноклассники: простой доступный язык, тёплый тон, без молодёжного сленга
- MAX: лаконично, информативно, поддерживает Markdown

Ответь ТОЛЬКО в формате JSON (без markdown-блоков):
{
  "title": "название плана",
  "posts": [
    {
      "id": "уникальный_id_строка",
      "platform": "vk|ok|max",
      "text": "готовый текст поста",
      "hashtags": ["#хештег1", "#хештег2"],
      "bestTime": "HH:MM",
      "dayOfWeek": "Понедельник"
    }
  ]
}`;

    const result = await generateTextWithGeminiFallback(session.geminiApiKey, {
      system: CMO_SYSTEM_PROMPT,
      prompt,
    });

    let plan;
    try {
      const cleanText = result.text.replace(/```json\n?|\n?```/g, "").trim();
      plan = JSON.parse(cleanText);
    } catch {
      return Response.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return Response.json({ plan });
  } catch (error) {
    console.error("Generate plan error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    const isModelNotFound =
      /not found/i.test(msg) ||
      /NOT_FOUND/i.test(msg) ||
      (typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        (error as { statusCode?: number }).statusCode === 404);
    const isQuota =
      /429|quota|RESOURCE_EXHAUSTED|exceeded|limit:\s*0|rate limit/i.test(msg);
    if (isModelNotFound) {
      return Response.json(
        {
          error:
            "Модель Gemini недоступна для этого API. Задайте GEMINI_MODEL или цепочку GEMINI_MODEL_FALLBACKS в переменных окружения.",
        },
        { status: 500 }
      );
    }
    if (isQuota) {
      return Response.json(
        {
          error:
            "Квота Gemini исчерпана (free tier / лимиты на проект). Подождите или смените ключ в Google AI Studio, либо включите оплату по документации: https://ai.google.dev/gemini-api/docs/rate-limits — в коде уже перебираются модели gemini-2.5-flash-lite → 2.5-flash → 2.0-flash.",
        },
        { status: 429 }
      );
    }
    return Response.json(
      { error: "Не удалось сгенерировать план — проверьте ключ и доступ к Gemini." },
      { status: 500 }
    );
  }
}
