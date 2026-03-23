/**
 * 性能测试路由配置
 */
import { FastifyInstance } from 'fastify';
import { PerformanceTestController } from '../../infrastructure/api/controllers/PerformanceTestController';

/**
 * 配置性能测试路由
 * @param instance Fastify实例
 */
export async function configurePerformanceRoutes(instance: FastifyInstance): Promise<void> {
  // 创建控制器实例
  const performanceTestController = new PerformanceTestController();
  
  // 注册路由
  performanceTestController.registerRoutes(instance);
}
