"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureHealthRoutes = configureHealthRoutes;
async function configureHealthRoutes(app) {
    app.get('/health', async (request, reply) => {
        try {
            const { container } = await Promise.resolve().then(() => __importStar(require('../../di/container')));
            const healthChecker = container.resolve('HealthChecker');
            const healthStatus = await healthChecker.checkHealth();
            reply.status(healthStatus.status === 'UP' ? 200 : 503).send(healthStatus);
        }
        catch (error) {
            reply.status(503).send({
                status: 'DOWN',
                timestamp: Date.now(),
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    app.get('/api/modules', async (request, reply) => {
        try {
            const { container } = await Promise.resolve().then(() => __importStar(require('../../di/container')));
            const moduleRegistry = container.resolve('ModuleRegistry');
            const modules = await moduleRegistry.getAllModules();
            reply.status(200).send(modules);
        }
        catch (error) {
            reply.status(500).send({
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
    app.get('/api/integration-status', async (request, reply) => {
        try {
            const { container } = await Promise.resolve().then(() => __importStar(require('../../di/container')));
            const moduleIntegrationService = container.resolve('ModuleIntegrationService');
            const status = await moduleIntegrationService.getIntegrationStatus();
            reply.status(200).send(status);
        }
        catch (error) {
            reply.status(500).send({
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
}
//# sourceMappingURL=health.routes.js.map