/**
 * 健康检查路由
 */
import { FastifyInstance } from 'fastify';
import { DIContainer } from '../../di/container';

/**
 * 健康检查路由配置
 * @param app Fastify实例
 */
export async function configureHealthRoutes(app: FastifyInstance): Promise<void> {
  // 健康检查端点
  app.get('/health', async (request, reply) => {
    try {
      // 获取DI容器实例
      const { container } = await import('../../di/container');
      
      // 获取健康检查器
      const healthChecker = container.resolve('HealthChecker');
      
      // 执行健康检查
      const healthStatus = await healthChecker.checkHealth();
      
      // 返回健康状态
      reply.status(healthStatus.status === 'UP' ? 200 : 503).send(healthStatus);
    } catch (error) {
      reply.status(503).send({
        status: 'DOWN',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // 模块列表端点
  app.get('/api/modules', async (request, reply) => {
    try {
      // 获取DI容器实例
      const { container } = await import('../../di/container');
      
      // 获取模块注册表
      const moduleRegistry = container.resolve('ModuleRegistry');
      
      // 获取所有模块
      const modules = await moduleRegistry.getAllModules();
      
      // 返回模块列表
      reply.status(200).send(modules);
    } catch (error) {
      reply.status(500).send({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // 集成状态端点
  app.get('/api/integration-status', async (request, reply) => {
    try {
      // 获取DI容器实例
      const { container } = await import('../../di/container');
      
      // 获取模块集成服务
      const moduleIntegrationService = container.resolve('ModuleIntegrationService');
      
      // 获取集成状态
      const status = await moduleIntegrationService.getIntegrationStatus();
      
      // 返回集成状态
      reply.status(200).send(status);
    } catch (error) {
      reply.status(500).send({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
}
