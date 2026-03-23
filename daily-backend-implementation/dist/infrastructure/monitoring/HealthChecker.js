"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthChecker = exports.DefaultHealthChecker = exports.HealthStatusType = void 0;
var HealthStatusType;
(function (HealthStatusType) {
    HealthStatusType["UP"] = "UP";
    HealthStatusType["DOWN"] = "DOWN";
    HealthStatusType["DEGRADED"] = "DEGRADED";
})(HealthStatusType || (exports.HealthStatusType = HealthStatusType = {}));
class DefaultHealthChecker {
    healthIndicators = new Map();
    async checkHealth() {
        const moduleResults = {};
        let overallStatus = HealthStatusType.UP;
        await Promise.all(Array.from(this.healthIndicators.entries()).map(async ([moduleId, indicator]) => {
            try {
                const result = await indicator.check();
                moduleResults[moduleId] = result;
                if (result.status === HealthStatusType.DOWN) {
                    overallStatus = HealthStatusType.DOWN;
                }
                else if (result.status === HealthStatusType.DEGRADED && overallStatus === HealthStatusType.UP) {
                    overallStatus = HealthStatusType.DEGRADED;
                }
            }
            catch (error) {
                moduleResults[moduleId] = {
                    status: HealthStatusType.DOWN,
                    details: { error: String(error) },
                    timestamp: new Date().toISOString()
                };
                overallStatus = HealthStatusType.DOWN;
            }
        }));
        const systemMetrics = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
        };
        return {
            status: overallStatus,
            timestamp: Date.now(),
            modules: moduleResults,
            metrics: systemMetrics
        };
    }
    async registerHealthIndicator(moduleId, indicator) {
        this.healthIndicators.set(moduleId, indicator);
    }
    async removeHealthIndicator(moduleId) {
        this.healthIndicators.delete(moduleId);
    }
}
exports.DefaultHealthChecker = DefaultHealthChecker;
exports.healthChecker = new DefaultHealthChecker();
//# sourceMappingURL=HealthChecker.js.map