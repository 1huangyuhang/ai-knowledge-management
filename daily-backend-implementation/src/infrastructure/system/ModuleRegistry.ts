/**
 * 模块状态枚举
 */
export enum ModuleStatus {
  INITIALIZING = 'INITIALIZING',
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  ERROR = 'ERROR'
}

/**
 * 模块信息接口
 */
export interface ModuleInfo {
  /**
   * 模块唯一标识
   */
  id: string;
  
  /**
   * 模块名称
   */
  name: string;
  
  /**
   * 模块版本
   */
  version: string;
  
  /**
   * 模块依赖
   */
  dependencies: string[];
  
  /**
   * 健康检查URL
   */
  healthCheckUrl: string;
  
  /**
   * API端点列表
   */
  apiEndpoints: string[];
  
  /**
   * 模块状态
   */
  status: ModuleStatus;
  
  /**
   * 模块配置
   */
  config?: Record<string, any>;
}

/**
 * 模块注册表接口
 */
export interface ModuleRegistry {
  /**
   * 注册模块
   * @param module 模块信息
   */
  registerModule(module: ModuleInfo): Promise<boolean>;
  
  /**
   * 注销模块
   * @param moduleId 模块ID
   */
  unregisterModule(moduleId: string): Promise<boolean>;
  
  /**
   * 获取模块信息
   * @param moduleId 模块ID
   */
  getModule(moduleId: string): Promise<ModuleInfo | null>;
  
  /**
   * 获取所有模块信息
   */
  getAllModules(): Promise<ModuleInfo[]>;
  
  /**
   * 检查模块是否可用
   * @param moduleId 模块ID
   */
  isModuleAvailable(moduleId: string): Promise<boolean>;
  
  /**
   * 更新模块状态
   * @param moduleId 模块ID
   * @param status 新状态
   */
  updateModuleStatus(moduleId: string, status: ModuleStatus): Promise<boolean>;
}

/**
 * 内存实现的模块注册表
 */
export class InMemoryModuleRegistry implements ModuleRegistry {
  private modules: Map<string, ModuleInfo> = new Map();
  
  /**
   * 注册模块
   * @param module 模块信息
   */
  async registerModule(module: ModuleInfo): Promise<boolean> {
    // 验证模块依赖
    for (const dep of module.dependencies) {
      if (!this.modules.has(dep)) {
        throw new Error(`Dependency ${dep} not found for module ${module.id}`);
      }
    }
    
    this.modules.set(module.id, { ...module, status: ModuleStatus.INITIALIZING });
    return true;
  }
  
  /**
   * 注销模块
   * @param moduleId 模块ID
   */
  async unregisterModule(moduleId: string): Promise<boolean> {
    // 检查是否有其他模块依赖该模块
    for (const [id, module] of this.modules.entries()) {
      if (id !== moduleId && module.dependencies.includes(moduleId)) {
        throw new Error(`Module ${moduleId} is still referenced by module ${id}`);
      }
    }
    
    return this.modules.delete(moduleId);
  }
  
  /**
   * 获取模块信息
   * @param moduleId 模块ID
   */
  async getModule(moduleId: string): Promise<ModuleInfo | null> {
    return this.modules.get(moduleId) || null;
  }
  
  /**
   * 获取所有模块信息
   */
  async getAllModules(): Promise<ModuleInfo[]> {
    return Array.from(this.modules.values());
  }
  
  /**
   * 检查模块是否可用
   * @param moduleId 模块ID
   */
  async isModuleAvailable(moduleId: string): Promise<boolean> {
    const module = this.modules.get(moduleId);
    return !!module && module.status === ModuleStatus.RUNNING;
  }
  
  /**
   * 更新模块状态
   * @param moduleId 模块ID
   * @param status 新状态
   */
  async updateModuleStatus(moduleId: string, status: ModuleStatus): Promise<boolean> {
    const module = this.modules.get(moduleId);
    if (!module) {
      return false;
    }
    
    this.modules.set(moduleId, { ...module, status });
    return true;
  }
}

/**
 * 模块注册表单例实例
 */
export const moduleRegistry = new InMemoryModuleRegistry();
