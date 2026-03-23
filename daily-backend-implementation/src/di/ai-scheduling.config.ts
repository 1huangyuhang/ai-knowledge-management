import { container } from './container';

/**
 * 初始化AI调度相关依赖
 */
export async function initializeAISchedulingDependencies(): Promise<void> {
  // 注册资源仓库
  const { ResourceRepositoryImpl } = await import('../infrastructure/repositories/ResourceRepositoryImpl');
  container.register('ResourceRepository', () => {
    const dbClient = container.resolve('DatabaseClient');
    const logger = container.resolve('LoggerService');
    return new ResourceRepositoryImpl(dbClient, logger);
  }, true);

  // 注册资源管理器
  const { ResourceManagerImpl } = await import('../application/services/ResourceManager');
  container.register('ResourceManager', () => {
    const resourceRepository = container.resolve('ResourceRepository');
    const logger = container.resolve('LoggerService');
    return new ResourceManagerImpl(resourceRepository, logger);
  }, true);

  // 注册AI任务队列服务
  const { AITaskQueue } = await import('../application/services/ai-task-queue');
  container.register('AITaskQueue', () => new AITaskQueue(), true);

  // 注册AI任务执行器服务
  const { AITaskExecutor } = await import('../application/services/ai-task-executor');
  container.register('AITaskExecutor', () => new AITaskExecutor(), true);

  // 注册AI任务监控服务
  const { AITaskMonitor } = await import('../application/services/ai-task-monitor');
  container.register('AITaskMonitor', () => new AITaskMonitor(), true);

  // 注册AI调度器服务
  const { AIScheduler } = await import('../application/services/ai-scheduler');
  container.register('AIScheduler', () => {
    const taskQueue = container.resolve('AITaskQueue');
    const taskExecutor = container.resolve('AITaskExecutor');
    const taskMonitor = container.resolve('AITaskMonitor');
    const taskRepository = container.resolve('AITaskRepository');
    const resourceManager = container.resolve('ResourceManager');
    
    return new AIScheduler(
      taskQueue as any,
      taskExecutor as any,
      taskMonitor as any,
      taskRepository as any,
      resourceManager as any
    );
  }, true);
}