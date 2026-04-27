import { Redis as UpstashRedis } from "@upstash/redis";

export interface RedisStore {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: string, opts?: { ex?: number }): Promise<unknown>;
}

let cached: RedisStore | null | undefined;
let nodeRedisClientPromise: Promise<any> | null = null;

async function getNodeRedisClient() {
  if (!nodeRedisClientPromise) {
    nodeRedisClientPromise = (async () => {
      const { createClient } = await import("redis");
      const client = createClient({ url: process.env.REDIS_URL });
      client.on("error", (error: unknown) =>
        console.error("[redis-url] node-redis client error", error)
      );
      await client.connect();
      return client;
    })();
  }
  return nodeRedisClientPromise;
}

/**
 * Унифицированный Redis-клиент:
 * 1) UPSTASH/KV REST env
 * 2) REDIS_URL (node-redis)
 * 3) null (fallback на in-memory слой выше)
 */
export function getRedis(): RedisStore | null {
  if (cached !== undefined) {
    return cached;
  }

  const restUrl =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const restToken =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (restUrl && restToken) {
    const upstash = new UpstashRedis({ url: restUrl, token: restToken });
    cached = {
      incr: (key) => upstash.incr(key),
      expire: (key, seconds) => upstash.expire(key, seconds),
      ttl: (key) => upstash.ttl(key),
      get: (key) => upstash.get(key),
      set: (key, value, opts) =>
        opts?.ex
          ? upstash.set(key, value, { ex: opts.ex } as any)
          : upstash.set(key, value),
    };
    return cached;
  }

  if (process.env.REDIS_URL) {
    cached = {
      async incr(key) {
        const client = await getNodeRedisClient();
        return client.incr(key);
      },
      async expire(key, seconds) {
        const client = await getNodeRedisClient();
        return client.expire(key, seconds);
      },
      async ttl(key) {
        const client = await getNodeRedisClient();
        return client.ttl(key);
      },
      async get<T>(key: string) {
        const client = await getNodeRedisClient();
        const raw = await client.get(key);
        return (raw as T | null) ?? null;
      },
      async set(key, value, opts) {
        const client = await getNodeRedisClient();
        if (opts?.ex) {
          return client.set(key, value, { EX: opts.ex });
        }
        return client.set(key, value);
      },
    };
    return cached;
  }

  cached = null;
  return null;
}
