import { generateText } from "ai";
import { getGoogleClient, getGeminiModelIdsToTry } from "./google-client";

function shouldTryNextGeminiModel(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  if (/401|403|PERMISSION_DENIED|invalid api key|API key not valid/i.test(msg)) {
    return false;
  }
  return /429|RESOURCE_EXHAUSTED|quota|exceeded|limit:\s*0|NOT_FOUND|not found|404/i.test(
    msg
  );
}

/**
 * Последовательно пробует модели из цепочки при 429/404 (разные лимиты free tier на модель).
 * maxRetries: 0 — чтобы при исчерпании квоты SDK не делал 3 одинаковых запроса.
 */
export async function generateTextWithGeminiFallback(
  apiKey: string,
  args: Omit<Parameters<typeof generateText>[0], "model">
) {
  const google = getGoogleClient(apiKey);
  const chain = getGeminiModelIdsToTry();
  let lastError: unknown;
  for (const modelId of chain) {
    try {
      return await generateText({
        ...args,
        model: google(modelId),
        maxRetries: 0,
      });
    } catch (e) {
      lastError = e;
      if (shouldTryNextGeminiModel(e)) continue;
      throw e;
    }
  }
  throw lastError;
}
