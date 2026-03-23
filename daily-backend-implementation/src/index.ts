/**
 * 应用入口文件
 * 初始化Fastify应用并配置依赖注入容器
 */
import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

// 导入依赖注入配置
import { configureDI, container } from './di/container';

// 导入路由配置
import { configureRoutes } from './presentation/routes';

/**
 * 启动应用
 */
async function startApp() {
  // 创建Fastify实例
  const app = fastify({
    logger: {
      level: process.env['LOG_LEVEL'] || 'info',
    },
  });

  try {
    // 注册中间件
    await app.register(cors, {
      origin: process.env['CORS_ORIGIN'] || '*', // 在生产环境中应该限制允许的来源
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await app.register(helmet);
    await app.register(rateLimit, {
      global: false,
    });

    // 注册性能监控中间件
    const { PerformanceMonitor, createPerformanceMiddleware } = await import('./presentation/middlewares/performance.middleware');
    const performanceMonitor = new PerformanceMonitor();
    const performanceMiddleware = createPerformanceMiddleware(performanceMonitor);
    app.addHook('onRequest', performanceMiddleware);

    // 配置依赖注入容器
    await configureDI(app);

    // 注册路由
    await configureRoutes(app);

    // 添加全局错误处理
    app.setErrorHandler((error, request, reply) => {
      try {
        const errorHandler = container.resolve('ErrorHandler');
        return errorHandler.handle(error, request, reply);
      } catch (handlerError) {
        app.log.error(`Error in error handler: ${handlerError instanceof Error ? handlerError.message : String(handlerError)}`);
        reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
        });
      }
    });

    // 启动服务器
    const PORT = process.env['PORT'] || 3000;
    const HOST = process.env['HOST'] || '0.0.0.0';

    await app.listen({ port: Number(PORT), host: HOST });
    app.log.info(`Server started on http://${HOST}:${PORT}`);
    app.log.info('System integration completed successfully');
  } catch (error) {
    app.log.error(`Error starting server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// 启动应用
startApp();
