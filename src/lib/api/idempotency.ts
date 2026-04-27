import { isKvConfigured, KV_KEY_PREFIX } from "@/lib/api/kv-config";
import { getRedis } from "@/lib/api/redis-client";

const DEFAULT_TTL_SEC = 60 * 10;

interface IdempotencyEntry<T> {
  value: T;
  expiresAt: number;
}

const entries = new Map<string, IdempotencyEntry<unknown>>();

function getMemory<T>(key: string): T | null {
  const current = entries.get(key);
  if (!current) return null;
  if (current.expiresAt <= Date.now()) {
    entries.delete(key);
    return null;
  }
  return current.value as T;
}

function setMemory<T>(key: string, value: T, ttlMs: number): void {
  entries.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

function cleanupMemory(maxEntries = 5000): void {
  if (entries.size <= maxEntries) return;
  const now = Date.now();
  entries.forEach((entry, k) => {
    if (entry.expiresAt <= now) {
      entries.delete(k);
    }
  });
}

async function getKv<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  const k = `${KV_KEY_PREFIX}:idemp:${key}`;
  const raw = await redis.get(k);
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
  return raw as T;
}

async function setKv<T>(key: string, value: T, ttlSec: number): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    throw new Error("Redis not configured");
  }
  const k = `${KV_KEY_PREFIX}:idemp:${key}`;
  await redis.set(k, JSON.stringify(value), { ex: ttlSec });
}

/**
 * Idempotency: при KV — общий для всех инстансов; иначе — только в памяти.
 */
export async function getIdempotentValue<T>(key: string): Promise<T | null> {
  if (isKvConfigured()) {
    try {
      return await getKv<T>(key);
    } catch (e) {
      console.error("[idempotency] KV get error, using memory", e);
    }
  }
  return getMemory<T>(key);
}

export async function setIdempotentValue<T>(
  key: string,
  value: T,
  ttlMs = DEFAULT_TTL_SEC * 1000
): Promise<void> {
  const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));
  if (isKvConfigured()) {
    try {
      await setKv(key, value, ttlSec);
      return;
    } catch (e) {
      console.error("[idempotency] KV set error, using memory", e);
    }
  }
  setMemory(key, value, ttlMs);
}

export function cleanupIdempotency(): void {
  cleanupMemory();
}
