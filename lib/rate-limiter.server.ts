interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding rate limiter per identifier (e.g. IP)
 * Returns { allowed, remaining, retryAfterSeconds }
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Periodically clean expired entries
  if (rateLimitMap.size > 5000) {
    rateLimitMap.forEach((val, key) => {
      if (val.resetAt <= now) {
        rateLimitMap.delete(key);
      }
    });
  }

  if (!record || record.resetAt <= now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count, retryAfterSeconds: 0 };
}

export function resetRateLimits(): void {
  rateLimitMap.clear();
}
