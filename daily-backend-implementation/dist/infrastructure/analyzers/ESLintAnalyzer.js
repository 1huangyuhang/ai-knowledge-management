"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESLintAnalyzer = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = require("path");
const CodeIssue_1 = require("../../domain/entities/CodeIssue");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class ESLintAnalyzer {
    eslintConfigPath;
    constructor() {
        this.eslintConfigPath = (0, path_1.join)(process.cwd(), '.eslintrc.json');
    }
    async analyze(filePath) {
        try {
            const result = await execAsync(`npx eslint ${filePath} --format json --config ${this.eslintConfigPath}`);
            const eslintOutput = JSON.parse(result.stdout);
            const issues = [];
            const metrics = [];
            let errors = 0;
            let warnings = 0;
            for (const fileResult of eslintOutput) {
                for (const message of fileResult.messages) {
                    const severity = this.mapESLintSeverity(message.severity);
                    if (severity === CodeIssue_1.SeverityLevel.HIGH || severity === CodeIssue_1.SeverityLevel.CRITICAL) {
                        errors++;
                    }
                    else {
                        warnings++;
                    }
                    const issue = {
                        id: `${message.ruleId}-${message.line}-${message.column}`,
                        ruleId: message.ruleId,
                        severity,
                        message: message.message,
                        line: message.line,
                        column: message.column,
                        fixable: message.fixable || false,
                        suggestion: message.suggestions?.map((s) => s.desc).join('; ') || undefined
                    };
                    issues.push(issue);
                }
            }
            metrics.push({
                name: 'eslint_errors',
                value: errors,
                unit: 'count',
                description: 'ESLint错误数量',
                threshold: {
                    optimal: 0,
                    max: 0,
                    unit: 'count'
                }
            });
            metrics.push({
                name: 'eslint_warnings',
                value: warnings,
                unit: 'count',
                description: 'ESLint警告数量',
                threshold: {
                    optimal: 0,
                    max: 5,
                    unit: 'count'
                }
            });
            metrics.push({
                name: 'eslint_issues',
                value: errors + warnings,
                unit: 'count',
                description: 'ESLint问题总数',
                threshold: {
                    optimal: 0,
                    max: 10,
                    unit: 'count'
                }
            });
            return {
                success: true,
                issues,
                metrics,
                stats: {
                    errors,
                    warnings,
                    files: eslintOutput.length,
                    time: eslintOutput[0]?.time || 0
                }
            };
        }
        catch (error) {
            return {
                success: false,
                issues: [],
                metrics: [],
                stats: {
                    errors: 0,
                    warnings: 0,
                    files: 0,
                    time: 0
                }
            };
        }
    }
    async analyzeMultiple(filePaths) {
        const results = new Map();
        for (const filePath of filePaths) {
            const result = await this.analyze(filePath);
            results.set(filePath, result);
        }
        return results;
    }
    mapESLintSeverity(eslintSeverity) {
        switch (eslintSeverity) {
            case 2:
                return CodeIssue_1.SeverityLevel.CRITICAL;
            case 1:
                return CodeIssue_1.SeverityLevel.MEDIUM;
            default:
                return CodeIssue_1.SeverityLevel.LOW;
        }
    }
}
exports.ESLintAnalyzer = ESLintAnalyzer;
//# sourceMappingURL=ESLintAnalyzer.js.map