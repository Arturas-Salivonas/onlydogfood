import { getRedisCache, RedisCache, cacheKeys } from './redis';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheManagerOptions {
  defaultTTL?: number;
  enableRedis?: boolean;
  enableMemory?: boolean;
  memoryMaxSize?: number;
}

export class CacheManager {
  private redisCache: RedisCache | null = null;
  private memoryCache = new Map<string, CacheEntry<any>>();
  private options: Required<CacheManagerOptions>;

  constructor(options: CacheManagerOptions = {}) {
    this.options = {
      defaultTTL: 300, // 5 minutes
      enableRedis: true,
      enableMemory: true,
      memoryMaxSize: 1000,
      ...options,
    };

    if (this.options.enableRedis) {
      this.redisCache = getRedisCache();
      // Connect to Redis asynchronously
      this.redisCache.connect().catch(() => {
        console.warn('Redis connection failed, falling back to memory cache');
      });
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl * 1000;
  }

  private cleanupMemoryCache(): void {
    if (this.memoryCache.size > this.options.memoryMaxSize) {
      // Remove oldest entries (simple LRU approximation)
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = Math.floor(this.memoryCache.size * 0.2); // Remove 20%
      for (let i = 0; i < toRemove; i++) {
        this.memoryCache.delete(entries[i][0]);
      }
    }

    // Remove expired entries
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Try Redis first if enabled
    if (this.options.enableRedis && this.redisCache?.isReady) {
      try {
        const data = await this.redisCache.get<T>(key);
        if (data !== null) {
          // Also store in memory cache for faster subsequent access
          if (this.options.enableMemory) {
            this.memoryCache.set(key, {
              data,
              timestamp: Date.now(),
              ttl: this.options.defaultTTL,
            });
          }
          return data;
        }
      } catch (error) {
        console.warn('Redis GET failed:', error);
      }
    }

    // Fallback to memory cache
    if (this.options.enableMemory) {
      const entry = this.memoryCache.get(key);
      if (entry && !this.isExpired(entry)) {
        return entry.data;
      }
      // Remove expired entry
      if (entry) {
        this.memoryCache.delete(key);
      }
    }

    return null;
  }

  async set<T>(
    key: string,
    value: T,
    ttl: number = this.options.defaultTTL
  ): Promise<boolean> {
    let redisSuccess = false;
    let memorySuccess = false;

    // Store in Redis if enabled
    if (this.options.enableRedis && this.redisCache?.isReady) {
      try {
        redisSuccess = await this.redisCache.set(key, value, { ttl });
      } catch (error) {
        console.warn('Redis SET failed:', error);
      }
    }

    // Store in memory cache if enabled
    if (this.options.enableMemory) {
      try {
        this.memoryCache.set(key, {
          data: value,
          timestamp: Date.now(),
          ttl,
        });
        this.cleanupMemoryCache();
        memorySuccess = true;
      } catch (error) {
        console.warn('Memory cache SET failed:', error);
      }
    }

    return redisSuccess || memorySuccess;
  }

  async delete(key: string): Promise<boolean> {
    let redisSuccess = false;
    let memorySuccess = false;

    // Delete from Redis if enabled
    if (this.options.enableRedis && this.redisCache?.isReady) {
      try {
        redisSuccess = await this.redisCache.delete(key);
      } catch (error) {
        console.warn('Redis DELETE failed:', error);
      }
    }

    // Delete from memory cache if enabled
    if (this.options.enableMemory) {
      memorySuccess = this.memoryCache.delete(key);
    }

    return redisSuccess || memorySuccess;
  }

  async deletePattern(pattern: string): Promise<boolean> {
    let redisSuccess = false;
    let memorySuccess = false;

    // Delete from Redis if enabled
    if (this.options.enableRedis && this.redisCache?.isReady) {
      try {
        redisSuccess = await this.redisCache.deletePattern(pattern);
      } catch (error) {
        console.warn('Redis DELETE PATTERN failed:', error);
      }
    }

    // Delete from memory cache if enabled (simple pattern matching)
    if (this.options.enableMemory) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      for (const key of this.memoryCache.keys()) {
        if (regex.test(key)) {
          this.memoryCache.delete(key);
          memorySuccess = true;
        }
      }
    }

    return redisSuccess || memorySuccess;
  }

  async clearAll(): Promise<boolean> {
    let redisSuccess = false;
    let memorySuccess = false;

    // Clear Redis if enabled
    if (this.options.enableRedis && this.redisCache?.isReady) {
      try {
        redisSuccess = await this.redisCache.clearAll();
      } catch (error) {
        console.warn('Redis CLEAR ALL failed:', error);
      }
    }

    // Clear memory cache if enabled
    if (this.options.enableMemory) {
      this.memoryCache.clear();
      memorySuccess = true;
    }

    return redisSuccess || memorySuccess;
  }

  async invalidateByTags(tags: string[]): Promise<boolean> {
    // Delete cache entries that contain any of the tags
    const patterns = tags.map(tag => `*${tag}*`);
    const promises = patterns.map(pattern => this.deletePattern(pattern));
    const results = await Promise.all(promises);
    return results.some(result => result);
  }

  // Health check
  async healthCheck(): Promise<{
    redis: boolean;
    memory: boolean;
    memorySize: number;
  }> {
    return {
      redis: this.redisCache?.isReady ?? false,
      memory: this.options.enableMemory,
      memorySize: this.memoryCache.size,
    };
  }
}

// Singleton instance
let cacheManager: CacheManager | null = null;

export function getCacheManager(): CacheManager {
  if (!cacheManager) {
    cacheManager = new CacheManager({
      defaultTTL: 300, // 5 minutes
      enableRedis: process.env.REDIS_URL ? true : false,
      enableMemory: true,
      memoryMaxSize: 1000,
    });
  }
  return cacheManager;
}

// Cache tags for invalidation
export const cacheTags = {
  products: 'products',
  brands: 'brands',
  user: 'user',
  search: 'search',
} as const;

// Cache TTL presets
export const cacheTTL = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  day: 86400, // 1 day
} as const;