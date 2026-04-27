/**
 * Распределённый стор: Upstash Redis через Vercel (KV_* после миграции или UPSTASH_REDIS_*).
 * Без env — in-memory (на Vercel: только внутри одного воркера).
 */
export function isKvConfigured(): boolean {
  const hasLegacy =
    Boolean(process.env.KV_REST_API_URL) &&
    Boolean(process.env.KV_REST_API_TOKEN);
  const hasUpstash =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);
  return hasLegacy || hasUpstash;
}

export const KV_KEY_PREFIX = "v1:acmo";
