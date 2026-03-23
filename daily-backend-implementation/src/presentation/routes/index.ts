/**
 * 路由注册配置
 * 用于注册所有API路由
 */
import { FastifyInstance } from 'fastify';
import { configureAuthRoutes } from './auth.route';
import { configureCognitiveRoutes } from './cognitive.route';
import { configureThoughtsRoutes } from './thoughts.route';
import { configureAiTasksRoutes } from './ai-tasks.route';
import { configureHealthRoutes } from './health.routes';
// import { configureFileUploadRoutes } from './file-upload.route';
// import { configureSpeechToTextRoutes } from './speech-to-text.route';
import { configurePerformanceRoutes } from './performance.route';

/**
 * 配置路由
 * @param app Fastify实例
 */
export async function configureRoutes(app: FastifyInstance): Promise<void> {
  // 配置健康检查路由
  await configureHealthRoutes(app);

  // API版本路由
  app.register(async (instance) => {
    // 注册API基础信息路由
      instance.get('/', async () => {
        return {
          version: '1.0.0',
          endpoints: [
            '/auth',
            '/cognitive',
            '/thoughts',
            '/ai-tasks',
            '/files',
            '/speech-to-text'
          ]
        };
      });

      // 注册各模块路由
      await configureAuthRoutes(instance);
      await configureCognitiveRoutes(instance);
      await configureThoughtsRoutes(instance);
      await configureAiTasksRoutes(instance);
      // await configureFileUploadRoutes(instance);
      // await configureSpeechToTextRoutes(instance);
      await configurePerformanceRoutes(instance);
  }, { prefix: '/api/v1' });
}
