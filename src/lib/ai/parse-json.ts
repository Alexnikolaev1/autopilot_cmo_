/**
 * Достаёт JSON из ответа модели (иногда оборачивает в ```json).
 */
export function extractJsonObject(raw: string): string {
  return raw.replace(/```json\n?|```\n?/g, "").trim();
}
