"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveModelServiceImpl = void 0;
class CognitiveModelServiceImpl {
    validateProposal(proposal) {
        return proposal.confidence > 0.7 && proposal.concepts.length > 0;
    }
    maintainConsistency(model) {
        const conflicts = this.detectConflicts(model.relations);
        conflicts.forEach(conflict => {
            model.removeRelation(conflict.id);
        });
        this.validateConceptHierarchy(model);
        this.updateConceptConfidence(model);
    }
    generateInsight(model) {
        const coreThemes = model.concepts
            .sort((a, b) => b.confidenceScore - a.confidenceScore)
            .slice(0, 3)
            .map(concept => concept.semanticIdentity);
        const blindSpots = [];
        if (model.concepts.length < 5) {
            blindSpots.push('认知模型概念数量较少，建议增加更多概念');
        }
        const conceptGaps = [];
        if (model.relations.length < model.concepts.length) {
            conceptGaps.push('认知模型关系数量较少，建议增加更多关系');
        }
        const structureSummary = `认知模型包含 ${model.concepts.length} 个概念和 ${model.relations.length} 个关系。`;
        const insightId = `insight-${model.id}-${Date.now()}`;
        return {
            id: insightId,
            modelId: model.id,
            coreThemes,
            blindSpots,
            conceptGaps,
            structureSummary,
            createdAt: new Date(),
            confidence: 0.8
        };
    }
    detectConflicts(relations) {
        const conflicts = [];
        for (let i = 0; i < relations.length; i++) {
            for (let j = i + 1; j < relations.length; j++) {
                const relation1 = relations[i];
                const relation2 = relations[j];
                if (relation1.sourceConceptId === relation2.sourceConceptId &&
                    relation1.targetConceptId === relation2.targetConceptId &&
                    relation1.relationType !== relation2.relationType) {
                    if (relation1.confidence < relation2.confidence) {
                        conflicts.push(relation1);
                    }
                    else {
                        conflicts.push(relation2);
                    }
                }
            }
        }
        return conflicts;
    }
    validateConceptHierarchy(model) {
        const visited = new Set();
        const recursionStack = new Set();
        const parentChildMap = new Map();
        model.relations.forEach(relation => {
            if (relation.relationType === 'PARENT_CHILD') {
                const children = parentChildMap.get(relation.sourceConceptId) || [];
                children.push(relation.targetConceptId);
                parentChildMap.set(relation.sourceConceptId, children);
            }
        });
        const hasCycle = (conceptId) => {
            visited.add(conceptId);
            recursionStack.add(conceptId);
            const children = parentChildMap.get(conceptId) || [];
            for (const childId of children) {
                if (!visited.has(childId)) {
                    if (hasCycle(childId)) {
                        return true;
                    }
                }
                else if (recursionStack.has(childId)) {
                    return true;
                }
            }
            recursionStack.delete(conceptId);
            return false;
        };
        for (const concept of model.concepts) {
            if (!visited.has(concept.id)) {
                if (hasCycle(concept.id)) {
                    return false;
                }
            }
        }
        return true;
    }
    updateConceptConfidence(model) {
        const relationCountMap = new Map();
        model.relations.forEach(relation => {
            const sourceCount = relationCountMap.get(relation.sourceConceptId) || 0;
            relationCountMap.set(relation.sourceConceptId, sourceCount + 1);
            const targetCount = relationCountMap.get(relation.targetConceptId) || 0;
            relationCountMap.set(relation.targetConceptId, targetCount + 1);
        });
        model.concepts.forEach(concept => {
            const relationCount = relationCountMap.get(concept.id) || 0;
            const confidenceAdjustment = Math.min(relationCount * 0.05, 0.2);
            const newConfidence = Math.min(concept.confidenceScore + confidenceAdjustment, 1.0);
            concept.confidenceScore = newConfidence;
        });
    }
}
exports.CognitiveModelServiceImpl = CognitiveModelServiceImpl;
//# sourceMappingURL=cognitive-model.service.js.map