"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestructureUpdateStrategy = void 0;
class RestructureUpdateStrategy {
    name = 'RESTRUCTURE';
    async applyUpdate(currentModel, updateProposal) {
        const updatedModel = { ...currentModel };
        if (updateProposal.conceptHierarchy) {
            this.updateConceptHierarchy(updatedModel, updateProposal.conceptHierarchy);
        }
        if (updateProposal.relationTypeAdjustments) {
            this.updateRelationTypes(updatedModel, updateProposal.relationTypeAdjustments);
        }
        if (updateProposal.conceptMergers) {
            this.mergeConcepts(updatedModel, updateProposal.conceptMergers);
        }
        if (updateProposal.conceptSplits) {
            this.splitConcepts(updatedModel, updateProposal.conceptSplits);
        }
        if (updateProposal.relationRestructures) {
            this.restructureRelations(updatedModel, updateProposal.relationRestructures);
        }
        updatedModel.metadata = {
            ...updatedModel.metadata,
            lastRestructured: new Date().toISOString()
        };
        return updatedModel;
    }
    updateConceptHierarchy(model, hierarchy) {
        if (model.concepts) {
            model.concepts = model.concepts.map((concept) => {
                const hierarchyInfo = hierarchy.find((h) => h.id === concept.id);
                if (hierarchyInfo) {
                    return {
                        ...concept,
                        parentId: hierarchyInfo.parentId,
                        level: hierarchyInfo.level
                    };
                }
                return concept;
            });
        }
    }
    updateRelationTypes(model, adjustments) {
        if (model.relations) {
            model.relations = model.relations.map((relation) => {
                const adjustment = adjustments.find((adj) => adj.relationId === relation.id);
                if (adjustment) {
                    return {
                        ...relation,
                        type: adjustment.newType,
                        weight: adjustment.newWeight || relation.weight
                    };
                }
                return relation;
            });
        }
    }
    mergeConcepts(model, mergers) {
        for (const merger of mergers) {
            const conceptsToMerge = model.concepts.filter((c) => merger.sourceIds.includes(c.id));
            if (conceptsToMerge.length > 0) {
                const mergedConcept = {
                    id: merger.targetId,
                    name: merger.targetName,
                    description: merger.targetDescription || conceptsToMerge.map((c) => c.description).join(' '),
                    mergedFrom: merger.sourceIds,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                model.concepts.push(mergedConcept);
                model.concepts = model.concepts.filter((c) => !merger.sourceIds.includes(c.id));
                model.relations = model.relations.map((r) => {
                    if (merger.sourceIds.includes(r.fromConceptId)) {
                        r.fromConceptId = merger.targetId;
                    }
                    if (merger.sourceIds.includes(r.toConceptId)) {
                        r.toConceptId = merger.targetId;
                    }
                    return r;
                });
            }
        }
    }
    splitConcepts(model, splits) {
        for (const split of splits) {
            const conceptToSplit = model.concepts.find((c) => c.id === split.sourceId);
            if (conceptToSplit) {
                split.targets.forEach((target) => {
                    model.concepts.push({
                        ...target,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        splitFrom: split.sourceId
                    });
                });
                model.concepts = model.concepts.filter((c) => c.id !== split.sourceId);
                model.relations = model.relations.filter((r) => r.fromConceptId !== split.sourceId && r.toConceptId !== split.sourceId);
            }
        }
    }
    restructureRelations(model, restructures) {
        for (const restructure of restructures) {
            model.relations = model.relations.filter((r) => !restructure.oldRelationIds.includes(r.id));
            restructure.newRelations.forEach((relation) => {
                model.relations.push({
                    ...relation,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            });
        }
    }
    async validateProposal(currentModel, updateProposal) {
        if (!updateProposal.conceptHierarchy &&
            !updateProposal.relationTypeAdjustments &&
            !updateProposal.conceptMergers &&
            !updateProposal.conceptSplits &&
            !updateProposal.relationRestructures) {
            return false;
        }
        if (updateProposal.conceptHierarchy) {
            if (!Array.isArray(updateProposal.conceptHierarchy)) {
                return false;
            }
        }
        if (updateProposal.relationTypeAdjustments) {
            if (!Array.isArray(updateProposal.relationTypeAdjustments)) {
                return false;
            }
        }
        return true;
    }
}
exports.RestructureUpdateStrategy = RestructureUpdateStrategy;
//# sourceMappingURL=restructure-update-strategy.js.map