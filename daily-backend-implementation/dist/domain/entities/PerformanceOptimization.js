"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceOptimization = exports.OptimizationStatus = exports.OptimizationType = void 0;
var OptimizationType;
(function (OptimizationType) {
    OptimizationType["CACHE"] = "CACHE";
    OptimizationType["DATABASE"] = "DATABASE";
    OptimizationType["API"] = "API";
    OptimizationType["MEMORY"] = "MEMORY";
    OptimizationType["CPU"] = "CPU";
    OptimizationType["NETWORK"] = "NETWORK";
    OptimizationType["CODE"] = "CODE";
})(OptimizationType || (exports.OptimizationType = OptimizationType = {}));
var OptimizationStatus;
(function (OptimizationStatus) {
    OptimizationStatus["NOT_OPTIMIZED"] = "NOT_OPTIMIZED";
    OptimizationStatus["OPTIMIZING"] = "OPTIMIZING";
    OptimizationStatus["OPTIMIZED"] = "OPTIMIZED";
    OptimizationStatus["FAILED"] = "FAILED";
})(OptimizationStatus || (exports.OptimizationStatus = OptimizationStatus = {}));
class PerformanceOptimization {
    _id;
    _type;
    _config;
    _status;
    _result;
    _createdAt;
    _updatedAt;
    constructor(id, type, config) {
        this._id = id;
        this._type = type;
        this._config = config;
        this._status = OptimizationStatus.NOT_OPTIMIZED;
        this._createdAt = new Date();
        this._updatedAt = new Date();
    }
    startOptimization() {
        this._status = OptimizationStatus.OPTIMIZING;
        this._updatedAt = new Date();
        return this;
    }
    completeOptimization(result) {
        this._status = OptimizationStatus.OPTIMIZED;
        this._result = result;
        this._updatedAt = new Date();
        return this;
    }
    failOptimization(error) {
        this._status = OptimizationStatus.FAILED;
        this._updatedAt = new Date();
        return this;
    }
    updateConfig(config) {
        this._config = {
            ...this._config,
            ...config
        };
        this._updatedAt = new Date();
        return this;
    }
    get id() {
        return this._id;
    }
    get type() {
        return this._type;
    }
    get config() {
        return { ...this._config };
    }
    get status() {
        return this._status;
    }
    get result() {
        return this._result;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
}
exports.PerformanceOptimization = PerformanceOptimization;
//# sourceMappingURL=PerformanceOptimization.js.map