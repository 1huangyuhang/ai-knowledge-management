/**
 * 内存缓存服务实现
 * 提供基于内存的缓存功能，支持TTL过期机制
 */
import { CacheService } from '../../domain/services/cache-service';

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  /**
   * 缓存值
   */
  value: T;
  /**
   * 过期时间（时间戳，毫秒）
   */
  expiresAt: number;
}

/**
 * 内存缓存服务
 */
export class MemoryCacheService implements CacheService {
  /**
   * 缓存存储
   */
  private cache: Map<string, CacheItem<any>> = new Map();
  /**
   * 清理间隔（毫秒），默认5分钟
   */
  private cleanupInterval: number = 5 * 60 * 1000;
  /**
   * 清理定时器
   */
  private cleanupTimer: NodeJS.Timeout | null = null;
  /**
   * 默认TTL（毫秒），默认5分钟
   */
  private defaultTTL: number = 5 * 60 * 1000;

  /**
   * 构造函数
   * @param cleanupInterval 清理间隔（毫秒）
   */
  constructor(cleanupInterval?: number) {
    if (cleanupInterval) {
      this.cleanupInterval = cleanupInterval;
    }
    this.startCleanupTimer();
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredItems();
    }, this.cleanupInterval);
  }

  /**
   * 清理过期的缓存项
   */
  private cleanupExpiredItems(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（毫秒）
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, {
      value,
      expiresAt
    });
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值，如果不存在或已过期则返回null
   */
  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    if (item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   * @returns 是否存在且未过期
   */
  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    if (item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 关闭缓存服务，清理资源
   */
  close(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
  }
}
