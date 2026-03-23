"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelUpdateOptimizer = void 0;
class ModelUpdateOptimizer {
    cacheService;
    defaultOptions = {
        incrementalUpdate: true,
        batchSize: 100,
        useCache: true,
        cacheTtl: 3600000,
    };
    constructor(cacheService) {
        this.cacheService = cacheService;
    }
    async optimizeModelUpdate(existingModel, newConcepts, newRelations, options = {}) {
        const mergedOptions = { ...this.defaultOptions, ...options };
        const cacheKey = `modelUpdate:${existingModel.id}:${JSON.stringify(newConcepts.map(c => c.id).sort())}:${JSON.stringify(newRelations.map(r => r.id).sort())}`;
        if (mergedOptions.useCache && this.cacheService) {
            const cachedResult = await this.cacheService.get(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }
        }
        let updatedModel;
        if (mergedOptions.incrementalUpdate) {
            updatedModel = await this.performIncrementalUpdate(existingModel, newConcepts, newRelations, mergedOptions);
        }
        else {
            updatedModel = this.performFullUpdate(existingModel, newConcepts, newRelations);
        }
        if (mergedOptions.useCache && this.cacheService) {
            await this.cacheService.set(cacheKey, updatedModel, mergedOptions.cacheTtl);
        }
        return updatedModel;
    }
    async performIncrementalUpdate(existingModel, newConcepts, newRelations, options) {
        const conceptMap = new Map(existingModel.concepts.map(c => [c.id, c]));
        let addedConcepts = 0;
        let updatedConcepts = 0;
        let deletedConcepts = 0;
        for (let i = 0; i < newConcepts.length; i += options.batchSize) {
            const batch = newConcepts.slice(i, i + options.batchSize);
            for (const concept of batch) {
                if (conceptMap.has(concept.id)) {
                    const existingConcept = conceptMap.get(concept.id);
                    conceptMap.set(concept.id, this.mergeConcepts(existingConcept, concept));
                    updatedConcepts++;
                }
                else {
                    conceptMap.set(concept.id, concept);
                    addedConcepts++;
                }
            }
        }
        const relationKey = (r) => `${r.sourceConceptId}:${r.targetConceptId}:${r.type}`;
        const relationMap = new Map(existingModel.relations.map(r => [relationKey(r), r]));
        let addedRelations = 0;
        let updatedRelations = 0;
        let deletedRelations = 0;
        for (let i = 0; i < newRelations.length; i += options.batchSize) {
            const batch = newRelations.slice(i, i + options.batchSize);
            for (const relation of batch) {
                const key = relationKey(relation);
                if (relationMap.has(key)) {
                    const existingRelation = relationMap.get(key);
                    relationMap.set(key, this.mergeRelations(existingRelation, relation));
                    updatedRelations++;
                }
                else {
                    relationMap.set(key, relation);
                    addedRelations++;
                }
            }
        }
        const updatedModel = {
            ...existingModel,
            concepts: Array.from(conceptMap.values()),
            relations: Array.from(relationMap.values()),
            updatedAt: new Date(),
            version: this.incrementVersion(existingModel.version),
            metadata: {
                ...existingModel.metadata,
                updateStats: {
                    addedConcepts,
                    updatedConcepts,
                    deletedConcepts,
                    addedRelations,
                    updatedRelations,
                    deletedRelations,
                    updateType: 'incremental',
                    timestamp: new Date(),
                },
            },
        };
        return updatedModel;
    }
    performFullUpdate(existingModel, newConcepts, newRelations) {
        return {
            ...existingModel,
            concepts: newConcepts,
            relations: newRelations,
            updatedAt: new Date(),
            version: this.incrementVersion(existingModel.version),
            metadata: {
                ...existingModel.metadata,
                updateStats: {
                    addedConcepts: newConcepts.length,
                    updatedConcepts: 0,
                    deletedConcepts: existingModel.concepts.length,
                    addedRelations: newRelations.length,
                    updatedRelations: 0,
                    deletedRelations: existingModel.relations.length,
                    updateType: 'full',
                    timestamp: new Date(),
                },
            },
        };
    }
    mergeConcepts(existing, update) {
        return {
            ...existing,
            ...update,
            confidence: (existing.confidence + update.confidence) / 2,
            importance: (existing.importance + update.importance) / 2,
            occurrenceCount: existing.occurrenceCount + update.occurrenceCount,
            updatedAt: new Date(),
        };
    }
    mergeRelations(existing, update) {
        return {
            ...existing,
            ...update,
            confidence: (existing.confidence + update.confidence) / 2,
            strength: (existing.strength + update.strength) / 2,
            updatedAt: new Date(),
        };
    }
    incrementVersion(currentVersion) {
        const parts = currentVersion.split('.').map(Number);
        parts[2]++;
        return parts.join('.');
    }
}
exports.ModelUpdateOptimizer = ModelUpdateOptimizer;
//# sourceMappingURL=ModelUpdateOptimizer.js.map