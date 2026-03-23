"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeAnalysis = exports.AnalysisStatus = void 0;
const Entity_1 = require("./Entity");
var AnalysisStatus;
(function (AnalysisStatus) {
    AnalysisStatus["PENDING"] = "PENDING";
    AnalysisStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AnalysisStatus["COMPLETED"] = "COMPLETED";
    AnalysisStatus["FAILED"] = "FAILED";
})(AnalysisStatus || (exports.AnalysisStatus = AnalysisStatus = {}));
class CodeAnalysis extends Entity_1.Entity {
    projectId;
    filePath;
    metrics;
    issues;
    createdAt;
    analyzedAt;
    status;
    constructor(id, projectId, filePath, metrics, issues, createdAt, analyzedAt, status) {
        super(id);
        this.projectId = projectId;
        this.filePath = filePath;
        this.metrics = metrics;
        this.issues = issues;
        this.createdAt = createdAt;
        this.analyzedAt = analyzedAt;
        this.status = status;
    }
    getProjectId() {
        return this.projectId;
    }
    getFilePath() {
        return this.filePath;
    }
    getMetrics() {
        return [...this.metrics];
    }
    setMetrics(metrics) {
        this.metrics = metrics;
    }
    getIssues() {
        return [...this.issues];
    }
    setIssues(issues) {
        this.issues = issues;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getAnalyzedAt() {
        return this.analyzedAt;
    }
    setAnalyzedAt(analyzedAt) {
        this.analyzedAt = analyzedAt;
    }
    getStatus() {
        return this.status;
    }
    setStatus(status) {
        this.status = status;
    }
}
exports.CodeAnalysis = CodeAnalysis;
//# sourceMappingURL=CodeAnalysis.js.map