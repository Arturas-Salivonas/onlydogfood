import Redis from 'redis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string;
}

export class RedisCache {
  private client: ReturnType<typeof Redis.createClient> | null = null;
  private isConnected = false;

  constructor(private url?: string) {}

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      this.client = Redis.createClient({
        url: this.url || process.env.REDIS_URL || 'redis://localhost:6379',
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Connected to Redis');
        this.isConnected = true;
      });

      await new Promise<void>((resolve, reject) => {
        if (!this.client) return reject(new Error('Redis client not initialized'));

        this.client.on('ready', () => resolve());
        this.client.on('error', reject);
      });
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Don't throw error, allow app to continue without Redis
      this.client = null;
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  private generateKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || 'odf';
    return `${keyPrefix}:${key}`;
  }

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    if (!this.isConnected || !this.client) return null;

    try {
      const cacheKey = this.generateKey(key, options?.keyPrefix);
      const data = await this.client.get(cacheKey);

      if (!data) return null;

      return JSON.parse(data);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;

    try {
      const cacheKey = this.generateKey(key, options.keyPrefix);
      const serializedValue = JSON.stringify(value);

      if (options.ttl) {
        await this.client.setex(cacheKey, options.ttl, serializedValue);
      } else {
        await this.client.set(cacheKey, serializedValue);
      }

      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async delete(key: string, options?: CacheOptions): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;

    try {
      const cacheKey = this.generateKey(key, options?.keyPrefix);
      await this.client.del(cacheKey);
      return true;
    } catch (error) {
      console.error('Redis DELETE error:', error);
      return false;
    }
  }

  async deletePattern(pattern: string, options?: CacheOptions): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;

    try {
      const keyPattern = this.generateKey(pattern, options?.keyPrefix);
      const keys = await this.client.keys(keyPattern);

      if (keys.length > 0) {
        await this.client.del(keys);
      }

      return true;
    } catch (error) {
      console.error('Redis DELETE PATTERN error:', error);
      return false;
    }
  }

  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;

    try {
      const cacheKey = this.generateKey(key, options?.keyPrefix);
      const result = await this.client.exists(cacheKey);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async clearAll(prefix?: string): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;

    try {
      const pattern = prefix ? `${prefix}:*` : '*';
      const keys = await this.client.keys(pattern);

      if (keys.length > 0) {
        await this.client.del(keys);
      }

      return true;
    } catch (error) {
      console.error('Redis CLEAR ALL error:', error);
      return false;
    }
  }

  async getTTL(key: string, options?: CacheOptions): Promise<number> {
    if (!this.isConnected || !this.client) return -1;

    try {
      const cacheKey = this.generateKey(key, options?.keyPrefix);
      return await this.client.ttl(cacheKey);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -1;
    }
  }

  get isReady(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let redisCache: RedisCache | null = null;

export function getRedisCache(): RedisCache {
  if (!redisCache) {
    redisCache = new RedisCache();
  }
  return redisCache;
}

// Helper to clean filters for cache key generation
function cleanFiltersForCacheKey(filters: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(filters)) {
    // Skip undefined, null, and string representations
    if (value === undefined || value === null || value === 'undefined' || value === 'null' || value === 'NaN' || value === '') {
      continue;
    }

    // Handle arrays - filter out invalid values
    if (Array.isArray(value)) {
      const cleanedArray = value.filter(item =>
        item !== undefined &&
        item !== null &&
        item !== 'undefined' &&
        item !== 'null' &&
        item !== 'NaN' &&
        item !== ''
      );
      if (cleanedArray.length > 0) {
        cleaned[key] = cleanedArray;
      }
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

// Cache key generators for common patterns
export const cacheKeys = {
  products: {
    list: (filters: Record<string, any>) => {
      const cleanedFilters = cleanFiltersForCacheKey(filters);
      return `products:list:${JSON.stringify(cleanedFilters)}`;
    },
    detail: (slug: string) => `products:detail:${slug}`,
    search: (query: string) => `products:search:${query}`,
    byIds: (ids: string) => `products:byIds:${ids}`,
  },
  brands: {
    list: (sort?: string) => `brands:list${sort ? `:${sort}` : ''}`,
    detail: (slug: string) => `brands:detail:${slug}`,
  },
  user: {
    session: (userId: string) => `user:session:${userId}`,
    preferences: (userId: string) => `user:preferences:${userId}`,
  },
};