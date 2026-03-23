"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAuthRoutes = configureAuthRoutes;
async function configureAuthRoutes(instance) {
    instance.register((authInstance, _, done) => {
        authInstance.get('/health', async (_, reply) => {
            return reply.send({
                status: 'ok',
                service: 'auth-service'
            });
        });
        done();
    }, { prefix: '/auth' });
}
//# sourceMappingURL=auth.route.js.map