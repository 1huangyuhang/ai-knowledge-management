"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncrementalUpdateStrategy = void 0;
class IncrementalUpdateStrategy {
    name = 'INCREMENTAL';
    async applyUpdate(currentModel, updateProposal) {
        const updatedModel = { ...currentModel };
        if (updateProposal.conceptsToAdd && updateProposal.conceptsToAdd.length > 0) {
            updatedModel.concepts = [...updatedModel.concepts, ...updateProposal.conceptsToAdd];
        }
        if (updateProposal.conceptsToUpdate && updateProposal.conceptsToUpdate.length > 0) {
            for (const conceptUpdate of updateProposal.conceptsToUpdate) {
                const conceptIndex = updatedModel.concepts.findIndex((c) => c.id === conceptUpdate.conceptId);
                if (conceptIndex !== -1) {
                    updatedModel.concepts[conceptIndex] = {
                        ...updatedModel.concepts[conceptIndex],
                        ...conceptUpdate.updates
                    };
                }
            }
        }
        if (updateProposal.conceptIdsToRemove && updateProposal.conceptIdsToRemove.length > 0) {
            updatedModel.concepts = updatedModel.concepts.filter((c) => !updateProposal.conceptIdsToRemove.includes(c.id));
        }
        if (updateProposal.relationsToAdd && updateProposal.relationsToAdd.length > 0) {
            updatedModel.relations = [...updatedModel.relations, ...updateProposal.relationsToAdd];
        }
        if (updateProposal.relationsToUpdate && updateProposal.relationsToUpdate.length > 0) {
            for (const relationUpdate of updateProposal.relationsToUpdate) {
                const relationIndex = updatedModel.relations.findIndex((r) => r.id === relationUpdate.relationId);
                if (relationIndex !== -1) {
                    updatedModel.relations[relationIndex] = {
                        ...updatedModel.relations[relationIndex],
                        ...relationUpdate.updates
                    };
                }
            }
        }
        if (updateProposal.relationIdsToRemove && updateProposal.relationIdsToRemove.length > 0) {
            updatedModel.relations = updatedModel.relations.filter((r) => !updateProposal.relationIdsToRemove.includes(r.id));
        }
        return updatedModel;
    }
    async validateProposal(currentModel, updateProposal) {
        return true;
    }
}
exports.IncrementalUpdateStrategy = IncrementalUpdateStrategy;
//# sourceMappingURL=incremental-update-strategy.js.map