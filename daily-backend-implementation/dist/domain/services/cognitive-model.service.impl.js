"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveModelServiceImpl = void 0;
class CognitiveModelServiceImpl {
    validateProposal(proposal) {
        return proposal.confidence > 0.7 && proposal.concepts.length > 0;
    }
    maintainConsistency(model) {
        const conflicts = this.detectConflicts(model);
        conflicts.forEach(conflictId => {
            model.removeRelation(conflictId);
        });
        this.validateConceptHierarchy(model);
        this.updateConceptConfidence(model);
    }
    generateInsight(model) {
        return {
            id: crypto.randomUUID(),
            modelId: model.id,
            coreThemes: this.extractCoreThemes(model),
            blindSpots: this.detectBlindSpots(model),
            conceptGaps: this.identifyConceptGaps(model),
            structureSummary: this.generateStructureSummary(model),
            createdAt: new Date()
        };
    }
    detectConflicts(model) {
        const conflicts = [];
        const relationMap = new Map();
        model.relations.forEach(relation => {
            const key = `${relation.sourceConceptId}-${relation.targetConceptId}`;
            const inverseKey = `${relation.targetConceptId}-${relation.sourceConceptId}`;
            if (relationMap.has(key) || relationMap.has(inverseKey)) {
                conflicts.push(relation.id);
            }
            else {
                if (!relationMap.has(key)) {
                    relationMap.set(key, new Set());
                }
                relationMap.get(key)?.add(relation.relationType);
            }
        });
        return conflicts;
    }
    validateConceptHierarchy(model) {
        model.relations.forEach(relation => {
            if (relation.relationType === 'PARENT_CHILD') {
                const parentConcept = model.concepts.find(c => c.id === relation.sourceConceptId);
                const childConcept = model.concepts.find(c => c.id === relation.targetConceptId);
                if (parentConcept && childConcept) {
                    if (parentConcept.abstractionLevel <= childConcept.abstractionLevel) {
                        childConcept.abstractionLevel = parentConcept.abstractionLevel - 1;
                    }
                }
            }
        });
    }
    updateConceptConfidence(model) {
        model.concepts.forEach(concept => {
            const relationCount = model.relations.filter(r => r.sourceConceptId === concept.id || r.targetConceptId === concept.id).length;
            if (relationCount === 0) {
                concept.confidenceScore = Math.max(0.3, concept.confidenceScore - 0.1);
            }
            else if (relationCount > 5) {
                concept.confidenceScore = Math.min(1.0, concept.confidenceScore + 0.1);
            }
        });
    }
    extractCoreThemes(model) {
        return model.concepts
            .sort((a, b) => b.confidenceScore - a.confidenceScore)
            .slice(0, 3)
            .map(concept => concept.semanticIdentity);
    }
    detectBlindSpots(model) {
        return model.concepts
            .filter(concept => {
            const relationCount = model.relations.filter(r => r.sourceConceptId === concept.id || r.targetConceptId === concept.id).length;
            return relationCount < 2;
        })
            .map(concept => concept.semanticIdentity);
    }
    identifyConceptGaps(model) {
        return model.concepts
            .filter(concept => {
            const relationCount = model.relations.filter(r => r.sourceConceptId === concept.id || r.targetConceptId === concept.id).length;
            return concept.abstractionLevel > 3 && relationCount < 3;
        })
            .map(concept => concept.semanticIdentity);
    }
    generateStructureSummary(model) {
        const conceptCount = model.concepts.length;
        const relationCount = model.relations.length;
        const avgAbstractionLevel = model.concepts.reduce((sum, concept) => sum + concept.abstractionLevel, 0) / conceptCount;
        return `认知模型包含 ${conceptCount} 个概念和 ${relationCount} 个关系。平均抽象级别为 ${avgAbstractionLevel.toFixed(1)}。`;
    }
}
exports.CognitiveModelServiceImpl = CognitiveModelServiceImpl;
//# sourceMappingURL=cognitive-model.service.impl.js.map