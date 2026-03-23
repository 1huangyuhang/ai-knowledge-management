"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullUpdateStrategy = void 0;
class FullUpdateStrategy {
    name = 'FULL';
    async applyUpdate(currentModel, updateProposal) {
        const updatedModel = {
            ...updateProposal,
            id: currentModel.id,
            userId: currentModel.userId,
            createdAt: currentModel.createdAt,
            metadata: {
                ...currentModel.metadata,
                lastFullUpdate: new Date().toISOString()
            }
        };
        return updatedModel;
    }
    async validateProposal(currentModel, updateProposal) {
        if (!updateProposal.concepts || !Array.isArray(updateProposal.concepts)) {
            return false;
        }
        if (!updateProposal.relations || !Array.isArray(updateProposal.relations)) {
            return false;
        }
        for (const concept of updateProposal.concepts) {
            if (!concept.id || !concept.name) {
                return false;
            }
        }
        for (const relation of updateProposal.relations) {
            if (!relation.id || !relation.fromConceptId || !relation.toConceptId) {
                return false;
            }
        }
        return true;
    }
}
exports.FullUpdateStrategy = FullUpdateStrategy;
//# sourceMappingURL=full-update-strategy.js.map