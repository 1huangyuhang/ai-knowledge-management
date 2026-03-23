"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthStatus = exports.HealthCheckType = exports.AvailabilityStrategy = exports.AvailabilityLevel = void 0;
var AvailabilityLevel;
(function (AvailabilityLevel) {
    AvailabilityLevel["LOW"] = "LOW";
    AvailabilityLevel["MEDIUM"] = "MEDIUM";
    AvailabilityLevel["HIGH"] = "HIGH";
    AvailabilityLevel["CRITICAL"] = "CRITICAL";
})(AvailabilityLevel || (exports.AvailabilityLevel = AvailabilityLevel = {}));
var AvailabilityStrategy;
(function (AvailabilityStrategy) {
    AvailabilityStrategy["ACTIVE_REDUNDANCY"] = "ACTIVE_REDUNDANCY";
    AvailabilityStrategy["PASSIVE_REDUNDANCY"] = "PASSIVE_REDUNDANCY";
    AvailabilityStrategy["HYBRID_REDUNDANCY"] = "HYBRID_REDUNDANCY";
    AvailabilityStrategy["NO_REDUNDANCY"] = "NO_REDUNDANCY";
})(AvailabilityStrategy || (exports.AvailabilityStrategy = AvailabilityStrategy = {}));
var HealthCheckType;
(function (HealthCheckType) {
    HealthCheckType["HTTP"] = "HTTP";
    HealthCheckType["TCP"] = "TCP";
    HealthCheckType["COMMAND"] = "COMMAND";
    HealthCheckType["CUSTOM"] = "CUSTOM";
})(HealthCheckType || (exports.HealthCheckType = HealthCheckType = {}));
var HealthStatus;
(function (HealthStatus) {
    HealthStatus["HEALTHY"] = "HEALTHY";
    HealthStatus["UNHEALTHY"] = "UNHEALTHY";
    HealthStatus["WARNING"] = "WARNING";
    HealthStatus["UNKNOWN"] = "UNKNOWN";
})(HealthStatus || (exports.HealthStatus = HealthStatus = {}));
//# sourceMappingURL=AvailabilityConfig.js.map