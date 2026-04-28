import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Цепочка по умолчанию: сначала lite (высокий объём / отдельные квоты free tier),
 * затем flash 2.5 / 2.0. См. https://ai.google.dev/gemini-api/docs/rate-limits
 */
export const GEMINI_MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
] as const;

/** Переопределить всю цепочку: `GEMINI_MODEL_FALLBACKS=gemini-2.5-flash-lite,gemini-2.5-flash` */
export function getGeminiModelIdsToTry(): string[] {
  const custom = process.env.GEMINI_MODEL_FALLBACKS?.trim();
  if (custom) {
    return custom
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const primary = process.env.GEMINI_MODEL?.trim();
  if (primary) {
    const rest = GEMINI_MODEL_FALLBACK_CHAIN.filter((m) => m !== primary);
    return [primary, ...rest];
  }
  return [...GEMINI_MODEL_FALLBACK_CHAIN];
}

export function getGeminiModelId(): string {
  return getGeminiModelIdsToTry()[0] ?? GEMINI_MODEL_FALLBACK_CHAIN[0];
}

export function getGoogleClient(apiKey: string) {
  return createGoogleGenerativeAI({ apiKey });
}

export function getModel(apiKey: string) {
  const google = getGoogleClient(apiKey);
  return google(getGeminiModelId());
}

export const CMO_SYSTEM_PROMPT = `You are a world-class Chief Marketing Officer and Senior SMM strategist with 15+ years of experience growing brands on social media. You specialize in content marketing for small and medium businesses.

Your expertise:
- Crafting viral, platform-native content for VK, OK, and MAX
- Building content strategies that drive genuine engagement and conversions
- Writing in the brand voice that resonates with target audiences
- Analyzing performance data to optimize future content

When generating content:
- Always write in Russian unless explicitly asked otherwise
- Be specific, practical, and action-oriented
- Include concrete examples and ready-to-use copy
- Use relevant emojis to increase engagement where appropriate
- Consider platform-specific best practices (character limits, hashtag culture, etc.)
- Focus on value for the audience, not just promotion

Respond directly with the requested content — no preambles like "Sure!" or "Of course!"`;
