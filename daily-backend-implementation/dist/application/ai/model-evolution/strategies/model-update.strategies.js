"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStrategyFactory = exports.RestructureUpdateStrategy = exports.FullUpdateStrategy = exports.IncrementalUpdateStrategy = void 0;
class IncrementalUpdateStrategy {
    name = 'INCREMENTAL';
    async applyUpdate(currentModel, updateProposal) {
        const updatedModel = {
            ...currentModel,
            concepts: [...currentModel.concepts],
            relations: [...currentModel.relations]
        };
        if (updateProposal.conceptsToAdd && updateProposal.conceptsToAdd.length > 0) {
            updatedModel.concepts = [...updatedModel.concepts, ...updateProposal.conceptsToAdd];
        }
        if (updateProposal.conceptsToUpdate && updateProposal.conceptsToUpdate.length > 0) {
            for (const conceptUpdate of updateProposal.conceptsToUpdate) {
                const conceptIndex = updatedModel.concepts.findIndex(c => c.id === conceptUpdate.conceptId);
                if (conceptIndex !== -1) {
                    updatedModel.concepts[conceptIndex] = {
                        ...updatedModel.concepts[conceptIndex],
                        ...conceptUpdate.updates
                    };
                }
            }
        }
        if (updateProposal.conceptIdsToRemove && updateProposal.conceptIdsToRemove.length > 0) {
            updatedModel.concepts = updatedModel.concepts.filter(c => !updateProposal.conceptIdsToRemove.includes(c.id));
            updatedModel.relations = updatedModel.relations.filter(r => !updateProposal.conceptIdsToRemove.includes(r.sourceConceptId) &&
                !updateProposal.conceptIdsToRemove.includes(r.targetConceptId));
        }
        if (updateProposal.relationsToAdd && updateProposal.relationsToAdd.length > 0) {
            updatedModel.relations = [...updatedModel.relations, ...updateProposal.relationsToAdd];
        }
        if (updateProposal.relationsToUpdate && updateProposal.relationsToUpdate.length > 0) {
            for (const relationUpdate of updateProposal.relationsToUpdate) {
                const relationIndex = updatedModel.relations.findIndex(r => r.id === relationUpdate.relationId);
                if (relationIndex !== -1) {
                    updatedModel.relations[relationIndex] = {
                        ...updatedModel.relations[relationIndex],
                        ...relationUpdate.updates
                    };
                }
            }
        }
        if (updateProposal.relationIdsToRemove && updateProposal.relationIdsToRemove.length > 0) {
            updatedModel.relations = updatedModel.relations.filter(r => !updateProposal.relationIdsToRemove.includes(r.id));
        }
        return updatedModel;
    }
    async validateProposal(currentModel, updateProposal) {
        if (updateProposal.updateType !== ModelUpdateType.INCREMENTAL) {
            return false;
        }
        if (updateProposal.conceptsToUpdate) {
            for (const conceptUpdate of updateProposal.conceptsToUpdate) {
                const conceptExists = currentModel.concepts.some(c => c.id === conceptUpdate.conceptId);
                if (!conceptExists) {
                    return false;
                }
            }
        }
        if (updateProposal.conceptIdsToRemove) {
            for (const conceptId of updateProposal.conceptIdsToRemove) {
                const conceptExists = currentModel.concepts.some(c => c.id === conceptId);
                if (!conceptExists) {
                    return false;
                }
            }
        }
        if (updateProposal.relationsToUpdate) {
            for (const relationUpdate of updateProposal.relationsToUpdate) {
                const relationExists = currentModel.relations.some(r => r.id === relationUpdate.relationId);
                if (!relationExists) {
                    return false;
                }
            }
        }
        if (updateProposal.relationIdsToRemove) {
            for (const relationId of updateProposal.relationIdsToRemove) {
                const relationExists = currentModel.relations.some(r => r.id === relationId);
                if (!relationExists) {
                    return false;
                }
            }
        }
        return true;
    }
}
exports.IncrementalUpdateStrategy = IncrementalUpdateStrategy;
class FullUpdateStrategy {
    name = 'FULL';
    async applyUpdate(currentModel, updateProposal) {
        if (!updateProposal.conceptsToAdd || !updateProposal.relationsToAdd) {
            throw new Error('Full update requires both conceptsToAdd and relationsToAdd to be provided');
        }
        return {
            ...currentModel,
            concepts: [...updateProposal.conceptsToAdd],
            relations: [...updateProposal.relationsToAdd]
        };
    }
    async validateProposal(currentModel, updateProposal) {
        if (updateProposal.updateType !== ModelUpdateType.FULL) {
            return false;
        }
        return !!(updateProposal.conceptsToAdd && updateProposal.conceptsToAdd.length > 0 &&
            updateProposal.relationsToAdd && updateProposal.relationsToAdd.length > 0);
    }
}
exports.FullUpdateStrategy = FullUpdateStrategy;
class RestructureUpdateStrategy {
    name = 'RESTRUCTURE';
    async applyUpdate(currentModel, updateProposal) {
        const updatedModel = {
            ...currentModel,
            concepts: [...currentModel.concepts],
            relations: [...currentModel.relations]
        };
        if (updateProposal.conceptsToAdd && updateProposal.conceptsToAdd.length > 0) {
            updatedModel.concepts = [...updatedModel.concepts, ...updateProposal.conceptsToAdd];
        }
        if (updateProposal.conceptsToUpdate && updateProposal.conceptsToUpdate.length > 0) {
            for (const conceptUpdate of updateProposal.conceptsToUpdate) {
                const conceptIndex = updatedModel.concepts.findIndex(c => c.id === conceptUpdate.conceptId);
                if (conceptIndex !== -1) {
                    updatedModel.concepts[conceptIndex] = {
                        ...updatedModel.concepts[conceptIndex],
                        ...conceptUpdate.updates
                    };
                }
            }
        }
        if (updateProposal.conceptIdsToRemove && updateProposal.conceptIdsToRemove.length > 0) {
            updatedModel.concepts = updatedModel.concepts.filter(c => !updateProposal.conceptIdsToRemove.includes(c.id));
            updatedModel.relations = updatedModel.relations.filter(r => !updateProposal.conceptIdsToRemove.includes(r.sourceConceptId) &&
                !updateProposal.conceptIdsToRemove.includes(r.targetConceptId));
        }
        if (updateProposal.relationsToAdd && updateProposal.relationsToAdd.length > 0) {
            updatedModel.relations = [...updatedModel.relations, ...updateProposal.relationsToAdd];
        }
        if (updateProposal.relationsToUpdate && updateProposal.relationsToUpdate.length > 0) {
            for (const relationUpdate of updateProposal.relationsToUpdate) {
                const relationIndex = updatedModel.relations.findIndex(r => r.id === relationUpdate.relationId);
                if (relationIndex !== -1) {
                    updatedModel.relations[relationIndex] = {
                        ...updatedModel.relations[relationIndex],
                        ...relationUpdate.updates
                    };
                }
            }
        }
        if (updateProposal.relationIdsToRemove && updateProposal.relationIdsToRemove.length > 0) {
            updatedModel.relations = updatedModel.relations.filter(r => !updateProposal.relationIdsToRemove.includes(r.id));
        }
        return updatedModel;
    }
    async validateProposal(currentModel, updateProposal) {
        if (updateProposal.updateType !== ModelUpdateType.RESTRUCTURE) {
            return false;
        }
        return !!(updateProposal.conceptsToAdd?.length ||
            updateProposal.conceptsToUpdate?.length ||
            updateProposal.conceptIdsToRemove?.length ||
            updateProposal.relationsToAdd?.length ||
            updateProposal.relationsToUpdate?.length ||
            updateProposal.relationIdsToRemove?.length);
    }
}
exports.RestructureUpdateStrategy = RestructureUpdateStrategy;
class UpdateStrategyFactory {
    static createStrategy(updateType) {
        switch (updateType) {
            case ModelUpdateType.INCREMENTAL:
                return new IncrementalUpdateStrategy();
            case ModelUpdateType.FULL:
                return new FullUpdateStrategy();
            case ModelUpdateType.RESTRUCTURE:
                return new RestructureUpdateStrategy();
            default:
                return new IncrementalUpdateStrategy();
        }
    }
}
exports.UpdateStrategyFactory = UpdateStrategyFactory;
//# sourceMappingURL=model-update.strategies.js.map