import { kv } from "@vercel/kv";

export { kv };

export async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const value = await kv.get<T>(key);
    return value ?? null;
  } catch {
    return null;
  }
}

export async function kvSet<T>(
  key: string,
  value: T,
  ttl?: number
): Promise<void> {
  if (ttl !== undefined) {
    await kv.set(key, value, { ex: ttl });
  } else {
    await kv.set(key, value);
  }
}

export async function kvDel(key: string): Promise<void> {
  await kv.del(key);
}

const RESTAURANTS_CACHE_KEY = "restaurants:all";
const RESTAURANTS_TTL = 300; // 5 minutes

export async function cacheRestaurants(restaurants: unknown[]): Promise<void> {
  await kvSet(RESTAURANTS_CACHE_KEY, restaurants, RESTAURANTS_TTL);
}

export async function getCachedRestaurants<T>(): Promise<T[] | null> {
  return kvGet<T[]>(RESTAURANTS_CACHE_KEY);
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await kv.keys(pattern);
    if (keys.length > 0) {
      await kv.del(...keys);
    }
  } catch {
    // Silently fail if pattern matching is not supported or keys not found
  }
}

export async function rateLimiter(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const rateLimitKey = `ratelimit:${key}`;
  const now = Math.floor(Date.now() / 1000);
  const reset = now + windowSeconds;

  try {
    const current = await kv.incr(rateLimitKey);

    if (current === 1) {
      // First request in this window — set the expiry
      await kv.expire(rateLimitKey, windowSeconds);
    }

    const ttl = await kv.ttl(rateLimitKey);
    const windowReset = ttl > 0 ? now + ttl : reset;

    if (current > limit) {
      return {
        success: false,
        remaining: 0,
        reset: windowReset,
      };
    }

    return {
      success: true,
      remaining: Math.max(0, limit - current),
      reset: windowReset,
    };
  } catch {
    // If KV is unavailable, allow the request through
    return {
      success: true,
      remaining: limit,
      reset,
    };
  }
}
