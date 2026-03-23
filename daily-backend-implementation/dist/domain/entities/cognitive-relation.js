"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveRelationImpl = exports.CognitiveRelationType = void 0;
var CognitiveRelationType;
(function (CognitiveRelationType) {
    CognitiveRelationType["SUBCONCEPT"] = "subconcept";
    CognitiveRelationType["SUPERCONCEPT"] = "superconcept";
    CognitiveRelationType["ASSOCIATION"] = "association";
    CognitiveRelationType["CAUSALITY"] = "causality";
    CognitiveRelationType["CONTRAST"] = "contrast";
    CognitiveRelationType["EXAMPLE"] = "example";
    CognitiveRelationType["COMPOSITION"] = "composition";
    CognitiveRelationType["PROPERTY"] = "property";
})(CognitiveRelationType || (exports.CognitiveRelationType = CognitiveRelationType = {}));
class CognitiveRelationImpl {
    id;
    modelId;
    sourceConceptId;
    targetConceptId;
    type;
    confidenceScore;
    description;
    metadata;
    createdAt;
    updatedAt;
    sourceThoughtIds;
    constructor(id, modelId, sourceConceptId, targetConceptId, type, confidenceScore, description, metadata = {}, sourceThoughtIds = [], createdAt = new Date()) {
        this.id = id;
        this.modelId = modelId;
        this.sourceConceptId = sourceConceptId;
        this.targetConceptId = targetConceptId;
        this.type = type;
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
        if (updates.sourceConceptId !== undefined) {
            this.sourceConceptId = updates.sourceConceptId;
        }
        if (updates.targetConceptId !== undefined) {
            this.targetConceptId = updates.targetConceptId;
        }
        if (updates.type !== undefined) {
            this.type = updates.type;
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
exports.CognitiveRelationImpl = CognitiveRelationImpl;
//# sourceMappingURL=cognitive-relation.js.map