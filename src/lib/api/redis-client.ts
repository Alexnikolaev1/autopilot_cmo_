import { Redis } from "@upstash/redis";

let cached: Redis | null | undefined;

/**
 * HTTP-клиент к Upstash Redis (Vercel Marketplace / интеграция «Redis»).
 * Поддерживает legacy KV_* (после миграции с Vercel KV) и нативные UPSTASH_REDIS_*.
 */
export function getRedis(): Redis | null {
  if (cached !== undefined) {
    return cached;
  }
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    cached = null;
    return null;
  }
  cached = new Redis({ url, token });
  return cached;
}
