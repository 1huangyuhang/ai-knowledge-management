/**
 * 认证相关路由
 * 处理用户注册、登录、刷新令牌等认证功能
 */
import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

/**
 * 配置认证路由
 * @param instance Fastify实例
 */
export async function configureAuthRoutes(instance: FastifyInstance): Promise<void> {
  // 创建认证控制器实例
  const authController = new AuthController();

  // 登录路由 - /api/v1/sessions
  instance.post('/sessions', async (request, reply) => {
    return authController.login(request, reply);
  });

  // 注册路由 - /api/v1/users
  instance.post('/users', async (request, reply) => {
    return authController.register(request, reply);
  });

  // 刷新令牌路由 - /api/v1/tokens/refresh
  instance.post('/tokens/refresh', async (request, reply) => {
    return authController.refreshToken(request, reply);
  });
}