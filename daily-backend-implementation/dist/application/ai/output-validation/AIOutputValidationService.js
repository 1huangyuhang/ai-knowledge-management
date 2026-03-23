"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiDimensionalAIOutputValidationService = exports.ValidationProblemSeverity = exports.ValidationProblemType = void 0;
var ValidationProblemType;
(function (ValidationProblemType) {
    ValidationProblemType["INACCURATE_CONCEPT_SEMANTICS"] = "inaccurate_concept_semantics";
    ValidationProblemType["INCORRECT_RELATION_TYPE"] = "incorrect_relation_type";
    ValidationProblemType["LOGICAL_CONTRADICTION"] = "logical_contradiction";
    ValidationProblemType["STRUCTURAL_INCONSISTENCY"] = "structural_inconsistency";
    ValidationProblemType["LOW_CONFIDENCE"] = "low_confidence";
    ValidationProblemType["REDUNDANT_INFORMATION"] = "redundant_information";
    ValidationProblemType["MISSING_INFORMATION"] = "missing_information";
    ValidationProblemType["INPUT_MISMATCH"] = "input_mismatch";
})(ValidationProblemType || (exports.ValidationProblemType = ValidationProblemType = {}));
var ValidationProblemSeverity;
(function (ValidationProblemSeverity) {
    ValidationProblemSeverity["INFO"] = "info";
    ValidationProblemSeverity["WARNING"] = "warning";
    ValidationProblemSeverity["ERROR"] = "error";
    ValidationProblemSeverity["CRITICAL"] = "critical";
})(ValidationProblemSeverity || (exports.ValidationProblemSeverity = ValidationProblemSeverity = {}));
class MultiDimensionalAIOutputValidationService {
    llmClient;
    confidenceScoringService;
    structureValidationService;
    constructor(llmClient, confidenceScoringService, structureValidationService) {
        this.llmClient = llmClient;
        this.confidenceScoringService = confidenceScoringService;
        this.structureValidationService = structureValidationService;
    }
    async validateAIOutput(request) {
        const { concepts, relations, originalInput, context } = request;
        const result = {
            isValid: true,
            overallScore: 0,
            dimensionScores: {
                conceptValidation: 0,
                relationValidation: 0,
                structuralConsistency: 0,
                logicalCoherence: 0,
                semanticAccuracy: 0,
                confidenceScore: 0
            },
            issues: [],
            recommendations: []
        };
        const conceptValidationResult = await this.validateConcepts(concepts, originalInput);
        result.dimensionScores.conceptValidation = conceptValidationResult.score;
        result.issues.push(...conceptValidationResult.issues);
        const relationValidationResult = await this.validateRelations(relations, concepts, originalInput);
        result.dimensionScores.relationValidation = relationValidationResult.score;
        result.issues.push(...relationValidationResult.issues);
        const semanticAccuracy = await this.validateSemanticAccuracy(concepts, relations, originalInput);
        result.dimensionScores.semanticAccuracy = semanticAccuracy;
        const logicalCoherence = await this.validateLogicalCoherence(concepts, relations, originalInput);
        result.dimensionScores.logicalCoherence = logicalCoherence;
        const confidenceScore = await this.validateConfidence(concepts, relations);
        result.dimensionScores.confidenceScore = confidenceScore;
        result.overallScore = this.calculateOverallScore(result.dimensionScores);
        result.isValid = result.overallScore > 0.6 &&
            result.issues.every(issue => issue.severity < ValidationProblemSeverity.ERROR);
        result.recommendations = this.generateRecommendations(result);
        return result;
    }
    async batchValidateAIOutput(requests) {
        return Promise.all(requests.map(request => this.validateAIOutput(request)));
    }
    generateValidationReport(results) {
        let report = '# AI输出验证报告\n\n';
        const totalScore = results.reduce((sum, result) => sum + result.overallScore, 0) / results.length;
        const validResults = results.filter(result => result.isValid).length;
        const invalidResults = results.length - validResults;
        report += `## 总体统计\n\n`;
        report += `| 指标 | 数值 |\n`;
        report += `|------|------|\n`;
        report += `| 验证总数 | ${results.length} |\n`;
        report += `| 通过验证 | ${validResults} |\n`;
        report += `| 未通过验证 | ${invalidResults} |\n`;
        report += `| 平均分数 | ${totalScore.toFixed(2)} |\n\n`;
        report += `## 详细验证结果\n\n`;
        results.forEach((result, index) => {
            report += `### 验证结果 ${index + 1}\n\n`;
            report += `**总体状态**: ${result.isValid ? '通过' : '未通过'}\n`;
            report += `**总体分数**: ${result.overallScore.toFixed(2)}\n\n`;
            report += `#### 维度分数\n\n`;
            report += `| 维度 | 分数 |\n`;
            report += `|------|------|\n`;
            report += `| 概念验证 | ${result.dimensionScores.conceptValidation.toFixed(2)} |\n`;
            report += `| 关系验证 | ${result.dimensionScores.relationValidation.toFixed(2)} |\n`;
            report += `| 结构一致性 | ${result.dimensionScores.structuralConsistency.toFixed(2)} |\n`;
            report += `| 逻辑连贯性 | ${result.dimensionScores.logicalCoherence.toFixed(2)} |\n`;
            report += `| 语义准确性 | ${result.dimensionScores.semanticAccuracy.toFixed(2)} |\n`;
            report += `| 置信度分数 | ${result.dimensionScores.confidenceScore.toFixed(2)} |\n\n`;
            if (result.issues.length > 0) {
                report += `#### 发现的问题\n\n`;
                result.issues.forEach(issue => {
                    report += `- **[${issue.severity}] ${issue.type}**: ${issue.description}\n`;
                    if (issue.relatedEntityIds.length > 0) {
                        report += `  - 相关实体: ${issue.relatedEntityIds.join(', ')}\n`;
                    }
                });
                report += `\n`;
            }
            if (result.recommendations.length > 0) {
                report += `#### 改进建议\n\n`;
                result.recommendations.forEach((recommendation, recIndex) => {
                    report += `${recIndex + 1}. ${recommendation}\n`;
                });
                report += `\n`;
            }
        });
        return report;
    }
    async validateConcepts(concepts, originalInput) {
        const issues = [];
        if (concepts.length === 0) {
            issues.push({
                type: ValidationProblemType.MISSING_INFORMATION,
                severity: ValidationProblemSeverity.ERROR,
                description: 'No concepts were generated',
                relatedEntityIds: []
            });
            return { score: 0, issues };
        }
        concepts.forEach(concept => {
            if (!concept.getSemanticIdentity() || concept.getSemanticIdentity().trim() === '') {
                issues.push({
                    type: ValidationProblemType.INACCURATE_CONCEPT_SEMANTICS,
                    severity: ValidationProblemSeverity.ERROR,
                    description: `Concept has empty semantic identity`,
                    relatedEntityIds: [concept.getId()]
                });
            }
            if (concept.getConfidenceScore() < 0.3) {
                issues.push({
                    type: ValidationProblemType.LOW_CONFIDENCE,
                    severity: ValidationProblemSeverity.WARNING,
                    description: `Concept has low confidence score (${concept.getConfidenceScore().toFixed(2)})`,
                    relatedEntityIds: [concept.getId()]
                });
            }
        });
        const score = Math.max(0, 1 - (issues.length / concepts.length));
        return { score, issues };
    }
    async validateRelations(relations, concepts, originalInput) {
        const issues = [];
        const conceptIds = new Set(concepts.map(concept => concept.getId()));
        relations.forEach(relation => {
            if (!conceptIds.has(relation.getSourceConceptId()) ||
                !conceptIds.has(relation.getTargetConceptId())) {
                issues.push({
                    type: ValidationProblemType.STRUCTURAL_INCONSISTENCY,
                    severity: ValidationProblemSeverity.ERROR,
                    description: `Relation references non-existent concepts`,
                    relatedEntityIds: [relation.getId()]
                });
            }
            if (relation.getConfidenceScore() < 0.3) {
                issues.push({
                    type: ValidationProblemType.LOW_CONFIDENCE,
                    severity: ValidationProblemSeverity.WARNING,
                    description: `Relation has low confidence score (${relation.getConfidenceScore().toFixed(2)})`,
                    relatedEntityIds: [relation.getId()]
                });
            }
        });
        const score = relations.length > 0
            ? Math.max(0, 1 - (issues.length / relations.length))
            : 0.5;
        return { score, issues };
    }
    async validateSemanticAccuracy(concepts, relations, originalInput) {
        return 0.8;
    }
    async validateLogicalCoherence(concepts, relations, originalInput) {
        return 0.75;
    }
    async validateConfidence(concepts, relations) {
        let totalScore = 0;
        let totalEntities = 0;
        concepts.forEach(concept => {
            totalScore += concept.getConfidenceScore();
            totalEntities++;
        });
        relations.forEach(relation => {
            totalScore += relation.getConfidenceScore();
            totalEntities++;
        });
        return totalEntities > 0 ? totalScore / totalEntities : 0;
    }
    calculateOverallScore(dimensionScores) {
        const weights = {
            conceptValidation: 0.2,
            relationValidation: 0.2,
            structuralConsistency: 0.15,
            logicalCoherence: 0.15,
            semanticAccuracy: 0.15,
            confidenceScore: 0.15
        };
        return;
        dimensionScores.conceptValidation * weights.conceptValidation +
            dimensionScores.relationValidation * weights.relationValidation +
            dimensionScores.structuralConsistency * weights.structuralConsistency +
            dimensionScores.logicalCoherence * weights.logicalCoherence +
            dimensionScores.semanticAccuracy * weights.semanticAccuracy +
            dimensionScores.confidenceScore * weights.confidenceScore;
    }
    generateRecommendations(result) {
        const recommendations = [];
        if (result.dimensionScores.conceptValidation < 0.6) {
            recommendations.push('Improve the quality and relevance of generated concepts');
        }
        if (result.dimensionScores.relationValidation < 0.6) {
            recommendations.push('Enhance the accuracy of relation types between concepts');
        }
        if (result.dimensionScores.structuralConsistency < 0.6) {
            recommendations.push('Optimize the structural consistency of the cognitive model');
        }
        if (result.dimensionScores.logicalCoherence < 0.6) {
            recommendations.push('Improve the logical coherence of concept relationships');
        }
        if (result.dimensionScores.semanticAccuracy < 0.6) {
            recommendations.push('Enhance the semantic accuracy of generated content');
        }
        if (result.dimensionScores.confidenceScore < 0.6) {
            recommendations.push('Increase the confidence scores of generated entities');
        }
        return recommendations;
    }
}
exports.MultiDimensionalAIOutputValidationService = MultiDimensionalAIOutputValidationService;
//# sourceMappingURL=AIOutputValidationService.js.map