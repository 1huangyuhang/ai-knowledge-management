/**
 * 思想片段相关路由
 * 处理思想片段的创建、查询、更新和删除等功能
 */
import { FastifyInstance } from 'fastify';

/**
 * 配置思想片段路由
 * @param instance Fastify实例
 */
export async function configureThoughtsRoutes(instance: FastifyInstance): Promise<void> {
  // 注册路由组
  instance.register((thoughtsInstance, _, done) => {
    // 健康检查路由
    thoughtsInstance.get('/health', async (_, reply) => {
      return reply.send({
        status: 'ok',
        service: 'thoughts-service'
      });
    });

    done();
  }, { prefix: '/thoughts' });
}