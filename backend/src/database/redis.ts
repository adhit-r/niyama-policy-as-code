import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    redisClient.on('error', (error) => {
      logger.error('Redis client error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });

    await redisClient.connect();
    logger.info('✅ Redis connection established successfully');
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

// Cache operations
export const cache = {
  async get(key: string): Promise<string | null> {
    try {
      const client = getRedisClient();
      return await client.get(key);
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      const client = getRedisClient();
      if (ttlSeconds) {
        await client.setEx(key, ttlSeconds, value);
      } else {
        await client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  },

  async del(key: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  },

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const client = getRedisClient();
      await client.expire(key, ttlSeconds);
      return true;
    } catch (error) {
      logger.error('Redis EXPIRE error:', error);
      return false;
    }
  },

  async keys(pattern: string): Promise<string[]> {
    try {
      const client = getRedisClient();
      return await client.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS error:', error);
      return [];
    }
  },

  async flushAll(): Promise<boolean> {
    try {
      const client = getRedisClient();
      await client.flushAll();
      return true;
    } catch (error) {
      logger.error('Redis FLUSHALL error:', error);
      return false;
    }
  },
};

// JSON cache operations
export const jsonCache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await cache.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('JSON cache GET error:', error);
      return null;
    }
  },

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      return await cache.set(key, jsonValue, ttlSeconds);
    } catch (error) {
      logger.error('JSON cache SET error:', error);
      return false;
    }
  },
};

// Session management
export const session = {
  async create(userId: string, sessionData: any, ttlSeconds: number = 3600): Promise<string> {
    const sessionId = `session:${userId}:${Date.now()}`;
    await jsonCache.set(sessionId, sessionData, ttlSeconds);
    return sessionId;
  },

  async get(sessionId: string): Promise<any> {
    return await jsonCache.get(sessionId);
  },

  async update(sessionId: string, sessionData: any, ttlSeconds?: number): Promise<boolean> {
    return await jsonCache.set(sessionId, sessionData, ttlSeconds);
  },

  async delete(sessionId: string): Promise<boolean> {
    return await cache.del(sessionId);
  },

  async extend(sessionId: string, ttlSeconds: number): Promise<boolean> {
    return await cache.expire(sessionId, ttlSeconds);
  },
};

// Rate limiting
export const rateLimit = {
  async check(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const client = getRedisClient();
      const current = await client.incr(key);
      
      if (current === 1) {
        await client.expire(key, windowSeconds);
      }
      
      const ttl = await client.ttl(key);
      const resetTime = Date.now() + (ttl * 1000);
      
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime,
      };
    } catch (error) {
      logger.error('Rate limit check error:', error);
      return { allowed: true, remaining: limit, resetTime: Date.now() + (windowSeconds * 1000) };
    }
  },

  async reset(key: string): Promise<boolean> {
    return await cache.del(key);
  },
};

// Policy evaluation cache
export const policyCache = {
  async getEvaluation(policyId: string, resourceId: string): Promise<any> {
    const key = `policy:eval:${policyId}:${resourceId}`;
    return await jsonCache.get(key);
  },

  async setEvaluation(policyId: string, resourceId: string, result: any, ttlSeconds: number = 300): Promise<boolean> {
    const key = `policy:eval:${policyId}:${resourceId}`;
    return await jsonCache.set(key, result, ttlSeconds);
  },

  async invalidatePolicy(policyId: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      const pattern = `policy:eval:${policyId}:*`;
      const keys = await client.keys(pattern);
      
      if (keys.length > 0) {
        await client.del(keys);
      }
      
      return true;
    } catch (error) {
      logger.error('Policy cache invalidation error:', error);
      return false;
    }
  },
};

// Health check for Redis
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

