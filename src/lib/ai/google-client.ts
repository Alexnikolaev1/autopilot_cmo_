import { createGoogleGenerativeAI } from "@ai-sdk/google";

/** Модели `*-preview*` часто недоступны в v1beta / generateContent — см. ошибки Google 404 NOT_FOUND */
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

export function getGeminiModelId(): string {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_GEMINI_MODEL;
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
