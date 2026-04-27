import { isKvConfigured, KV_KEY_PREFIX } from "@/lib/api/kv-config";
import { getRedis } from "@/lib/api/redis-client";
import { ALL_PLATFORMS, type Platform } from "@/lib/types";

type MetricKey = `${Platform}:${"ok" | "error"}`;

const memoryCounters = new Map<MetricKey, number>();
const memoryDurations = new Map<Platform, { totalMs: number; count: number }>();

function counterKey(platform: Platform, status: "ok" | "error"): string {
  return `${KV_KEY_PREFIX}:m:pub:${platform}:${status}`;
}

export async function trackPublishResult(
  platform: Platform,
  status: "ok" | "error",
  durationMs: number
): Promise<void> {
  if (isKvConfigured()) {
    try {
      const redis = getRedis();
      if (redis) {
        await redis.incr(counterKey(platform, status));
      } else {
        throw new Error("Redis client unavailable");
      }
    } catch (e) {
      console.error("[metrics] KV incr error, using memory for counters", e);
      const k: MetricKey = `${platform}:${status}`;
      memoryCounters.set(k, (memoryCounters.get(k) ?? 0) + 1);
    }
  } else {
    const k: MetricKey = `${platform}:${status}`;
    memoryCounters.set(k, (memoryCounters.get(k) ?? 0) + 1);
  }

  const duration = memoryDurations.get(platform) ?? { totalMs: 0, count: 0 };
  duration.totalMs += durationMs;
  duration.count += 1;
  memoryDurations.set(platform, duration);
}

export async function getPublishMetricsSnapshot() {
  const counters: Record<string, number> = {};
  const avgDurationMsByPlatform: Record<string, number> = {};

  if (isKvConfigured()) {
    try {
      const redis = getRedis();
      if (!redis) {
        throw new Error("Redis client unavailable");
      }
      for (const platform of ALL_PLATFORMS) {
        const [ok, err] = await Promise.all([
          redis.get(counterKey(platform, "ok")),
          redis.get(counterKey(platform, "error")),
        ]);
        counters[`${platform}:ok`] =
          ok == null ? 0 : Number(ok);
        counters[`${platform}:error`] =
          err == null ? 0 : Number(err);
      }
    } catch (e) {
      console.error("[metrics] KV snapshot error, falling back to memory", e);
      for (const platform of ALL_PLATFORMS) {
        const okKey: MetricKey = `${platform}:ok`;
        const errKey: MetricKey = `${platform}:error`;
        counters[`${platform}:ok`] = memoryCounters.get(okKey) ?? 0;
        counters[`${platform}:error`] = memoryCounters.get(errKey) ?? 0;
      }
    }
  } else {
    for (const platform of ALL_PLATFORMS) {
      const okKey: MetricKey = `${platform}:ok`;
      const errKey: MetricKey = `${platform}:error`;
      counters[`${platform}:ok`] = memoryCounters.get(okKey) ?? 0;
      counters[`${platform}:error`] = memoryCounters.get(errKey) ?? 0;
    }
  }

  for (const platform of ALL_PLATFORMS) {
    const data = memoryDurations.get(platform);
    avgDurationMsByPlatform[platform] =
      data && data.count > 0
        ? Math.round(data.totalMs / data.count)
        : 0;
  }

  return { counters, avgDurationMsByPlatform };
}
