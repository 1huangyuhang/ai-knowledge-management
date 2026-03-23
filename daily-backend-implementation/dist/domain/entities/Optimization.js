"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optimization = exports.OptimizationStatus = void 0;
var OptimizationStatus;
(function (OptimizationStatus) {
    OptimizationStatus["PENDING"] = "PENDING";
    OptimizationStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OptimizationStatus["COMPLETED"] = "COMPLETED";
    OptimizationStatus["FAILED"] = "FAILED";
    OptimizationStatus["ROLLED_BACK"] = "ROLLED_BACK";
})(OptimizationStatus || (exports.OptimizationStatus = OptimizationStatus = {}));
class Optimization {
    id;
    suggestionId;
    status;
    executedAt;
    completedAt;
    changes;
    validationResult;
    constructor(id, suggestionId, status, executedAt, completedAt, changes = [], validationResult) {
        this.id = id;
        this.suggestionId = suggestionId;
        this.status = status;
        this.executedAt = executedAt;
        this.completedAt = completedAt;
        this.changes = changes;
        this.validationResult = validationResult;
    }
    getId() {
        return this.id;
    }
    getSuggestionId() {
        return this.suggestionId;
    }
    getStatus() {
        return this.status;
    }
    setStatus(status) {
        this.status = status;
    }
    getExecutedAt() {
        return this.executedAt;
    }
    getCompletedAt() {
        return this.completedAt;
    }
    setCompletedAt(completedAt) {
        this.completedAt = completedAt;
    }
    getChanges() {
        return [...this.changes];
    }
    setChanges(changes) {
        this.changes = changes;
    }
    getValidationResult() {
        return this.validationResult;
    }
    setValidationResult(validationResult) {
        this.validationResult = validationResult;
    }
}
exports.Optimization = Optimization;
//# sourceMappingURL=Optimization.js.map