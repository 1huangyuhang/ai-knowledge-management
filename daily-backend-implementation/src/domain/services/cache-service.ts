/**
 * 缓存服务接口
 * 定义缓存操作的核心功能
 */
export interface CacheService {
  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（毫秒），默认5分钟
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值，如果不存在则返回null
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): Promise<void>;

  /**
   * 清除所有缓存
   */
  clear(): Promise<void>;

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   * @returns 是否存在
   */
  has(key: string): Promise<boolean>;
}
