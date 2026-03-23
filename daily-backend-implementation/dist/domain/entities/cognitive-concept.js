"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveConceptImpl = void 0;
class CognitiveConceptImpl {
    id;
    modelId;
    semanticIdentity;
    abstractionLevel;
    confidenceScore;
    description;
    metadata;
    createdAt;
    updatedAt;
    sourceThoughtIds;
    constructor(id, modelId, semanticIdentity, abstractionLevel, confidenceScore, description, metadata = {}, sourceThoughtIds = [], createdAt = new Date()) {
        this.id = id;
        this.modelId = modelId;
        this.semanticIdentity = semanticIdentity;
        this.abstractionLevel = Math.max(1, Math.min(5, abstractionLevel));
        this.confidenceScore = Math.max(0, Math.min(1, confidenceScore));
        this.description = description;
        this.metadata = metadata;
        this.sourceThoughtIds = sourceThoughtIds;
        this.createdAt = createdAt;
        this.updatedAt = new Date();
    }
    update(updates) {
        if (updates.modelId !== undefined) {
            this.modelId = updates.modelId;
        }
        if (updates.semanticIdentity !== undefined) {
            this.semanticIdentity = updates.semanticIdentity;
        }
        if (updates.abstractionLevel !== undefined) {
            this.abstractionLevel = Math.max(1, Math.min(5, updates.abstractionLevel));
        }
        if (updates.confidenceScore !== undefined) {
            this.confidenceScore = Math.max(0, Math.min(1, updates.confidenceScore));
        }
        if (updates.description !== undefined) {
            this.description = updates.description;
        }
        if (updates.metadata !== undefined) {
            this.metadata = { ...this.metadata, ...updates.metadata };
        }
        if (updates.sourceThoughtIds !== undefined) {
            this.sourceThoughtIds = updates.sourceThoughtIds;
        }
        this.updatedAt = new Date();
    }
    addSourceThought(thoughtId) {
        if (!this.sourceThoughtIds.includes(thoughtId)) {
            this.sourceThoughtIds.push(thoughtId);
            this.updatedAt = new Date();
        }
    }
    removeSourceThought(thoughtId) {
        const index = this.sourceThoughtIds.indexOf(thoughtId);
        if (index > -1) {
            this.sourceThoughtIds.splice(index, 1);
            this.updatedAt = new Date();
        }
    }
    updateConfidenceScore(score) {
        this.confidenceScore = Math.max(0, Math.min(1, score));
        this.updatedAt = new Date();
    }
}
exports.CognitiveConceptImpl = CognitiveConceptImpl;
//# sourceMappingURL=cognitive-concept.js.map