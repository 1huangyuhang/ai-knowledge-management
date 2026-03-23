"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelConsistencyChecker = exports.ConsistencyIssueType = void 0;
var ConsistencyIssueType;
(function (ConsistencyIssueType) {
    ConsistencyIssueType["MISSING_CONCEPT"] = "missingConcept";
    ConsistencyIssueType["DUPLICATE_CONCEPT"] = "duplicateConcept";
    ConsistencyIssueType["SELF_REFERENTIAL_RELATION"] = "selfReferentialRelation";
    ConsistencyIssueType["INVALID_RELATION_TYPE"] = "invalidRelationType";
    ConsistencyIssueType["LOW_CONFIDENCE_CONCEPT"] = "lowConfidenceConcept";
    ConsistencyIssueType["LOW_CONFIDENCE_RELATION"] = "lowConfidenceRelation";
    ConsistencyIssueType["ISOLATED_CONCEPT"] = "isolatedConcept";
})(ConsistencyIssueType || (exports.ConsistencyIssueType = ConsistencyIssueType = {}));
class ModelConsistencyChecker {
    validRelationTypes = ['association', 'hierarchy', 'causality', 'similarity', 'dependency'];
    minimumConfidenceThreshold = 0.2;
    checkConsistency(model) {
        const startTime = Date.now();
        const issues = [];
        const concepts = model.concepts;
        const relations = model.relations;
        this.checkConceptConsistency(model, issues);
        this.checkRelationConsistency(model, issues);
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        const highSeverityIssues = issues.filter(issue => issue.severity === 'high').length;
        const mediumSeverityIssues = issues.filter(issue => issue.severity === 'medium').length;
        const lowSeverityIssues = issues.filter(issue => issue.severity === 'low').length;
        return {
            isConsistent: issues.length === 0,
            issues,
            metadata: {
                totalIssues: issues.length,
                highSeverityIssues,
                mediumSeverityIssues,
                lowSeverityIssues,
                conceptCount: concepts.length,
                relationCount: relations.length,
                processingTime,
            },
        };
    }
    checkConceptConsistency(model, issues) {
        const concepts = model.concepts;
        const conceptIds = new Set();
        const conceptNames = new Map();
        concepts.forEach((concept, index) => {
            if (conceptIds.has(concept.id)) {
                issues.push({
                    type: ConsistencyIssueType.DUPLICATE_CONCEPT,
                    severity: 'medium',
                    message: `概念ID重复: ${concept.id}`,
                    affectedEntityId: concept.id,
                    suggestedFix: `移除重复的概念或为其分配唯一ID`,
                });
            }
            else {
                conceptIds.add(concept.id);
            }
            const existingIds = conceptNames.get(concept.name) || [];
            existingIds.push(concept.id);
            conceptNames.set(concept.name, existingIds);
            if (concept.confidence && concept.confidence < this.minimumConfidenceThreshold) {
                issues.push({
                    type: ConsistencyIssueType.LOW_CONFIDENCE_CONCEPT,
                    severity: 'low',
                    message: `概念置信度低: ${concept.name} (${concept.confidence.toFixed(2)})`,
                    affectedEntityId: concept.id,
                    suggestedFix: `考虑删除或重新评估该概念`,
                });
            }
        });
        conceptNames.forEach((ids, name) => {
            if (ids.length > 1) {
                issues.push({
                    type: ConsistencyIssueType.DUPLICATE_CONCEPT,
                    severity: 'medium',
                    message: `概念名称重复: ${name}`,
                    suggestedFix: `为重复名称的概念添加更具体的名称或描述`,
                });
            }
        });
    }
    checkRelationConsistency(model, issues) {
        const concepts = model.concepts;
        const relations = model.relations;
        const conceptIds = new Set(concepts.map(c => c.id));
        relations.forEach((relation, index) => {
            if (relation.sourceConceptId === relation.targetConceptId) {
                issues.push({
                    type: ConsistencyIssueType.SELF_REFERENTIAL_RELATION,
                    severity: 'medium',
                    message: `自引用关系: ${relation.sourceConceptId} -> ${relation.targetConceptId}`,
                    affectedEntityId: relation.id,
                    suggestedFix: `移除自引用关系或检查关系定义是否正确`,
                });
            }
            if (!this.validRelationTypes.includes(relation.type)) {
                issues.push({
                    type: ConsistencyIssueType.INVALID_RELATION_TYPE,
                    severity: 'high',
                    message: `无效关系类型: ${relation.type}`,
                    affectedEntityId: relation.id,
                    suggestedFix: `使用有效的关系类型: ${this.validRelationTypes.join(', ')}`,
                });
            }
            if (!conceptIds.has(relation.sourceConceptId)) {
                issues.push({
                    type: ConsistencyIssueType.MISSING_CONCEPT,
                    severity: 'high',
                    message: `关系引用了不存在的源概念: ${relation.sourceConceptId}`,
                    affectedEntityId: relation.id,
                    suggestedFix: `添加缺失的源概念或修正关系引用`,
                });
            }
            if (!conceptIds.has(relation.targetConceptId)) {
                issues.push({
                    type: ConsistencyIssueType.MISSING_CONCEPT,
                    severity: 'high',
                    message: `关系引用了不存在的目标概念: ${relation.targetConceptId}`,
                    affectedEntityId: relation.id,
                    suggestedFix: `添加缺失的目标概念或修正关系引用`,
                });
            }
            if (relation.confidence && relation.confidence < this.minimumConfidenceThreshold) {
                issues.push({
                    type: ConsistencyIssueType.LOW_CONFIDENCE_RELATION,
                    severity: 'low',
                    message: `关系置信度低: ${relation.sourceConceptId} -> ${relation.targetConceptId} (${relation.confidence.toFixed(2)})`,
                    affectedEntityId: relation.id,
                    suggestedFix: `考虑删除或重新评估该关系`,
                });
            }
        });
        this.checkIsolatedConcepts(concepts, relations, issues);
    }
    checkIsolatedConcepts(concepts, relations, issues) {
        const conceptIdsInRelations = new Set();
        relations.forEach(relation => {
            conceptIdsInRelations.add(relation.sourceConceptId);
            conceptIdsInRelations.add(relation.targetConceptId);
        });
        concepts.forEach(concept => {
            if (!conceptIdsInRelations.has(concept.id)) {
                issues.push({
                    type: ConsistencyIssueType.ISOLATED_CONCEPT,
                    severity: 'low',
                    message: `孤立概念: ${concept.name}`,
                    affectedEntityId: concept.id,
                    suggestedFix: `为该概念添加关系或考虑删除`,
                });
            }
        });
    }
    autoFixConsistencyIssues(model, issues) {
        let fixedIssues = 0;
        const remainingIssues = [];
        const fixedModel = {
            ...model,
            concepts: [...model.concepts],
            relations: [...model.relations],
        };
        issues.forEach(issue => {
            switch (issue.type) {
                case ConsistencyIssueType.LOW_CONFIDENCE_CONCEPT:
                    fixedModel.concepts = fixedModel.concepts.filter(c => c.id !== issue.affectedEntityId);
                    fixedIssues++;
                    break;
                case ConsistencyIssueType.LOW_CONFIDENCE_RELATION:
                    fixedModel.relations = fixedModel.relations.filter(r => r.id !== issue.affectedEntityId);
                    fixedIssues++;
                    break;
                case ConsistencyIssueType.ISOLATED_CONCEPT:
                    fixedModel.concepts = fixedModel.concepts.filter(c => c.id !== issue.affectedEntityId);
                    fixedIssues++;
                    break;
                default:
                    remainingIssues.push(issue);
                    break;
            }
        });
        return {
            model: fixedModel,
            fixedIssues,
            remainingIssues,
        };
    }
}
exports.ModelConsistencyChecker = ModelConsistencyChecker;
//# sourceMappingURL=ModelConsistencyChecker.js.map