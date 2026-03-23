/**
 * 模块集成服务
 * 负责将所有核心模块整合为一个完整的系统
 */
import { ModuleRegistry, ModuleInfo, ModuleStatus } from '../../infrastructure/module/ModuleRegistry';
import { HealthChecker, HealthIndicator, HealthStatusType } from '../../infrastructure/health/HealthChecker';
import { EventBus } from '../../infrastructure/events/event-bus';
import { LoggerService } from '../../infrastructure/logging/logger.service';

/**
 * 模块集成服务接口
 */
export interface ModuleIntegrationService {
  /**
   * 执行模块集成
   */
  integrateModules(): Promise<void>;
  
  /**
   * 注册模块
   * @param moduleInfo 模块信息
   */
  registerModule(moduleInfo: ModuleInfo): Promise<void>;
  
  /**
   * 注册健康指示器
   * @param indicator 健康指示器
   */
  registerHealthIndicator(indicator: HealthIndicator): Promise<void>;
  
  /**
   * 获取集成状态
   */
  getIntegrationStatus(): Promise<Record<string, any>>;
}

/**
 * 核心模块配置
 */
const CORE_MODULES: ModuleInfo[] = [
  {
    id: 'cognitive-relation',
    name: '认知关系模块',
    version: '1.0.0',
    dependencies: [],
    healthCheckUrl: '/health/cognitive-relation',
    apiEndpoints: ['/api/cognitive-relation/*'],
    status: ModuleStatus.INITIALIZING,
    description: '负责处理认知概念和关系的解析与管理'
  },
  {
    id: 'model-evolution',
    name: '模型演化模块',
    version: '1.0.0',
    dependencies: ['cognitive-relation'],
    healthCheckUrl: '/health/model-evolution',
    apiEndpoints: ['/api/model-evolution/*'],
    status: ModuleStatus.INITIALIZING,
    description: '负责认知模型的演化历史和版本管理'
  },
  {
    id: 'cognitive-feedback',
    name: '认知反馈模块',
    version: '1.0.0',
    dependencies: ['model-evolution'],
    healthCheckUrl: '/health/cognitive-feedback',
    apiEndpoints: ['/api/cognitive-feedback/*'],
    status: ModuleStatus.INITIALIZING,
    description: '负责生成认知洞察、主题分析、盲点检测和差距识别'
  },
  {
    id: 'llm-integration',
    name: 'LLM集成模块',
    version: '1.0.0',
    dependencies: [],
    healthCheckUrl: '/health/llm-integration',
    apiEndpoints: ['/api/llm/*'],
    status: ModuleStatus.INITIALIZING,
    description: '负责与大语言模型的集成和交互'
  },
  {
    id: 'embedding-service',
    name: '嵌入向量服务模块',
    version: '1.0.0',
    dependencies: [],
    healthCheckUrl: '/health/embedding-service',
    apiEndpoints: ['/api/embedding/*'],
    status: ModuleStatus.INITIALIZING,
    description: '负责处理文本嵌入向量的生成和管理'
  }
];

/**
 * 默认健康指示器
 */
export class DefaultHealthIndicator implements HealthIndicator {
  constructor(
    public moduleId: string,
    private logger: LoggerService
  ) {}
  
  async check(): Promise<{ status: HealthStatusType; details?: Record<string, any> | undefined; error?: string | undefined; }> {
    try {
      // 默认健康检查实现
      return {
        status: HealthStatusType.UP,
        details: {
          moduleId: this.moduleId,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      this.logger.error(`Health check failed for module ${this.moduleId}: ${error instanceof Error ? error.message : String(error)}`);
      return {
        status: HealthStatusType.DOWN,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

/**
 * 模块集成服务实现
 */
export class ModuleIntegrationServiceImpl implements ModuleIntegrationService {
  constructor(
    private moduleRegistry: ModuleRegistry,
    private healthChecker: HealthChecker,
    private eventBus: EventBus,
    private logger: LoggerService
  ) {}
  
  /**
   * 执行模块集成
   */
  async integrateModules(): Promise<void> {
    this.logger.info('开始执行模块集成...');
    
    // 1. 注册所有核心模块
    for (const moduleInfo of CORE_MODULES) {
      await this.registerModule(moduleInfo);
    }
    
    // 2. 为每个模块创建并注册健康指示器
    for (const module of CORE_MODULES) {
      const healthIndicator = new DefaultHealthIndicator(module.id, this.logger);
      await this.registerHealthIndicator(healthIndicator);
    }
    
    // 3. 更新模块状态为运行中
    for (const module of CORE_MODULES) {
      await this.moduleRegistry.updateModuleStatus(module.id, ModuleStatus.RUNNING);
    }
    
    this.logger.info('模块集成完成，所有核心模块已注册并初始化');
    
    // 4. 发布模块集成完成事件
    await this.eventBus.publish({
      type: 'MODULE_INTEGRATION_COMPLETED',
      timestamp: Date.now(),
      source: 'ModuleIntegrationService',
      data: {
        modules: await this.moduleRegistry.getAllModules(),
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * 注册模块
   * @param moduleInfo 模块信息
   */
  async registerModule(moduleInfo: ModuleInfo): Promise<void> {
    this.logger.info(`注册模块: ${moduleInfo.name} (${moduleInfo.id})`);
    await this.moduleRegistry.registerModule(moduleInfo);
    this.logger.info(`模块 ${moduleInfo.id} 注册成功`);
  }
  
  /**
   * 注册健康指示器
   * @param indicator 健康指示器
   */
  async registerHealthIndicator(indicator: HealthIndicator): Promise<void> {
    this.logger.info(`注册健康指示器: ${indicator.moduleId}`);
    await this.healthChecker.registerHealthIndicator(indicator);
    this.logger.info(`健康指示器 ${indicator.moduleId} 注册成功`);
  }
  
  /**
   * 获取集成状态
   */
  async getIntegrationStatus(): Promise<Record<string, any>> {
    const modules = await this.moduleRegistry.getAllModules();
    const healthStatus = await this.healthChecker.checkHealth();
    
    return {
      modules,
      healthStatus,
      timestamp: Date.now()
    };
  }
}
