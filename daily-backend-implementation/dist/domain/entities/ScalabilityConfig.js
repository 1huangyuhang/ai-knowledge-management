"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceType = exports.ScalingStrategy = exports.ScalabilityLevel = void 0;
var ScalabilityLevel;
(function (ScalabilityLevel) {
    ScalabilityLevel["LOW"] = "LOW";
    ScalabilityLevel["MEDIUM"] = "MEDIUM";
    ScalabilityLevel["HIGH"] = "HIGH";
    ScalabilityLevel["CRITICAL"] = "CRITICAL";
})(ScalabilityLevel || (exports.ScalabilityLevel = ScalabilityLevel = {}));
var ScalingStrategy;
(function (ScalingStrategy) {
    ScalingStrategy["MANUAL"] = "MANUAL";
    ScalingStrategy["AUTOMATIC"] = "AUTOMATIC";
    ScalingStrategy["HYBRID"] = "HYBRID";
})(ScalingStrategy || (exports.ScalingStrategy = ScalingStrategy = {}));
var ResourceType;
(function (ResourceType) {
    ResourceType["COMPUTE"] = "COMPUTE";
    ResourceType["MEMORY"] = "MEMORY";
    ResourceType["STORAGE"] = "STORAGE";
    ResourceType["NETWORK"] = "NETWORK";
    ResourceType["DATABASE"] = "DATABASE";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
//# sourceMappingURL=ScalabilityConfig.js.map