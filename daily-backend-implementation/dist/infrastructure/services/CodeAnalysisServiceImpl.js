"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeAnalysisServiceImpl = void 0;
const CodeAnalysis_1 = require("../../domain/entities/CodeAnalysis");
const UUID_1 = require("../../domain/value-objects/UUID");
const ESLintAnalyzer_1 = require("../analyzers/ESLintAnalyzer");
class CodeAnalysisServiceImpl {
    eslintAnalyzer;
    constructor() {
        this.eslintAnalyzer = new ESLintAnalyzer_1.ESLintAnalyzer();
    }
    async createAnalysis(dto) {
        const analysisId = UUID_1.UUID.generate();
        const codeAnalysis = CodeAnalysis_1.CodeAnalysis.create({
            id: analysisId,
            projectId: dto.projectId,
            filePath: dto.filePath,
            analysisType: dto.analysisType || 'static',
            configuration: dto.configuration || {},
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        if (codeAnalysis.isFailure) {
            throw new Error(codeAnalysis.errorValue());
        }
        return codeAnalysis.getValue();
    }
    async getAnalysisById(id) {
        return null;
    }
    async getAnalysesByProject(projectId) {
        return [];
    }
    async executeAnalysis(id) {
        const analysis = await this.getAnalysisById(id);
        if (!analysis) {
            throw new Error(`Analysis with id ${id} not found`);
        }
        const eslintResult = await this.eslintAnalyzer.analyze(analysis.filePath);
        const metrics = eslintResult.metrics.map(metric => ({
            name: metric.name,
            value: metric.value,
            unit: metric.unit,
            threshold: {
                optimal: metric.threshold.optimal,
                max: metric.threshold.max,
                unit: metric.threshold.unit
            },
            description: metric.description
        }));
        const issues = eslintResult.issues.map(issue => ({
            id: issue.id,
            ruleId: issue.ruleId,
            severity: issue.severity,
            message: issue.message,
            line: issue.line,
            column: issue.column,
            fixable: issue.fixable,
            suggestion: issue.suggestion
        }));
        const updatedAnalysis = await this.updateAnalysisResults(id, metrics, issues, 'completed');
        return updatedAnalysis;
    }
    async updateAnalysisResults(id, metrics, issues, status) {
        const analysis = await this.getAnalysisById(id);
        if (!analysis) {
            throw new Error(`Analysis with id ${id} not found`);
        }
        const updatedAnalysis = CodeAnalysis_1.CodeAnalysis.create({
            ...analysis,
            metrics,
            issues,
            status,
            completedAt: new Date(),
            updatedAt: new Date()
        });
        if (updatedAnalysis.isFailure) {
            throw new Error(updatedAnalysis.errorValue());
        }
        return updatedAnalysis.getValue();
    }
    async deleteAnalysis(id) {
        return true;
    }
}
exports.CodeAnalysisServiceImpl = CodeAnalysisServiceImpl;
//# sourceMappingURL=CodeAnalysisServiceImpl.js.map