"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePerformanceRoutes = configurePerformanceRoutes;
const PerformanceTestController_1 = require("../../infrastructure/api/controllers/PerformanceTestController");
async function configurePerformanceRoutes(instance) {
    const performanceTestController = new PerformanceTestController_1.PerformanceTestController();
    performanceTestController.registerRoutes(instance);
}
//# sourceMappingURL=performance.route.js.map