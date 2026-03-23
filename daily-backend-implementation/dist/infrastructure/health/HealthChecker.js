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
    indicators = new Map();
    async checkHealth() {
        const moduleResults = {};
        let overallStatus = HealthStatusType.UP;
        const results = await Promise.allSettled(Array.from(this.indicators.values()).map(async (indicator) => {
            try {
                const result = await indicator.check();
                moduleResults[indicator.moduleId] = result;
                if (result.status === HealthStatusType.DOWN) {
                    overallStatus = HealthStatusType.DOWN;
                }
                else if (result.status === HealthStatusType.DEGRADED && overallStatus === HealthStatusType.UP) {
                    overallStatus = HealthStatusType.DEGRADED;
                }
            }
            catch (error) {
                moduleResults[indicator.moduleId] = {
                    status: HealthStatusType.DOWN,
                    error: error instanceof Error ? error.message : String(error)
                };
                overallStatus = HealthStatusType.DOWN;
            }
        }));
        return {
            status: overallStatus,
            timestamp: Date.now(),
            modules: moduleResults,
            systemInfo: {
                nodeVersion: process.version,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage()
            }
        };
    }
    async registerHealthIndicator(indicator) {
        this.indicators.set(indicator.moduleId, indicator);
    }
    async unregisterHealthIndicator(moduleId) {
        this.indicators.delete(moduleId);
    }
    async checkModuleHealth(moduleId) {
        const indicator = this.indicators.get(moduleId);
        if (!indicator) {
            return null;
        }
        try {
            return await indicator.check();
        }
        catch (error) {
            return {
                status: HealthStatusType.DOWN,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
exports.DefaultHealthChecker = DefaultHealthChecker;
exports.healthChecker = new DefaultHealthChecker();
//# sourceMappingURL=HealthChecker.js.map