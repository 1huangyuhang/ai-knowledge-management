"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveModelUpdateService = void 0;
class CognitiveModelUpdateService {
    updateCognitiveModel(model, thoughtFragment, options = {}) {
        const startTime = Date.now();
        const changes = {
            addedConcepts: 0,
            updatedConcepts: 0,
            addedRelations: 0,
            updatedRelations: 0,
            confidenceChanges: 0,
        };
        const updateOptions = {
            updateConcepts: true,
            updateRelations: true,
            updateConfidence: true,
            recalculateStructure: true,
            ...options,
        };
        if (updateOptions.updateConcepts) {
            const conceptChanges = this.updateConcepts(model, thoughtFragment);
            changes.addedConcepts = conceptChanges.added;
            changes.updatedConcepts = conceptChanges.updated;
        }
        if (updateOptions.updateRelations) {
            const relationChanges = this.updateRelations(model, thoughtFragment);
            changes.addedRelations = relationChanges.added;
            changes.updatedRelations = relationChanges.updated;
        }
        if (updateOptions.updateConfidence) {
            changes.confidenceChanges = this.updateConfidence(model, thoughtFragment);
        }
        if (updateOptions.recalculateStructure) {
            this.recalculateStructure(model);
        }
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        const conceptCount = model.concepts.length;
        const relationCount = model.relations.length;
        const averageConfidence = relationCount > 0
            ? model.relations.reduce((sum, rel) => sum + rel.confidence, 0) / relationCount
            : 0;
        return {
            model,
            changes,
            metadata: {
                processingTime,
                conceptCount,
                relationCount,
                averageConfidence,
            },
        };
    }
    updateConcepts(model, thoughtFragment) {
        const changes = { added: 0, updated: 0 };
        const keywords = thoughtFragment.metadata.keywords || [];
        for (const keyword of keywords) {
            let concept = model.concepts.find(c => c.name.toLowerCase() === keyword.toLowerCase());
            if (concept) {
                concept.occurrenceCount += 1;
                concept.lastOccurrence = new Date();
                concept.confidence = Math.min(1, concept.confidence + 0.1);
                changes.updated++;
            }
            else {
                concept = new cognitive_concept_1.CognitiveConcept({
                    id: crypto.randomUUID(),
                    modelId: model.id,
                    name: keyword,
                    description: '',
                    confidence: 0.5,
                    occurrenceCount: 1,
                    createdAt: new Date(),
                    lastOccurrence: new Date(),
                    metadata: {
                        sourceThoughtId: thoughtFragment.id,
                        sourceContent: thoughtFragment.content.substring(0, 100) + '...',
                    },
                });
                model.concepts.push(concept);
                changes.added++;
            }
        }
        return changes;
    }
    updateRelations(model, thoughtFragment) {
        const changes = { added: 0, updated: 0 };
        const keywords = thoughtFragment.metadata.keywords || [];
        for (let i = 0; i < keywords.length; i++) {
            for (let j = i + 1; j < keywords.length; j++) {
                const concept1 = model.concepts.find(c => c.name.toLowerCase() === keywords[i].toLowerCase());
                const concept2 = model.concepts.find(c => c.name.toLowerCase() === keywords[j].toLowerCase());
                if (concept1 && concept2) {
                    let relation = model.relations.find(r => (r.sourceConceptId === concept1.id && r.targetConceptId === concept2.id) ||
                        (r.sourceConceptId === concept2.id && r.targetConceptId === concept1.id));
                    if (relation) {
                        relation.strength += 0.1;
                        relation.confidence = Math.min(1, relation.confidence + 0.05);
                        relation.occurrenceCount += 1;
                        relation.lastOccurrence = new Date();
                        changes.updated++;
                    }
                    else {
                        relation = new cognitive_relation_1.CognitiveRelation({
                            id: crypto.randomUUID(),
                            modelId: model.id,
                            sourceConceptId: concept1.id,
                            targetConceptId: concept2.id,
                            type: 'association',
                            strength: 0.5,
                            confidence: 0.5,
                            occurrenceCount: 1,
                            createdAt: new Date(),
                            lastOccurrence: new Date(),
                            metadata: {
                                sourceThoughtId: thoughtFragment.id,
                            },
                        });
                        model.relations.push(relation);
                        changes.added++;
                    }
                }
            }
        }
        return changes;
    }
    updateConfidence(model, thoughtFragment) {
        let changes = 0;
        const keywords = thoughtFragment.metadata.keywords || [];
        for (const keyword of keywords) {
            const concept = model.concepts.find(c => c.name.toLowerCase() === keyword.toLowerCase());
            if (concept) {
                const oldConfidence = concept.confidence;
                concept.confidence = Math.min(1, concept.confidence + 0.1);
                if (concept.confidence !== oldConfidence) {
                    changes++;
                }
            }
        }
        return changes;
    }
    recalculateStructure(model) {
        const conceptScores = new Map();
        for (const relation of model.relations) {
            const sourceScore = conceptScores.get(relation.sourceConceptId) || 0;
            conceptScores.set(relation.sourceConceptId, sourceScore + relation.strength);
            const targetScore = conceptScores.get(relation.targetConceptId) || 0;
            conceptScores.set(relation.targetConceptId, targetScore + relation.strength);
        }
        for (const concept of model.concepts) {
            const score = conceptScores.get(concept.id) || 0;
            concept.metadata = {
                ...concept.metadata,
                centrality: score,
            };
        }
        model.updatedAt = new Date();
    }
}
exports.CognitiveModelUpdateService = CognitiveModelUpdateService;
//# sourceMappingURL=CognitiveModelUpdateService.js.map