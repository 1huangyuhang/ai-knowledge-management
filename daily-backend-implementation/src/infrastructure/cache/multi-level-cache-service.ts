/**
 * 多级缓存服务实现
 * 结合本地缓存和分布式缓存，提供高效的缓存服务
 */
import { CacheService } from '../../domain/services/cache-service';
import { MemoryCacheService } from './memory-cache-service';

/**
 * 多级缓存服务配置
 */
export interface MultiLevelCacheConfig {
  /**
   * 本地缓存TTL（毫秒）
   */
  localTtl?: number;
  /**
   * 分布式缓存TTL（毫秒）
   */
  distributedTtl?: number;
  /**
   * 本地缓存清理间隔（毫秒）
   */
  cleanupInterval?: number;
}

/**
 * 多级缓存服务
 */
export class MultiLevelCacheService implements CacheService {
  private readonly localCache: MemoryCacheService;
  private readonly distributedCache?: CacheService;
  private readonly config: MultiLevelCacheConfig;

  /**
   * 构造函数
   * @param distributedCache 分布式缓存服务（可选）
   * @param config 缓存配置
   */
  constructor(distributedCache?: CacheService, config: MultiLevelCacheConfig = {}) {
    this.distributedCache = distributedCache;
    this.config = {
      localTtl: 5 * 60 * 1000, // 默认5分钟
      distributedTtl: 3600 * 1000, // 默认1小时
      cleanupInterval: 5 * 60 * 1000, // 默认5分钟
      ...config
    };
    
    this.localCache = new MemoryCacheService(this.config.cleanupInterval);
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（毫秒）
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // 1. 更新本地缓存
    await this.localCache.set(key, value, ttl || this.config.localTtl);
    
    // 2. 更新分布式缓存
    if (this.distributedCache) {
      await this.distributedCache.set(key, value, ttl || this.config.distributedTtl);
    }
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值，如果不存在或已过期则返回null
   */
  async get<T>(key: string): Promise<T | null> {
    // 1. 先查询本地缓存
    let value = await this.localCache.get<T>(key);
    if (value !== null) {
      return value;
    }
    
    // 2. 本地缓存未命中，查询分布式缓存
    if (this.distributedCache) {
      value = await this.distributedCache.get<T>(key);
      if (value !== null) {
        // 将分布式缓存的值同步到本地缓存
        await this.localCache.set(key, value, this.config.localTtl);
        return value;
      }
    }
    
    return null;
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  async delete(key: string): Promise<void> {
    // 1. 删除本地缓存
    await this.localCache.delete(key);
    
    // 2. 删除分布式缓存
    if (this.distributedCache) {
      await this.distributedCache.delete(key);
    }
  }

  /**
   * 清除所有缓存
   */
  async clear(): Promise<void> {
    // 1. 清除本地缓存
    await this.localCache.clear();
    
    // 2. 清除分布式缓存
    if (this.distributedCache) {
      await this.distributedCache.clear();
    }
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   * @returns 是否存在且未过期
   */
  async has(key: string): Promise<boolean> {
    // 1. 先检查本地缓存
    let exists = await this.localCache.has(key);
    if (exists) {
      return true;
    }
    
    // 2. 本地缓存不存在，检查分布式缓存
    if (this.distributedCache) {
      exists = await this.distributedCache.has(key);
      if (exists) {
        // 预加载到本地缓存
        const value = await this.distributedCache.get(key);
        if (value !== null) {
          await this.localCache.set(key, value, this.config.localTtl);
        }
        return true;
      }
    }
    
    return false;
  }

  /**
   * 关闭缓存服务，清理资源
   */
  close(): void {
    this.localCache.close();
    // 分布式缓存由外部管理，这里不关闭
  }
}
