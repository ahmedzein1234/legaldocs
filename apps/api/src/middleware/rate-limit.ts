import { Context, Next } from 'hono';
import { Errors } from '../lib/errors.js';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (c: Context) => string; // Custom key generator
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (for single worker instance)
// In production, use KV or Durable Objects for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator } = config;

  return async (c: Context, next: Next) => {
    // Generate rate limit key
    const key = keyGenerator
      ? keyGenerator(c)
      : c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';

    const now = Date.now();
    let entry = rateLimitStore.get(key);

    // Initialize or reset if window expired
    if (!entry || entry.resetAt < now) {
      entry = {
        count: 0,
        resetAt: now + windowMs,
      };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);

    // Set rate limit headers
    c.header('X-RateLimit-Limit', String(maxRequests));
    c.header('X-RateLimit-Remaining', String(Math.max(0, maxRequests - entry.count)));
    c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    // Check if rate limited
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.header('Retry-After', String(retryAfter));
      return c.json(Errors.rateLimited(retryAfter).toJSON(), 429);
    }

    await next();
  };
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const rateLimiters = {
  // Strict limit for auth endpoints (prevent brute force)
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 attempts per 15 minutes
    keyGenerator: (c) => {
      const ip = c.req.header('CF-Connecting-IP') || 'unknown';
      return `auth:${ip}`;
    },
  }),

  // Standard API rate limit
  api: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  }),

  // Stricter limit for AI generation (expensive operations)
  aiGeneration: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 generations per minute
    keyGenerator: (c) => {
      const userId = c.get('userId') || 'anonymous';
      return `ai:${userId}`;
    },
  }),

  // Upload rate limit (prevent abuse of storage)
  upload: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 uploads per minute
    keyGenerator: (c) => {
      const userId = c.get('userId') || 'anonymous';
      return `upload:${userId}`;
    },
  }),

  // Very strict limit for sensitive operations (password reset, email change, etc.)
  sensitive: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 attempts per hour
    keyGenerator: (c) => {
      const ip = c.req.header('CF-Connecting-IP') || 'unknown';
      const userId = c.get('userId') || 'anonymous';
      return `sensitive:${ip}:${userId}`;
    },
  }),

  // Registration rate limit (prevent spam accounts)
  registration: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 registrations per hour per IP
    keyGenerator: (c) => {
      const ip = c.req.header('CF-Connecting-IP') || 'unknown';
      return `register:${ip}`;
    },
  }),

  // Email sending rate limit (prevent email spam)
  email: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 emails per hour per user
    keyGenerator: (c) => {
      const userId = c.get('userId') || 'anonymous';
      return `email:${userId}`;
    },
  }),

  // Document generation rate limit
  documentGeneration: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 documents per minute
    keyGenerator: (c) => {
      const userId = c.get('userId') || 'anonymous';
      return `docgen:${userId}`;
    },
  }),

  // Signature request rate limit
  signatureRequest: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 signature requests per hour
    keyGenerator: (c) => {
      const userId = c.get('userId') || 'anonymous';
      return `signature:${userId}`;
    },
  }),

  // Search/query rate limit (prevent scraping)
  search: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
    keyGenerator: (c) => {
      const userId = c.get('userId') || 'anonymous';
      return `search:${userId}`;
    },
  }),

  // Public API rate limit (for unauthenticated endpoints)
  public: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 requests per minute
    keyGenerator: (c) => {
      const ip = c.req.header('CF-Connecting-IP') || 'unknown';
      return `public:${ip}`;
    },
  }),
};

/**
 * Sliding window rate limiter using KV store
 * More accurate but requires Cloudflare KV
 */
export function kvRateLimit(
  config: RateLimitConfig & { kvNamespace: KVNamespace }
) {
  const { windowMs, maxRequests, keyGenerator, kvNamespace } = config;

  return async (c: Context, next: Next) => {
    const key = keyGenerator
      ? keyGenerator(c)
      : c.req.header('CF-Connecting-IP') || 'unknown';

    const kvKey = `ratelimit:${key}`;
    const now = Date.now();

    // Get current window data
    const data = await kvNamespace.get(kvKey, 'json') as RateLimitEntry | null;

    let entry: RateLimitEntry;
    if (!data || data.resetAt < now) {
      entry = {
        count: 1,
        resetAt: now + windowMs,
      };
    } else {
      entry = {
        count: data.count + 1,
        resetAt: data.resetAt,
      };
    }

    // Store updated data
    const ttl = Math.ceil((entry.resetAt - now) / 1000);
    await kvNamespace.put(kvKey, JSON.stringify(entry), { expirationTtl: ttl });

    // Set headers
    c.header('X-RateLimit-Limit', String(maxRequests));
    c.header('X-RateLimit-Remaining', String(Math.max(0, maxRequests - entry.count)));
    c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.header('Retry-After', String(retryAfter));
      return c.json(Errors.rateLimited(retryAfter).toJSON(), 429);
    }

    await next();
  };
}
