"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureRoutes = configureRoutes;
const auth_route_1 = require("./auth.route");
const cognitive_route_1 = require("./cognitive.route");
const thoughts_route_1 = require("./thoughts.route");
const ai_tasks_route_1 = require("./ai-tasks.route");
const health_routes_1 = require("./health.routes");
const performance_route_1 = require("./performance.route");
async function configureRoutes(app) {
    await (0, health_routes_1.configureHealthRoutes)(app);
    app.register(async (instance) => {
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
        await (0, auth_route_1.configureAuthRoutes)(instance);
        await (0, cognitive_route_1.configureCognitiveRoutes)(instance);
        await (0, thoughts_route_1.configureThoughtsRoutes)(instance);
        await (0, ai_tasks_route_1.configureAiTasksRoutes)(instance);
        await (0, performance_route_1.configurePerformanceRoutes)(instance);
    }, { prefix: '/api/v1' });
}
//# sourceMappingURL=index.js.map