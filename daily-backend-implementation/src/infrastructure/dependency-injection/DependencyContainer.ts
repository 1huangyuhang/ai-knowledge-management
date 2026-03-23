// src/infrastructure/dependency-injection/DependencyContainer.ts

/**
 * 依赖注入容器接口
 */
export interface DependencyContainer {
  /**
   * 注册依赖
   * @param key 依赖键
   * @param factory 依赖工厂函数
   */
  register<T>(key: string, factory: () => T): void;

  /**
   * 注册单例依赖
   * @param key 依赖键
   * @param factory 依赖工厂函数
   */
  registerSingleton<T>(key: string, factory: () => T): void;

  /**
   * 解析依赖
   * @param key 依赖键
   * @returns 依赖实例
   */
  resolve<T>(key: string): T;

  /**
   * 检查依赖是否已注册
   * @param key 依赖键
   * @returns 是否已注册
   */
  has(key: string): boolean;

  /**
   * 清除所有依赖
   */
  clear(): void;
}

/**
 * 简单的依赖注入容器实现
 */
export class SimpleDependencyContainer implements DependencyContainer {
  private readonly dependencies: Map<string, any> = new Map();
  private readonly singletonInstances: Map<string, any> = new Map();

  /**
   * 注册依赖
   * @param key 依赖键
   * @param factory 依赖工厂函数
   */
  public register<T>(key: string, factory: () => T): void {
    this.dependencies.set(key, factory);
  }

  /**
   * 注册单例依赖
   * @param key 依赖键
   * @param factory 依赖工厂函数
   */
  public registerSingleton<T>(key: string, factory: () => T): void {
    this.dependencies.set(key, factory);
  }

  /**
   * 解析依赖
   * @param key 依赖键
   * @returns 依赖实例
   */
  public resolve<T>(key: string): T {
    if (!this.dependencies.has(key)) {
      throw new Error(`Dependency not found: ${key}`);
    }

    // 如果是单例，检查是否已经创建了实例
    if (this.singletonInstances.has(key)) {
      return this.singletonInstances.get(key) as T;
    }

    const factory = this.dependencies.get(key);
    const instance = factory();

    // 如果是单例，保存实例
    this.singletonInstances.set(key, instance);

    return instance;
  }

  /**
   * 检查依赖是否已注册
   * @param key 依赖键
   * @returns 是否已注册
   */
  public has(key: string): boolean {
    return this.dependencies.has(key);
  }

  /**
   * 清除所有依赖
   */
  public clear(): void {
    this.dependencies.clear();
    this.singletonInstances.clear();
  }
}

/**
 * 全局依赖注入容器实例
 */
export const globalContainer = new SimpleDependencyContainer();
