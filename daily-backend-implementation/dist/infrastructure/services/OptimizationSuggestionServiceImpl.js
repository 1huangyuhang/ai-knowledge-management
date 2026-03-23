"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizationSuggestionServiceImpl = void 0;
const OptimizationSuggestion_1 = require("../../domain/entities/OptimizationSuggestion");
const UUID_1 = require("../../domain/value-objects/UUID");
class OptimizationSuggestionServiceImpl {
    async generateSuggestions(analysis) {
        const suggestions = [];
        for (const issue of analysis.issues) {
            const suggestion = this.generateSuggestionForIssue(analysis, issue);
            if (suggestion) {
                suggestions.push(suggestion);
            }
        }
        for (const metric of analysis.metrics) {
            const metricSuggestion = this.generateSuggestionForMetric(analysis, metric);
            if (metricSuggestion) {
                suggestions.push(metricSuggestion);
            }
        }
        return suggestions;
    }
    async getSuggestionById(id) {
        return null;
    }
    async getSuggestionsByAnalysis(analysisId) {
        return [];
    }
    generateSuggestionForIssue(analysis, issue) {
        let suggestionType;
        let description;
        let recommendation;
        switch (issue.ruleId) {
            case 'no-unused-vars':
                suggestionType = OptimizationSuggestion_1.SuggestionType.CODE_CLEANUP;
                description = `移除未使用的变量: ${issue.message}`;
                recommendation = `删除第 ${issue.line} 行的未使用变量，或在代码中使用它。`;
                break;
            case 'prefer-const':
                suggestionType = OptimizationSuggestion_1.SuggestionType.PERFORMANCE;
                description = `使用const替代let: ${issue.message}`;
                recommendation = `将第 ${issue.line} 行的let声明改为const，因为该变量的值不会改变。`;
                break;
            case 'no-console':
                suggestionType = OptimizationSuggestion_1.SuggestionType.CODE_CLEANUP;
                description = `移除控制台日志: ${issue.message}`;
                recommendation = `删除第 ${issue.line} 行的console语句，或在生产环境中禁用它们。`;
                break;
            case 'no-unreachable-code':
                suggestionType = OptimizationSuggestion_1.SuggestionType.CODE_CLEANUP;
                description = `移除不可达代码: ${issue.message}`;
                recommendation = `删除第 ${issue.line} 行的不可达代码，因为它永远不会被执行。`;
                break;
            default:
                suggestionType = OptimizationSuggestion_1.SuggestionType.GENERAL;
                description = `代码优化建议: ${issue.message}`;
                recommendation = `按照ESLint规则修复第 ${issue.line} 行的问题。`;
        }
        const suggestion = OptimizationSuggestion_1.OptimizationSuggestion.create({
            id: UUID_1.UUID.generate(),
            analysisId: analysis.id,
            type: suggestionType,
            description,
            recommendation,
            severity: issue.severity,
            line: issue.line,
            column: issue.column,
            filePath: analysis.filePath,
            ruleId: issue.ruleId,
            isFixable: issue.fixable || false,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        if (suggestion.isFailure) {
            return null;
        }
        return suggestion.getValue();
    }
    generateSuggestionForMetric(analysis, metric) {
        if (metric.value > metric.threshold.max) {
            let suggestionType;
            let description;
            let recommendation;
            switch (metric.name) {
                case 'eslint_errors':
                    suggestionType = OptimizationSuggestion_1.SuggestionType.CODE_CLEANUP;
                    description = `ESLint错误数量超过阈值`;
                    recommendation = `修复代码中的${metric.value}个ESLint错误，当前阈值为${metric.threshold.max}。`;
                    break;
                case 'eslint_warnings':
                    suggestionType = OptimizationSuggestion_1.SuggestionType.GENERAL;
                    description = `ESLint警告数量超过阈值`;
                    recommendation = `考虑修复代码中的${metric.value}个ESLint警告，当前阈值为${metric.threshold.max}。`;
                    break;
                case 'eslint_issues':
                    suggestionType = OptimizationSuggestion_1.SuggestionType.GENERAL;
                    description = `ESLint问题总数超过阈值`;
                    recommendation = `修复代码中的${metric.value}个ESLint问题，当前阈值为${metric.threshold.max}。`;
                    break;
                default:
                    return null;
            }
            const suggestion = OptimizationSuggestion_1.OptimizationSuggestion.create({
                id: UUID_1.UUID.generate(),
                analysisId: analysis.id,
                type: suggestionType,
                description,
                recommendation,
                severity: 'MEDIUM',
                line: 0,
                column: 0,
                filePath: analysis.filePath,
                ruleId: metric.name,
                isFixable: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            if (suggestion.isFailure) {
                return null;
            }
            return suggestion.getValue();
        }
        return null;
    }
}
exports.OptimizationSuggestionServiceImpl = OptimizationSuggestionServiceImpl;
//# sourceMappingURL=OptimizationSuggestionServiceImpl.js.map