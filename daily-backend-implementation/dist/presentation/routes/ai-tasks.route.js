"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAiTasksRoutes = configureAiTasksRoutes;
async function configureAiTasksRoutes(instance) {
    instance.register((aiTasksInstance, _, done) => {
        aiTasksInstance.get('/health', async (_, reply) => {
            return reply.send({
                status: 'ok',
                service: 'ai-tasks-service'
            });
        });
        done();
    }, { prefix: '/ai-tasks' });
}
//# sourceMappingURL=ai-tasks.route.js.map