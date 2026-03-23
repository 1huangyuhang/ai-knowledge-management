"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizationReport = void 0;
class OptimizationReport {
    id;
    projectId;
    analyses;
    suggestions;
    optimizations;
    summary;
    createdAt;
    constructor(id, projectId, analyses, suggestions, optimizations, summary, createdAt) {
        this.id = id;
        this.projectId = projectId;
        this.analyses = analyses;
        this.suggestions = suggestions;
        this.optimizations = optimizations;
        this.summary = summary;
        this.createdAt = createdAt;
    }
    getId() {
        return this.id;
    }
    getProjectId() {
        return this.projectId;
    }
    getAnalyses() {
        return [...this.analyses];
    }
    getSuggestions() {
        return [...this.suggestions];
    }
    getOptimizations() {
        return [...this.optimizations];
    }
    getSummary() {
        return { ...this.summary };
    }
    getCreatedAt() {
        return this.createdAt;
    }
}
exports.OptimizationReport = OptimizationReport;
//# sourceMappingURL=OptimizationReport.js.map