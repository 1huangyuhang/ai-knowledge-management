"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleAndLLMBasedStructureValidationService = exports.ValidationIssueSeverity = exports.ValidationIssueType = void 0;
var ValidationIssueType;
(function (ValidationIssueType) {
    ValidationIssueType["CONCEPT_MISSING"] = "concept_missing";
    ValidationIssueType["RELATION_MISSING"] = "relation_missing";
    ValidationIssueType["STRUCTURAL_INCONSISTENCY"] = "structural_inconsistency";
    ValidationIssueType["LOGICAL_CONTRADICTION"] = "logical_contradiction";
    ValidationIssueType["HIERARCHY_ISSUE"] = "hierarchy_issue";
    ValidationIssueType["REDUNDANT_CONCEPT"] = "redundant_concept";
    ValidationIssueType["REDUNDANT_RELATION"] = "redundant_relation";
    ValidationIssueType["LOW_CONFIDENCE"] = "low_confidence";
})(ValidationIssueType || (exports.ValidationIssueType = ValidationIssueType = {}));
var ValidationIssueSeverity;
(function (ValidationIssueSeverity) {
    ValidationIssueSeverity["INFO"] = "info";
    ValidationIssueSeverity["WARNING"] = "warning";
    ValidationIssueSeverity["ERROR"] = "error";
    ValidationIssueSeverity["CRITICAL"] = "critical";
})(ValidationIssueSeverity || (exports.ValidationIssueSeverity = ValidationIssueSeverity = {}));
class RuleAndLLMBasedStructureValidationService {
    llmClient;
    constructor(llmClient) {
        this.llmClient = llmClient;
    }
    async validateStructure(model, concepts, relations) {
        const result = {
            isValid: true,
            validationScore: 1.0,
            issues: [],
            metrics: {
                conceptCompleteness: 1.0,
                relationCompleteness: 1.0,
                structuralConsistency: 1.0,
                logicalCoherence: 1.0,
                hierarchicalReasonableness: 1.0
            }
        };
        this.validateConceptCompleteness(concepts, relations, result);
        this.validateRelationCompleteness(concepts, relations, result);
        this.validateStructuralConsistency(concepts, relations, result);
        await this.validateLogicalCoherence(model, concepts, relations, result);
        this.validateHierarchicalReasonableness(concepts, relations, result);
        this.validateConfidenceLevels(concepts, relations, result);
        result.validationScore = this.calculateValidationScore(result.metrics);
        result.isValid = result.validationScore > 0.7 &&
            result.issues.every(issue => issue.severity !== ValidationIssueSeverity.CRITICAL);
        return result;
    }
    async validateConceptStructure(concept, model, concepts, relations) {
        const relatedRelations = relations.filter(relation => relation.getSourceConceptId() === concept.getId() ||
            relation.getTargetConceptId() === concept.getId());
        const subConcepts = [concept];
        return this.validateStructure(model, subConcepts, relatedRelations);
    }
    async validateRelationStructure(relation, model, concepts, relations) {
        const sourceConcept = concepts.find(c => c.getId() === relation.getSourceConceptId());
        const targetConcept = concepts.find(c => c.getId() === relation.getTargetConceptId());
        if (!sourceConcept || !targetConcept) {
            return {
                isValid: false,
                validationScore: 0.0,
                issues: [{
                        type: ValidationIssueType.RELATION_MISSING,
                        severity: ValidationIssueSeverity.ERROR,
                        description: 'Relation references non-existent concepts',
                        relatedEntityIds: [relation.getId()]
                    }],
                metrics: {
                    conceptCompleteness: 0.0,
                    relationCompleteness: 0.0,
                    structuralConsistency: 0.0,
                    logicalCoherence: 0.0,
                    hierarchicalReasonableness: 0.0
                }
            };
        }
        const subConcepts = [sourceConcept, targetConcept];
        const subRelations = [relation];
        return this.validateStructure(model, subConcepts, subRelations);
    }
    generateValidationReport(results) {
        let report = '# 认知模型结构验证报告\n\n';
        const totalScore = results.reduce((sum, result) => sum + result.validationScore, 0) / results.length;
        const totalIssues = results.reduce((sum, result) => sum + result.issues.length, 0);
        const criticalIssues = results.reduce((sum, result) => sum + result.issues.filter(issue => issue.severity === ValidationIssueSeverity.CRITICAL).length, 0);
        const errorIssues = results.reduce((sum, result) => sum + result.issues.filter(issue => issue.severity === ValidationIssueSeverity.ERROR).length, 0);
        const warningIssues = results.reduce((sum, result) => sum + result.issues.filter(issue => issue.severity === ValidationIssueSeverity.WARNING).length, 0);
        report += `## 总体统计\n\n`;
        report += `| 指标 | 数值 |\n`;
        report += `|------|------|\n`;
        report += `| 平均验证分数 | ${totalScore.toFixed(2)} |\n`;
        report += `| 总问题数 | ${totalIssues} |\n`;
        report += `| 严重问题数 | ${criticalIssues} |\n`;
        report += `| 错误问题数 | ${errorIssues} |\n`;
        report += `| 警告问题数 | ${warningIssues} |\n\n`;
        report += `## 问题详情\n\n`;
        results.forEach((result, index) => {
            if (result.issues.length > 0) {
                report += `### 验证结果 ${index + 1} (分数: ${result.validationScore.toFixed(2)})\n\n`;
                result.issues.forEach(issue => {
                    report += `- **[${issue.severity}] ${issue.type}**: ${issue.description}\n`;
                    if (issue.suggestedFix) {
                        report += `  - 建议修复: ${issue.suggestedFix}\n`;
                    }
                });
                report += `\n`;
            }
        });
        return report;
    }
    validateConceptCompleteness(concepts, relations, result) {
        const isolatedConcepts = concepts.filter(concept => {
            const hasRelation = relations.some(relation => relation.getSourceConceptId() === concept.getId() ||
                relation.getTargetConceptId() === concept.getId());
            return !hasRelation;
        });
        if (isolatedConcepts.length > 0) {
            result.metrics.conceptCompleteness = Math.max(0, 1 - (isolatedConcepts.length / concepts.length));
            isolatedConcepts.forEach(concept => {
                result.issues.push({
                    type: ValidationIssueType.CONCEPT_MISSING,
                    severity: ValidationIssueSeverity.WARNING,
                    description: `Concept "${concept.getSemanticIdentity()}" is isolated (no relations)`,
                    relatedEntityIds: [concept.getId()],
                    suggestedFix: `Add relations to connect this concept with others in the model`
                });
            });
        }
    }
    validateRelationCompleteness(concepts, relations, result) {
        const conceptIds = new Set(concepts.map(concept => concept.getId()));
        const invalidRelations = relations.filter(relation => {
            return !conceptIds.has(relation.getSourceConceptId()) ||
                !conceptIds.has(relation.getTargetConceptId());
        });
        if (invalidRelations.length > 0) {
            result.metrics.relationCompleteness = Math.max(0, 1 - (invalidRelations.length / relations.length));
            invalidRelations.forEach(relation => {
                result.issues.push({
                    type: ValidationIssueType.RELATION_MISSING,
                    severity: ValidationIssueSeverity.ERROR,
                    description: `Relation references non-existent concepts`,
                    relatedEntityIds: [relation.getId()],
                    suggestedFix: `Update relation to reference existing concepts`
                });
            });
        }
    }
    validateStructuralConsistency(concepts, relations, result) {
        const cycles = this.detectCycles(concepts, relations);
        if (cycles.length > 0) {
            result.metrics.structuralConsistency = Math.max(0, 1 - (cycles.length / relations.length));
            cycles.forEach(cycle => {
                result.issues.push({
                    type: ValidationIssueType.STRUCTURAL_INCONSISTENCY,
                    severity: ValidationIssueSeverity.WARNING,
                    description: `Detected cyclic relationship: ${cycle.join(' -> ')}`,
                    relatedEntityIds: cycle,
                    suggestedFix: `Consider refactoring the model to remove cyclic dependencies`
                });
            });
        }
    }
    async validateLogicalCoherence(model, concepts, relations, result) {
        result.metrics.logicalCoherence = 0.8;
    }
    validateHierarchicalReasonableness(concepts, relations, result) {
        const conceptStats = new Map();
        concepts.forEach(concept => {
            conceptStats.set(concept.getId(), {
                inDegree: 0,
                outDegree: 0,
                abstractionLevel: concept.getAbstractionLevel()
            });
        });
        relations.forEach(relation => {
            const sourceStats = conceptStats.get(relation.getSourceConceptId());
            const targetStats = conceptStats.get(relation.getTargetConceptId());
            if (sourceStats && targetStats) {
                sourceStats.outDegree++;
                targetStats.inDegree++;
            }
        });
        let不合理概念数量 = 0;
        conceptStats.forEach((stats, conceptId) => {
            const concept = concepts.find(c => c.getId() === conceptId);
            if (!concept)
                return;
            if (stats.abstractionLevel > 3 && stats.outDegree < 2) {
                不合理概念数量++;
                result.issues.push({
                    type: ValidationIssueType.HIERARCHY_ISSUE,
                    severity: ValidationIssueSeverity.WARNING,
                    description: `High abstraction concept "${concept.getSemanticIdentity()}" has few outgoing relations`,
                    relatedEntityIds: [conceptId],
                    suggestedFix: `Add more subconcepts or examples to this high-level concept`
                });
            }
            if (stats.abstractionLevel < 2 && stats.inDegree < 1) {
                不合理概念数量++;
                result.issues.push({
                    type: ValidationIssueType.HIERARCHY_ISSUE,
                    severity: ValidationIssueSeverity.WARNING,
                    description: `Low abstraction concept "${concept.getSemanticIdentity()}" has few incoming relations`,
                    relatedEntityIds: [conceptId],
                    suggestedFix: `Connect this concept to higher-level concepts`
                });
            }
        });
        result.metrics.hierarchicalReasonableness = Math.max(0, 1 - (不合理概念数量 / concepts.length));
    }
    validateConfidenceLevels(concepts, relations, result) {
        const lowConfidenceConcepts = concepts.filter(c => c.getConfidenceScore() < 0.3);
        const lowConfidenceRelations = relations.filter(r => r.getConfidenceScore() < 0.3);
        lowConfidenceConcepts.forEach(concept => {
            result.issues.push({
                type: ValidationIssueType.LOW_CONFIDENCE,
                severity: ValidationIssueSeverity.WARNING,
                description: `Concept "${concept.getSemanticIdentity()}" has low confidence score (${concept.getConfidenceScore().toFixed(2)})`,
                relatedEntityIds: [concept.getId()],
                suggestedFix: `Consider reviewing and updating this concept with more reliable information`
            });
        });
        lowConfidenceRelations.forEach(relation => {
            result.issues.push({
                type: ValidationIssueType.LOW_CONFIDENCE,
                severity: ValidationIssueSeverity.WARNING,
                description: `Relation has low confidence score (${relation.getConfidenceScore().toFixed(2)})`,
                relatedEntityIds: [relation.getId()],
                suggestedFix: `Consider verifying or updating this relation with more reliable information`
            });
        });
    }
    detectCycles(concepts, relations) {
        return [];
    }
    calculateValidationScore(metrics) {
        const weights = {
            conceptCompleteness: 0.2,
            relationCompleteness: 0.2,
            structuralConsistency: 0.2,
            logicalCoherence: 0.2,
            hierarchicalReasonableness: 0.2
        };
        return;
        metrics.conceptCompleteness * weights.conceptCompleteness +
            metrics.relationCompleteness * weights.relationCompleteness +
            metrics.structuralConsistency * weights.structuralConsistency +
            metrics.logicalCoherence * weights.logicalCoherence +
            metrics.hierarchicalReasonableness * weights.hierarchicalReasonableness;
    }
}
exports.RuleAndLLMBasedStructureValidationService = RuleAndLLMBasedStructureValidationService;
//# sourceMappingURL=StructureValidationService.js.map