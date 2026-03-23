// src/infrastructure/dependency-injection/DependencyConfig.ts
import { ConfigManager } from '../system/ConfigManager';
import { LoggerService } from '../logging/logger.service';
import { DatabaseClient } from '../database/database-connection';
import { EventSystem } from '../events/event-bus';
import { ErrorHandler } from '../error/error-handler';
import { ThoughtRepositoryImpl } from '../database/repositories/thought-fragment-repository-implementation';
import { CognitiveModelRepositoryImpl } from '../database/repositories/cognitive-model-repository-implementation';
import { IngestThoughtUseCase } from '../../application/use-cases/thought/create-thought.use-case';
import { GenerateProposalUseCase } from '../../application/use-cases/ai/generate-proposal.use-case';
import { UpdateCognitiveModelUseCase } from '../../application/use-cases/cognitive/update-model.use-case';
import { ModelSummaryGenerator } from '../../application/services/ModelSummaryGenerator';
import { CognitiveStructureVisualizationService } from '../../application/services/CognitiveStructureVisualizationService';
import { OutputFormattingService } from '../../application/services/OutputFormattingService';
import { ModelExportService } from '../../application/services/ModelExportService';
import { CognitiveModelUpdateService } from '../../application/services/CognitiveModelUpdateService';
import { ConceptRelationProcessor } from '../../application/services/ConceptRelationProcessor';
import { ModelConsistencyChecker } from '../../application/services/ModelConsistencyChecker';
import { CognitiveGraphGenerator } from '../../application/services/CognitiveGraphGenerator';
import { AiDependencyConfig } from './ai/DependencyConfig';
import { globalContainer } from './DependencyContainer';

/**
 * 配置依赖注入
 * @param configManager 配置管理器
 * @param loggingSystem 日志系统
 */
export const configureDependencyInjection = (
  configManager: ConfigManager,
  loggingSystem: LoggerService
): void => {
  // 注册配置管理器和日志系统（已创建）
  globalContainer.registerSingleton('ConfigManager', () => configManager);
  globalContainer.registerSingleton('LoggerService', () => loggingSystem);

  // 注册数据库客户端
  globalContainer.registerSingleton('DatabaseClient', () => {
    const databaseUrl = configManager.get<string>('DATABASE_URL', ':memory:');
    return new DatabaseClient(databaseUrl);
  });

  // 注册事件系统
  globalContainer.registerSingleton('EventSystem', () => {
    return new EventSystem();
  });

  // 注册错误处理器
  globalContainer.registerSingleton('ErrorHandler', () => {
    return new ErrorHandler(loggingSystem);
  });

  // 注册仓库
  globalContainer.registerSingleton('ThoughtRepository', () => {
    const databaseClient = globalContainer.resolve<DatabaseClient>('DatabaseClient');
    const eventSystem = globalContainer.resolve<EventSystem>('EventSystem');
    return new ThoughtRepositoryImpl(databaseClient, eventSystem);
  });

  globalContainer.registerSingleton('CognitiveModelRepository', () => {
    const databaseClient = globalContainer.resolve<DatabaseClient>('DatabaseClient');
    const eventSystem = globalContainer.resolve<EventSystem>('EventSystem');
    return new CognitiveModelRepositoryImpl(databaseClient, eventSystem);
  });

  // 注册用例
  globalContainer.registerSingleton('IngestThoughtUseCase', () => {
    const thoughtRepository = globalContainer.resolve<any>('ThoughtRepository');
    return new IngestThoughtUseCase(thoughtRepository);
  });

  globalContainer.registerSingleton('GenerateProposalUseCase', () => {
    const thoughtRepository = globalContainer.resolve<any>('ThoughtRepository');
    return new GenerateProposalUseCase(thoughtRepository);
  });

  globalContainer.registerSingleton('UpdateCognitiveModelUseCase', () => {
    const cognitiveModelRepository = globalContainer.resolve<any>('CognitiveModelRepository');
    return new UpdateCognitiveModelUseCase(cognitiveModelRepository);
  });

  // 注册服务
  globalContainer.registerSingleton('ModelSummaryGenerator', () => {
    return new ModelSummaryGenerator();
  });

  globalContainer.registerSingleton('CognitiveStructureVisualizationService', () => {
    return new CognitiveStructureVisualizationService();
  });

  globalContainer.registerSingleton('OutputFormattingService', () => {
    return new OutputFormattingService();
  });

  globalContainer.registerSingleton('ModelExportService', () => {
    return new ModelExportService();
  });

  globalContainer.registerSingleton('CognitiveModelUpdateService', () => {
    return new CognitiveModelUpdateService();
  });

  globalContainer.registerSingleton('ConceptRelationProcessor', () => {
    return new ConceptRelationProcessor();
  });

  globalContainer.registerSingleton('ModelConsistencyChecker', () => {
    return new ModelConsistencyChecker();
  });

  globalContainer.registerSingleton('CognitiveGraphGenerator', () => {
    return new CognitiveGraphGenerator();
  });

  // 配置AI相关依赖
  AiDependencyConfig.configure(globalContainer);
};
