"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveProposalImpl = void 0;
class CognitiveProposalImpl {
    id;
    thoughtId;
    concepts;
    relations;
    confidence;
    reasoningTrace;
    createdAt;
    isApplied;
    appliedAt;
    appliedBy;
    constructor(id, thoughtId, concepts, relations, confidence, reasoningTrace, createdAt = new Date()) {
        this.id = id;
        this.thoughtId = thoughtId;
        this.concepts = concepts;
        this.relations = relations;
        this.confidence = Math.max(0, Math.min(1, confidence));
        this.reasoningTrace = reasoningTrace;
        this.createdAt = createdAt;
        this.isApplied = false;
        this.appliedAt = null;
        this.appliedBy = null;
    }
    markAsApplied(userId) {
        this.isApplied = true;
        this.appliedAt = new Date();
        this.appliedBy = userId;
    }
    validate() {
        if (this.concepts.length === 0 && this.relations.length === 0) {
            return false;
        }
        for (const concept of this.concepts) {
            if (!concept.semanticIdentity || concept.semanticIdentity.trim() === '') {
                return false;
            }
            if (concept.abstractionLevel < 1 || concept.abstractionLevel > 5) {
                return false;
            }
            if (concept.confidenceScore < 0 || concept.confidenceScore > 1) {
                return false;
            }
        }
        for (const relation of this.relations) {
            if (!relation.sourceSemanticIdentity || !relation.targetSemanticIdentity) {
                return false;
            }
            if (relation.confidenceScore < 0 || relation.confidenceScore > 1) {
                return false;
            }
        }
        if (this.confidence < 0 || this.confidence > 1) {
            return false;
        }
        return true;
    }
}
exports.CognitiveProposalImpl = CognitiveProposalImpl;
//# sourceMappingURL=cognitive-proposal.js.map