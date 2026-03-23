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
   * 模块ID
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
   * 模块描述（可选）
   */
  description?: string;
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
  
  /**
   * 验证模块依赖关系
   * @param moduleId 模块ID
   */
  validateModuleDependencies(moduleId: string): Promise<boolean>;
}

/**
 * 基于内存的模块注册表实现
 */
export class InMemoryModuleRegistry implements ModuleRegistry {
  /**
   * 存储模块信息的映射
   */
  private modules: Map<string, ModuleInfo> = new Map();
  
  /**
   * 注册模块
   * @param module 模块信息
   */
  async registerModule(module: ModuleInfo): Promise<boolean> {
    // 验证模块依赖
    for (const dep of module.dependencies) {
      if (!this.modules.has(dep)) {
        throw new Error(`依赖模块 '${dep}' 未注册，无法注册模块 '${module.id}'`);
      }
      
      // 检查依赖模块状态
      const depModule = this.modules.get(dep)!;
      if (depModule.status === ModuleStatus.ERROR) {
        throw new Error(`依赖模块 '${dep}' 处于错误状态，无法注册模块 '${module.id}'`);
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
    if (!this.modules.has(moduleId)) {
      return false;
    }
    
    // 检查是否有其他模块依赖该模块
    for (const [id, module] of this.modules.entries()) {
      if (id !== moduleId && module.dependencies.includes(moduleId)) {
        throw new Error(`模块 '${moduleId}' 被模块 '${id}' 依赖，无法注销`);
      }
    }
    
    this.modules.delete(moduleId);
    return true;
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
    return module !== undefined && module.status === ModuleStatus.RUNNING;
  }
  
  /**
   * 更新模块状态
   * @param moduleId 模块ID
   * @param status 新状态
   */
  async updateModuleStatus(moduleId: string, status: ModuleStatus): Promise<boolean> {
    if (!this.modules.has(moduleId)) {
      return false;
    }
    
    const module = this.modules.get(moduleId)!;
    this.modules.set(moduleId, { ...module, status });
    return true;
  }
  
  /**
   * 验证模块依赖关系
   * @param moduleId 模块ID
   */
  async validateModuleDependencies(moduleId: string): Promise<boolean> {
    const module = this.modules.get(moduleId);
    if (!module) {
      return false;
    }
    
    for (const dep of module.dependencies) {
      if (!this.modules.has(dep)) {
        return false;
      }
      
      const depModule = this.modules.get(dep)!;
      if (depModule.status !== ModuleStatus.RUNNING) {
        return false;
      }
    }
    
    return true;
  }
}

/**
 * 模块注册表单例实例
 */
export const moduleRegistry = new InMemoryModuleRegistry();
