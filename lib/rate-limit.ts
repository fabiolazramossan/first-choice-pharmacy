// Fixed-window rate limiter kept in server memory.
//
// Limitation: each serverless instance has its own memory, so on Vercel this
// is a best-effort, per-instance limit. It still stops simple scripted abuse
// hitting one warm instance; a durable, global limit needs Vercel Firewall
// rate-limit rules or a shared store (see README "Seguridad").

type Entry = { count: number; resetAt: number };

export type RateLimiter = {
  /** Records one hit for `key`; returns false when the key is over its limit. */
  hit(key: string, now?: number): boolean;
  /** True when `key` is already over its limit (does not record a hit). */
  isLimited(key: string, now?: number): boolean;
  reset(key: string): void;
  /** Seconds until `key` may try again (0 when not limited). */
  retryAfter(key: string, now?: number): number;
  size(): number;
};

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
}: {
  limit: number;
  windowMs: number;
  maxKeys?: number;
}): RateLimiter {
  const entries = new Map<string, Entry>();

  function sweep(now: number) {
    for (const [key, entry] of entries) {
      if (entry.resetAt <= now) entries.delete(key);
    }
    // Still full (e.g. a flood of distinct keys): drop the oldest entries.
    while (entries.size >= maxKeys) {
      const oldest = entries.keys().next().value;
      if (oldest === undefined) break;
      entries.delete(oldest);
    }
  }

  function current(key: string, now: number): Entry | undefined {
    const entry = entries.get(key);
    if (entry && entry.resetAt <= now) {
      entries.delete(key);
      return undefined;
    }
    return entry;
  }

  return {
    hit(key, now = Date.now()) {
      const entry = current(key, now);
      if (!entry) {
        if (entries.size >= maxKeys) sweep(now);
        entries.set(key, { count: 1, resetAt: now + windowMs });
        return 1 <= limit;
      }
      entry.count += 1;
      return entry.count <= limit;
    },
    isLimited(key, now = Date.now()) {
      const entry = current(key, now);
      return Boolean(entry && entry.count >= limit);
    },
    reset(key) {
      entries.delete(key);
    },
    retryAfter(key, now = Date.now()) {
      const entry = current(key, now);
      return entry && entry.count >= limit ? Math.ceil((entry.resetAt - now) / 1000) : 0;
    },
    size() {
      return entries.size;
    },
  };
}
