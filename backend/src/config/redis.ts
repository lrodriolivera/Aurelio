// =========================================
// Redis Client Configuration
// Singleton Pattern
// =========================================

import { createClient, RedisClientType } from 'redis';
import config from './index';
import logger from '../utils/logger';

class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType;
  private isConnected: boolean = false;

  private constructor() {
    // Only create client if Redis URL is provided
    if (!config.redis.url || config.redis.url === 'redis://localhost:6379') {
      logger.warn('Redis URL not configured. Redis features will be disabled.');
      // Create a dummy client that won't be used
      this.client = {} as RedisClientType;
      return;
    }

    this.client = createClient({
      url: config.redis.url,
      password: config.redis.password,
      database: config.redis.db,
    });

    this.client.on('connect', () => {
      logger.info('Redis client connecting...');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      logger.info('Redis client connected and ready');
    });

    this.client.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.warn('Redis client connection closed');
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async connect(): Promise<void> {
    if (!config.redis.url || config.redis.url === 'redis://localhost:6379') {
      logger.warn('Skipping Redis connection - not configured');
      return;
    }

    if (!this.isConnected) {
      try {
        await this.client.connect();
        logger.info('Redis connection established');
      } catch (error) {
        logger.warn('Failed to connect to Redis (non-fatal):', error);
        // Don't throw - allow server to continue without Redis
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis connection closed');
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  // Helper methods
  public async get(key: string): Promise<string | null> {
    if (!this.isConnected) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      // Don't throw - allow server to continue
    }
  }

  public async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
    }
  }

  public async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  public async setJson(key: string, value: any, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  public async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Redis JSON parse error for key ${key}:`, error);
      return null;
    }
  }

  public async invalidatePattern(pattern: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.debug(`Invalidated ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error(`Redis invalidate pattern error for ${pattern}:`, error);
    }
  }
}

// Export singleton instance
export default RedisClient.getInstance();
