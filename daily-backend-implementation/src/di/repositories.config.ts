/**
 * 仓库依赖配置
 * 用于将所有仓库实现注册到依赖注入容器中
 */
import { container } from './container';
import { DataSource } from 'typeorm';
import { databaseConnection } from '../infrastructure/database/database-connection';
import { UserRepository } from '../domain/repositories/user-repository';
import { CognitiveModelRepository } from '../domain/repositories/cognitive-model-repository';
import { ThoughtFragmentRepository } from '../domain/repositories/thought-fragment-repository';
import { CognitiveInsightRepository } from '../domain/repositories/cognitive-insight-repository';
import { InputAnalysisRepository } from '../domain/repositories/InputAnalysisRepository';
import { PerformanceTestRepository, TestScenarioRepository, TestResultRepository, PerformanceReportRepository } from '../domain/repositories/PerformanceTestRepository';
import { PerformanceOptimizationRepository } from '../domain/repositories/PerformanceOptimizationRepository';
import { SecurityOptimizationRepository } from '../domain/repositories/SecurityOptimizationRepository';
import { ScalabilityOptimizationRepository } from '../domain/repositories/ScalabilityOptimizationRepository';
import { AvailabilityOptimizationRepository } from '../domain/repositories/AvailabilityOptimizationRepository';
import { MaintainabilityOptimizationRepository } from '../domain/repositories/MaintainabilityOptimizationRepository';
import { MaintainabilityOptimizationRepositoryImpl } from '../infrastructure/repositories/MaintainabilityOptimizationRepositoryImpl';
import { DeploymentRepository } from '../domain/repositories/DeploymentRepository';
import { DeploymentRepositoryImpl } from '../infrastructure/repositories/DeploymentRepositoryImpl';
import { MonitoringRepository } from '../domain/repositories/MonitoringRepository';
import { MonitoringRepositoryImpl } from '../infrastructure/repositories/MonitoringRepositoryImpl';
import { LogManagementRepository } from '../domain/repositories/LogManagementRepository';
import { LogManagementRepositoryImpl } from '../infrastructure/repositories/LogManagementRepositoryImpl';
import { BackupRecoveryRepository } from '../domain/repositories/BackupRecoveryRepository';
import { BackupRecoveryRepositoryImpl } from '../infrastructure/repositories/BackupRecoveryRepositoryImpl';
import { DisasterRecoveryRepository } from '../domain/repositories/DisasterRecoveryRepository';
import { DisasterRecoveryRepositoryImpl } from '../infrastructure/repositories/DisasterRecoveryRepositoryImpl';
import { UserRepositoryImpl } from '../infrastructure/database/repositories/user-repository-implementation';
import { CognitiveModelRepositoryImpl } from '../infrastructure/database/repositories/cognitive-model-repository-implementation';
import { ThoughtFragmentRepositoryImpl } from '../infrastructure/database/repositories/thought-fragment-repository-implementation';
import { CognitiveInsightRepositoryImpl } from '../infrastructure/database/repositories/cognitive-insight-repository-implementation';
import { InputAnalysisRepositoryImpl } from '../infrastructure/database/repositories/input-analysis-repository-implementation';
import { PerformanceTestRepositoryImpl, TestScenarioRepositoryImpl, TestResultRepositoryImpl, PerformanceReportRepositoryImpl } from '../infrastructure/database/repositories/PerformanceTestRepositoryImpl';
import { PerformanceOptimizationRepositoryImpl } from '../infrastructure/repositories/PerformanceOptimizationRepositoryImpl';
import { SecurityOptimizationRepositoryImpl } from '../infrastructure/repositories/SecurityOptimizationRepositoryImpl';
import { ScalabilityOptimizationRepositoryImpl } from '../infrastructure/repositories/ScalabilityOptimizationRepositoryImpl';
import { AvailabilityOptimizationRepositoryImpl } from '../infrastructure/repositories/AvailabilityOptimizationRepositoryImpl';
import { UserEntity } from '../infrastructure/database/entities/user.entity';
import { CognitiveModelEntity } from '../infrastructure/database/entities/cognitive-model.entity';
import { ThoughtFragmentEntity } from '../infrastructure/database/entities/thought-fragment.entity';
import { CognitiveInsightEntity } from '../infrastructure/database/entities/cognitive-insight.entity';
import { InputAnalysisEntity } from '../infrastructure/database/entities/input-analysis.entity';
import { PerformanceTestEntity, TestScenarioEntity } from '../infrastructure/database/entities/performance-test.entity';
import { TestResultEntity, TestMetricEntity } from '../infrastructure/database/entities/test-result.entity';
import { PerformanceReportEntity } from '../infrastructure/database/entities/performance-report.entity';

/**
 * 初始化仓库依赖
 * @param dataSource TypeORM数据源实例
 */
export async function initializeRepositories(): Promise<void> {
  const dataSource = await databaseConnection.initialize();

  // 获取TypeORM仓库实例
  const userEntityRepository = dataSource.getRepository(UserEntity);
  const cognitiveModelEntityRepository = dataSource.getRepository(CognitiveModelEntity);
  const thoughtFragmentEntityRepository = dataSource.getRepository(ThoughtFragmentEntity);
  const cognitiveInsightEntityRepository = dataSource.getRepository(CognitiveInsightEntity);
  const inputAnalysisEntityRepository = dataSource.getRepository(InputAnalysisEntity);
  const performanceTestEntityRepository = dataSource.getRepository(PerformanceTestEntity);
  const testScenarioEntityRepository = dataSource.getRepository(TestScenarioEntity);
  const testResultEntityRepository = dataSource.getRepository(TestResultEntity);
  const performanceReportEntityRepository = dataSource.getRepository(PerformanceReportEntity);

  // 注册仓库实现到依赖注入容器
  container.register<UserRepository>(
    'UserRepository',
    () => new UserRepositoryImpl(userEntityRepository),
    true // 单例模式
  );

  container.register<CognitiveModelRepository>(
    'CognitiveModelRepository',
    () => new CognitiveModelRepositoryImpl(cognitiveModelEntityRepository),
    true // 单例模式
  );

  container.register<ThoughtFragmentRepository>(
    'ThoughtFragmentRepository',
    () => new ThoughtFragmentRepositoryImpl(thoughtFragmentEntityRepository),
    true // 单例模式
  );

  container.register<CognitiveInsightRepository>(
    'CognitiveInsightRepository',
    () => new CognitiveInsightRepositoryImpl(cognitiveInsightEntityRepository),
    true // 单例模式
  );

  // 注册输入分析仓库
  container.register<InputAnalysisRepository>(
    'InputAnalysisRepository',
    () => new InputAnalysisRepositoryImpl(inputAnalysisEntityRepository),
    true // 单例模式
  );

  // 注册性能测试相关仓库
  container.register<PerformanceTestRepository>(
    'PerformanceTestRepository',
    () => new PerformanceTestRepositoryImpl(dataSource),
    true // 单例模式
  );

  container.register<TestScenarioRepository>(
    'TestScenarioRepository',
    () => new TestScenarioRepositoryImpl(dataSource),
    true // 单例模式
  );

  container.register<TestResultRepository>(
    'TestResultRepository',
    () => new TestResultRepositoryImpl(dataSource),
    true // 单例模式
  );

  container.register<PerformanceReportRepository>(
    'PerformanceReportRepository',
    () => new PerformanceReportRepositoryImpl(dataSource),
    true // 单例模式
  );

  // 注册性能优化仓库
  container.register<PerformanceOptimizationRepository>(
    'PerformanceOptimizationRepository',
    () => {
      const logger = container.resolve('LoggerService');
      return new PerformanceOptimizationRepositoryImpl(logger as any);
    },
    true // 单例模式
  );

  // 注册安全优化仓库
  container.register<SecurityOptimizationRepository>(
    'SecurityOptimizationRepository',
    () => new SecurityOptimizationRepositoryImpl(),
    true // 单例模式
  );

  // 注册可扩展性优化仓库
  container.register<ScalabilityOptimizationRepository>(
    'ScalabilityOptimizationRepository',
    () => new ScalabilityOptimizationRepositoryImpl(),
    true // 单例模式
  );

  // 注册可用性优化仓库
  container.register<AvailabilityOptimizationRepository>(
    'AvailabilityOptimizationRepository',
    () => new AvailabilityOptimizationRepositoryImpl(),
    true // 单例模式
  );

  // 注册可维护性优化仓库
  container.register<MaintainabilityOptimizationRepository>(
    'MaintainabilityOptimizationRepository',
    () => new MaintainabilityOptimizationRepositoryImpl(),
    true // 单例模式
  );

  // 注册部署仓库
  container.register<DeploymentRepository>(
    'DeploymentRepository',
    () => new DeploymentRepositoryImpl(),
    true // 单例模式
  );

  // 注册监控仓库
  container.register<MonitoringRepository>(
    'MonitoringRepository',
    () => new MonitoringRepositoryImpl(),
    true // 单例模式
  );

  // 注册日志管理仓库
  container.register<LogManagementRepository>(
    'LogManagementRepository',
    () => new LogManagementRepositoryImpl(),
    true // 单例模式
  );

  // 注册备份恢复仓库
  container.register<BackupRecoveryRepository>(
    'BackupRecoveryRepository',
    () => new BackupRecoveryRepositoryImpl(),
    true // 单例模式
  );

  // 注册灾难恢复仓库
  container.register<DisasterRecoveryRepository>(
    'DisasterRecoveryRepository',
    () => new DisasterRecoveryRepositoryImpl(),
    true // 单例模式
  );

  console.log('Repositories initialized and registered in DI container');
}

/**
 * 获取仓库依赖键名
 */
export const RepositoryKeys = {
  UserRepository: 'UserRepository',
  CognitiveModelRepository: 'CognitiveModelRepository',
  ThoughtFragmentRepository: 'ThoughtFragmentRepository',
  CognitiveInsightRepository: 'CognitiveInsightRepository',
  InputAnalysisRepository: 'InputAnalysisRepository',
  PerformanceTestRepository: 'PerformanceTestRepository',
  TestScenarioRepository: 'TestScenarioRepository',
  TestResultRepository: 'TestResultRepository',
  PerformanceReportRepository: 'PerformanceReportRepository',
  PerformanceOptimizationRepository: 'PerformanceOptimizationRepository',
  SecurityOptimizationRepository: 'SecurityOptimizationRepository',
  ScalabilityOptimizationRepository: 'ScalabilityOptimizationRepository',
  AvailabilityOptimizationRepository: 'AvailabilityOptimizationRepository',
  MaintainabilityOptimizationRepository: 'MaintainabilityOptimizationRepository',
  DeploymentRepository: 'DeploymentRepository',
  MonitoringRepository: 'MonitoringRepository',
  LogManagementRepository: 'LogManagementRepository',
  BackupRecoveryRepository: 'BackupRecoveryRepository',
  DisasterRecoveryRepository: 'DisasterRecoveryRepository'
};
