/**
 * 缓存失效策略实现
 * 提供多种缓存失效方式，确保缓存数据的一致性
 */
import { CacheService } from '../../domain/services/cache-service';

/**
 * 缓存失效器
 */
export class CacheInvalidator {
  /**
   * 构造函数
   * @param cacheService 缓存服务
   */
  constructor(private readonly cacheService: CacheService) {}

  /**
   * 直接失效指定缓存键
   * @param key 缓存键
   */
  async invalidate(key: string): Promise<void> {
    await this.cacheService.delete(key);
  }

  /**
   * 批量失效多个缓存键
   * @param keys 缓存键数组
   */
  async invalidateBatch(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.cacheService.delete(key)));
  }

  /**
   * 模式匹配失效
   * 注意：此实现依赖于缓存服务支持模式匹配
   * 如果缓存服务不支持，将抛出错误
   * @param pattern 缓存键模式，如 'model:*'
   * @param keys 可选的已知键列表，用于优化性能
   */
  async invalidatePattern(pattern: string, keys?: string[]): Promise<void> {
    if (keys) {
      // 如果提供了键列表，直接失效匹配的键
      const matchingKeys = keys.filter(key => this.matchesPattern(key, pattern));
      await this.invalidateBatch(matchingKeys);
    } else {
      // 如果没有提供键列表，尝试使用缓存服务的模式匹配功能
      // 注意：大多数缓存服务不直接支持此功能，需要扩展CacheService接口
      throw new Error('Pattern matching not supported without explicit keys');
    }
  }

  /**
   * 定时失效
   * @param key 缓存键
   * @param delay 延迟时间（毫秒）
   * @returns 定时器ID，可用于取消定时
   */
  scheduleInvalidation(key: string, delay: number): NodeJS.Timeout {
    return setTimeout(async () => {
      await this.invalidate(key);
    }, delay);
  }

  /**
   * 取消定时失效
   * @param timeoutId 定时器ID
   */
  cancelInvalidation(timeoutId: NodeJS.Timeout): void {
    clearTimeout(timeoutId);
  }

  /**
   * 检查键是否匹配模式
   * 支持 * 通配符
   * @param key 缓存键
   * @param pattern 模式
   * @returns 是否匹配
   */
  private matchesPattern(key: string, pattern: string): boolean {
    // 简单的通配符匹配实现
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(key);
  }
}
