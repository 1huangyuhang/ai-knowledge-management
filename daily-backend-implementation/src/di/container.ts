/**
 * 依赖注入容器
 * 用于管理系统中所有模块的依赖关系
 * 遵循依赖倒置原则，高层模块不依赖低层模块
 */
import { FastifyInstance } from 'fastify';
import { initializeRepositories } from './repositories.config';

export class DIContainer {
  /**
   * 存储依赖项的工厂函数
   */
  private registry: Map<string, () => any> = new Map();

  /**
   * 存储单例实例
   */
  private instances: Map<string, any> = new Map();

  /**
   * 注册依赖项
   * @param key 依赖项的唯一标识符
   * @param factory 用于创建依赖项的工厂函数
   * @param isSingleton 是否为单例模式，默认为false
   */
  public register<T>(key: string, factory: () => T, isSingleton: boolean = false): void {
    if (isSingleton) {
      // 单例模式：只创建一次实例
      this.registry.set(key, () => {
        if (!this.instances.has(key)) {
          this.instances.set(key, factory());
        }
        return this.instances.get(key);
      });
    } else {
      // 非单例模式：每次调用创建新实例
      this.registry.set(key, factory);
    }
  }

  /**
   * 解析依赖项
   * @param key 依赖项的唯一标识符
   * @returns 依赖项实例
   * @throws Error 如果依赖项未注册
   */
  public resolve<T>(key: string): T {
    const factory = this.registry.get(key);
    if (!factory) {
      throw new Error(`依赖项 "${key}" 未注册`);
      }
    return factory() as T;
  }

  /**
   * 检查依赖项是否已注册
   * @param key 依赖项的唯一标识符
   * @returns 如果已注册返回true，否则返回false
   */
  public has(key: string): boolean {
    return this.registry.has(key);
  }

  /**
   * 移除依赖项
   * @param key 依赖项的唯一标识符
   */
  public remove(key: string): void {
    this.registry.delete(key);
    this.instances.delete(key);
  }

  /**
   * 清空所有依赖项
   */
  public clear(): void {
    this.registry.clear();
    this.instances.clear();
  }

  /**
   * 获取已注册的所有依赖项键名
   * @returns 依赖项键名数组
   */
  public getRegisteredKeys(): string[] {
    return Array.from(this.registry.keys());
  }
}

/**
 * 创建全局依赖注入容器实例
 */
export const container = new DIContainer();

/**
 * 配置依赖注入容器
 * @param app Fastify实例
 */
export async function configureDI(app: FastifyInstance): Promise<void> {
  // 注册Fastify实例到容器
  container.register('FastifyInstance', () => app, true);
  
  // 注册日志服务
  const { PinoLoggerService } = await import('../infrastructure/logging/pino-logger.service');
  container.register('LoggerService', () => new PinoLoggerService(), true);
  
  // 注册错误处理服务
  const { DefaultErrorHandler } = await import('../infrastructure/error/error-handler');
  container.register('ErrorHandler', () => {
    const logger = container.resolve('LoggerService');
    return new DefaultErrorHandler(logger as any, process.env['NODE_ENV'] === 'development');
  }, true);
  
  // 注册缓存服务
  const { MemoryCacheService } = await import('../infrastructure/cache/memory-cache-service');
  container.register('CacheService', () => new MemoryCacheService(), true);
  
  // 注册事件总线
  const { eventBus } = await import('../infrastructure/events/event-bus');
  container.register('EventBus', () => eventBus, true);
  
  // 注册模块注册表
  const { moduleRegistry } = await import('../infrastructure/module/ModuleRegistry');
  container.register('ModuleRegistry', () => moduleRegistry, true);
  
  // 注册健康检查器
  const { healthChecker } = await import('../infrastructure/health/HealthChecker');
  container.register('HealthChecker', () => healthChecker, true);
  
  // 初始化仓库依赖
  await initializeRepositories();
  
  // 注册认证相关用例
  const { RegisterUseCase } = await import('../application/use-cases/auth/register.use-case');
  const { LoginUseCase } = await import('../application/use-cases/auth/login.use-case');
  const { RefreshTokenUseCase } = await import('../application/use-cases/auth/refresh-token.use-case');
  
  container.register('RegisterUseCase', () => {
    const userRepository = container.resolve('UserRepository');
    return new RegisterUseCase(userRepository);
  }, true);
  
  container.register('LoginUseCase', () => {
    const userRepository = container.resolve('UserRepository');
    return new LoginUseCase(userRepository);
  }, true);
  
  container.register('RefreshTokenUseCase', () => {
    const userRepository = container.resolve('UserRepository');
    return new RefreshTokenUseCase(userRepository);
  }, true);
  
  // 初始化演化历史相关依赖
  const { initializeEvolutionHistoryDependencies } = await import('./evolution-history.config');
  await initializeEvolutionHistoryDependencies();
  
  // 初始化洞察生成相关依赖
  const { initializeInsightGenerationDependencies } = await import('./insight-generation.config');
  await initializeInsightGenerationDependencies();
  
  // 初始化主题分析相关依赖
  const { initializeThemeAnalysisDependencies } = await import('./theme-analysis.config');
  await initializeThemeAnalysisDependencies();
  
  // 初始化盲点检测相关依赖
  const { initializeBlindspotDetectionDependencies } = await import('./blindspot-detection.config');
  await initializeBlindspotDetectionDependencies();
  
  // 初始化差距识别相关依赖
  const { initializeGapIdentificationDependencies } = await import('./gap-identification.config');
  await initializeGapIdentificationDependencies();
  
  // 初始化AI调度相关依赖（暂时禁用，因为资源管理模块依赖于不存在的核心Entity和UUID模块）
  // const { initializeAISchedulingDependencies } = await import('./ai-scheduling.config');
  // await initializeAISchedulingDependencies();
  
  // 初始化反馈格式化相关依赖
  const { initializeFeedbackFormattingDependencies } = await import('./feedback-formatting.config');
  await initializeFeedbackFormattingDependencies();
  
  // 注册模块集成服务
  const { ModuleIntegrationServiceImpl } = await import('../application/integration/ModuleIntegrationService');
  container.register('ModuleIntegrationService', () => {
    const moduleRegistry = container.resolve('ModuleRegistry');
    const healthChecker = container.resolve('HealthChecker');
    const eventBus = container.resolve('EventBus');
    const logger = container.resolve('LoggerService');
    
    return new ModuleIntegrationServiceImpl(moduleRegistry, healthChecker, eventBus, logger);
  }, true);
  
  console.log('Dependency injection container configured successfully');
  
  // 注册文档解析器服务
  const { DocumentParserServiceImpl } = await import('../application/services/DocumentParserService');
  container.register('DocumentParserService', () => new DocumentParserServiceImpl(), true);
  
  // 注册OCR服务
  const { OCRServiceImpl } = await import('../application/services/OCRService');
  container.register('OCRService', () => new OCRServiceImpl(), true);
  
  // 注册文件处理器服务
  const { FileProcessorServiceImpl } = await import('../application/services/FileProcessorService');
  container.register('FileProcessorService', () => {
    const documentParserService = container.resolve('DocumentParserService');
    const ocrService = container.resolve('OCRService');
    return new FileProcessorServiceImpl(documentParserService, ocrService);
  }, true);
  
  // 暂时禁用Whisper API客户端和音频处理器服务，因为缺少openai依赖
  // 这些服务将在后续实现中添加
  // const { OpenAIWhisperAPIClient } = await import('../infrastructure/ai/WhisperAPIClient');
  // container.register('WhisperAPIClient', () => {
  //   const logger = container.resolve('LoggerService');
  //   return new OpenAIWhisperAPIClient(logger as any);
  // }, true);
  
  // const { AudioProcessorServiceImpl } = await import('../application/services/AudioProcessorService');
  // container.register('AudioProcessorService', () => new AudioProcessorServiceImpl(), true);
  
  // 暂时禁用语音识别服务，因为依赖于WhisperAPIClient
  // const { SpeechRecognitionServiceImpl } = await import('../application/services/SpeechRecognitionService');
  // container.register('SpeechRecognitionService', () => {
  //   const whisperAPIClient = container.resolve('WhisperAPIClient');
  //   return new SpeechRecognitionServiceImpl(whisperAPIClient);
  // }, true);
  
  // 注册输入适配器
  const { InputAdapter } = await import('../application/adapters/InputAdapter');
  container.register('InputAdapter', () => new InputAdapter(), true);
  
  // 注册输入合并器
  const { InputMerger } = await import('../application/services/InputMerger');
  container.register('InputMerger', () => new InputMerger(), true);
  
  // 注册输入优先级分配器
  const { InputPrioritizer } = await import('../application/services/InputPrioritizer');
  container.register('InputPrioritizer', () => new InputPrioritizer(), true);
  
  // 注册输入路由器
  const { InputRouter } = await import('../application/services/InputRouter');
  container.register('InputRouter', () => new InputRouter(), true);

  // 注册输入分析服务
  const { InputAnalysisService } = await import('../application/services/InputAnalysisService');
  container.register('InputAnalysisService', () => {
    const analysisRepository = container.resolve('InputAnalysisRepository');
    const inputRepository = container.resolve('InputRepository');
    const llmClient = container.resolve('LLMClient');
    const logger = container.resolve('LoggerService');
    
    return new InputAnalysisService(analysisRepository as any, inputRepository as any, llmClient as any, logger as any);
  }, true);

  // 注册建议生成服务
  const { SuggestionGenerationService } = await import('../application/services/SuggestionGenerationService');
  const { SuggestionRepositoryImpl } = await import('../infrastructure/database/repositories/SuggestionRepositoryImpl');
  container.register('SuggestionRepository', () => {
    const dbManager = container.resolve('DatabaseManager');
    return new SuggestionRepositoryImpl(dbManager as any);
  }, true);

  container.register('SuggestionGenerationService', () => {
    const suggestionRepository = container.resolve('SuggestionRepository');
    const cognitiveModelRepository = container.resolve('CognitiveModelRepository');
    const logger = container.resolve('LoggerService');
    
    return new SuggestionGenerationService(suggestionRepository as any, cognitiveModelRepository as any, logger as any);
  }, true);

  // 注册性能优化服务
  const { PerformanceOptimizationServiceImpl } = await import('../application/services/PerformanceOptimizationServiceImpl');
  container.register('PerformanceOptimizationService', () => {
    const performanceRepository = container.resolve('PerformanceOptimizationRepository');
    const logger = container.resolve('LoggerService');
    
    return new PerformanceOptimizationServiceImpl(performanceRepository as any, logger as any);
  }, true);

  // 注册安全优化服务
  const { SecurityOptimizationServiceImpl } = await import('../application/services/SecurityOptimizationServiceImpl');
  container.register('SecurityOptimizationService', () => {
    const securityRepository = container.resolve('SecurityOptimizationRepository');
    
    return new SecurityOptimizationServiceImpl(securityRepository as any);
  }, true);

  // 注册可扩展性优化服务
  const { ScalabilityOptimizationServiceImpl } = await import('../application/services/ScalabilityOptimizationServiceImpl');
  container.register('ScalabilityOptimizationService', () => {
    const scalabilityRepository = container.resolve('ScalabilityOptimizationRepository');
    
    return new ScalabilityOptimizationServiceImpl(scalabilityRepository as any);
  }, true);

  // 注册可用性优化服务
  const { AvailabilityOptimizationServiceImpl } = await import('../application/services/AvailabilityOptimizationServiceImpl');
  container.register('AvailabilityOptimizationService', () => {
    const availabilityRepository = container.resolve('AvailabilityOptimizationRepository');
    
    return new AvailabilityOptimizationServiceImpl(availabilityRepository as any);
  }, true);

  // 注册可维护性优化服务
  const { MaintainabilityOptimizationServiceImpl } = await import('../application/services/MaintainabilityOptimizationServiceImpl');
  container.register('MaintainabilityOptimizationService', () => {
    const maintainabilityRepository = container.resolve('MaintainabilityOptimizationRepository');
    
    return new MaintainabilityOptimizationServiceImpl(maintainabilityRepository as any);
  }, true);

  // 注册部署服务
  const { DeploymentServiceImpl } = await import('../application/services/DeploymentServiceImpl');
  container.register('DeploymentService', () => {
    const deploymentRepository = container.resolve('DeploymentRepository');
    
    return new DeploymentServiceImpl(deploymentRepository as any);
  }, true);

  // 注册监控服务
  const { MonitoringServiceImpl } = await import('../application/services/MonitoringServiceImpl');
  container.register('MonitoringService', () => {
    const monitoringRepository = container.resolve('MonitoringRepository');
    
    return new MonitoringServiceImpl(monitoringRepository as any);
  }, true);

  // 注册日志管理服务
  const { LogManagementServiceImpl } = await import('../application/services/LogManagementServiceImpl');
  container.register('LogManagementService', () => {
    const logManagementRepository = container.resolve('LogManagementRepository');
    
    return new LogManagementServiceImpl(logManagementRepository as any);
  }, true);

  // 注册备份恢复服务
  const { BackupRecoveryServiceImpl } = await import('../application/services/BackupRecoveryServiceImpl');
  container.register('BackupRecoveryService', () => {
    const backupRecoveryRepository = container.resolve('BackupRecoveryRepository');
    
    return new BackupRecoveryServiceImpl(backupRecoveryRepository as any);
  }, true);

  // 注册灾难恢复服务
  const { DisasterRecoveryServiceImpl } = await import('../application/services/DisasterRecoveryServiceImpl');
  container.register('DisasterRecoveryService', () => {
    const disasterRecoveryRepository = container.resolve('DisasterRecoveryRepository');
    
    return new DisasterRecoveryServiceImpl(disasterRecoveryRepository as any);
  }, true);

  // 注册性能测试相关服务
  const { PerformanceTestServiceImpl, TestScenarioServiceImpl, TestAnalyzerServiceImpl, ReportGeneratorServiceImpl } = await import('../application/services/PerformanceTestServiceImpl');
  container.register('TestAnalyzerService', () => new TestAnalyzerServiceImpl(), true);
  container.register('ReportGeneratorService', () => new ReportGeneratorServiceImpl(), true);
  
  container.register('TestScenarioService', () => {
    const testScenarioRepository = container.resolve('TestScenarioRepository');
    return new TestScenarioServiceImpl(testScenarioRepository);
  }, true);
  
  container.register('PerformanceTestService', () => {
    const performanceTestRepository = container.resolve('PerformanceTestRepository');
    const testScenarioRepository = container.resolve('TestScenarioRepository');
    const testResultRepository = container.resolve('TestResultRepository');
    const performanceReportRepository = container.resolve('PerformanceReportRepository');
    const testAnalyzerService = container.resolve('TestAnalyzerService');
    const reportGeneratorService = container.resolve('ReportGeneratorService');
    
    return new PerformanceTestServiceImpl(
      performanceTestRepository,
      testScenarioRepository,
      testResultRepository,
      performanceReportRepository,
      testAnalyzerService,
      reportGeneratorService
    );
  }, true);

  // 执行模块集成
  const moduleIntegrationService = container.resolve('ModuleIntegrationService');
  await moduleIntegrationService.integrateModules();
}
