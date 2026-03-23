"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fastify_1 = tslib_1.__importDefault(require("fastify"));
const cors_1 = tslib_1.__importDefault(require("@fastify/cors"));
const helmet_1 = tslib_1.__importDefault(require("@fastify/helmet"));
const rate_limit_1 = tslib_1.__importDefault(require("@fastify/rate-limit"));
const container_1 = require("./di/container");
const routes_1 = require("./presentation/routes");
async function startApp() {
    const app = (0, fastify_1.default)({
        logger: {
            level: process.env['LOG_LEVEL'] || 'info',
        },
    });
    try {
        await app.register(cors_1.default, {
            origin: process.env['CORS_ORIGIN'] || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        });
        await app.register(helmet_1.default);
        await app.register(rate_limit_1.default, {
            global: false,
        });
        const { PerformanceMonitor, createPerformanceMiddleware } = await Promise.resolve().then(() => tslib_1.__importStar(require('./presentation/middlewares/performance.middleware')));
        const performanceMonitor = new PerformanceMonitor();
        const performanceMiddleware = createPerformanceMiddleware(performanceMonitor);
        app.addHook('onRequest', performanceMiddleware);
        await (0, container_1.configureDI)(app);
        await (0, routes_1.configureRoutes)(app);
        app.setErrorHandler((error, request, reply) => {
            try {
                const errorHandler = container_1.container.resolve('ErrorHandler');
                return errorHandler.handle(error, request, reply);
            }
            catch (handlerError) {
                app.log.error(`Error in error handler: ${handlerError instanceof Error ? handlerError.message : String(handlerError)}`);
                reply.status(500).send({
                    statusCode: 500,
                    error: 'Internal Server Error',
                    message: 'An unexpected error occurred',
                });
            }
        });
        const PORT = process.env['PORT'] || 3000;
        const HOST = process.env['HOST'] || '0.0.0.0';
        await app.listen({ port: Number(PORT), host: HOST });
        app.log.info(`Server started on http://${HOST}:${PORT}`);
        app.log.info('System integration completed successfully');
    }
    catch (error) {
        app.log.error(`Error starting server: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
startApp();
//# sourceMappingURL=index.js.map