"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureThoughtsRoutes = configureThoughtsRoutes;
async function configureThoughtsRoutes(instance) {
    instance.register((thoughtsInstance, _, done) => {
        thoughtsInstance.get('/health', async (_, reply) => {
            return reply.send({
                status: 'ok',
                service: 'thoughts-service'
            });
        });
        done();
    }, { prefix: '/thoughts' });
}
//# sourceMappingURL=thoughts.route.js.map