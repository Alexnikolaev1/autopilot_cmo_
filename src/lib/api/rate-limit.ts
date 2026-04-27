import { isKvConfigured, KV_KEY_PREFIX } from "@/lib/api/kv-config";
import { getRedis } from "@/lib/api/redis-client";

export interface RateLimitConfig {
  windowMs: number;
  limit: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function nowMs(): number {
  return Date.now();
}

function getBucket(key: string, config: RateLimitConfig): Bucket {
  const now = nowMs();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    const fresh = { count: 0, resetAt: now + config.windowMs };
    buckets.set(key, fresh);
    return fresh;
  }
  return current;
}

function checkRateLimitMemory(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const bucket = getBucket(key, config);
  const now = nowMs();
  const retryAfterMs = Math.max(bucket.resetAt - now, 0);

  if (bucket.count >= config.limit) {
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: Math.max(config.limit - bucket.count, 0),
    retryAfterMs,
  };
}

function cleanupMemoryBuckets(maxEntries = 5000): void {
  if (buckets.size <= maxEntries) return;
  const now = nowMs();
  buckets.forEach((bucket, k) => {
    if (bucket.resetAt <= now) {
      buckets.delete(k);
    }
  });
}

async function checkRateLimitKv(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) {
    return checkRateLimitMemory(key, config);
  }
  const k = `${KV_KEY_PREFIX}:rl:${key}`;
  const windowSec = Math.max(1, Math.ceil(config.windowMs / 1000));

  const count = await redis.incr(k);
  if (count === 1) {
    await redis.expire(k, windowSec);
  }

  const ttl = await redis.ttl(k);
  const retryAfterMs = ttl > 0 ? ttl * 1000 : config.windowMs;

  if (count > config.limit) {
    return { allowed: false, remaining: 0, retryAfterMs };
  }
  return {
    allowed: true,
    remaining: Math.max(config.limit - count, 0),
    retryAfterMs,
  };
}

/**
 * Распределённый rate limit на Vercel KV при настроенных KV_*; иначе — память процесса.
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  if (isKvConfigured()) {
    try {
      return await checkRateLimitKv(key, config);
    } catch (e) {
      console.error("[rate-limit] KV error, using memory", e);
    }
  }
  cleanupMemoryBuckets();
  return checkRateLimitMemory(key, config);
}
