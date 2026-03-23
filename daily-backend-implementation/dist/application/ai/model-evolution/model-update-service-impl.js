"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelUpdateServiceImpl = void 0;
const incremental_update_strategy_1 = require("./model-update/strategies/incremental-update-strategy");
const uuid_1 = require("uuid");
class ModelUpdateServiceImpl {
    updateStrategy;
    cognitiveModelRepository;
    updateHistoryService;
    consistencyValidator;
    constructor(cognitiveModelRepository, updateHistoryService, consistencyValidator) {
        this.cognitiveModelRepository = cognitiveModelRepository;
        this.updateHistoryService = updateHistoryService;
        this.consistencyValidator = consistencyValidator;
        this.updateStrategy = new incremental_update_strategy_1.IncrementalUpdateStrategy();
    }
    async applyUpdate(updateProposal) {
        try {
            const currentModel = await this.cognitiveModelRepository.getById(updateProposal.userId);
            if (!currentModel) {
                throw new Error(`Cognitive model not found for user: ${updateProposal.userId}`);
            }
            const validationResult = await this.validateUpdateProposal(updateProposal);
            if (!validationResult.isValid) {
                throw new Error(`Invalid update proposal: ${validationResult.errors.join(', ')}`);
            }
            const strategyCompatible = await this.updateStrategy.validateProposal(currentModel, updateProposal);
            if (!strategyCompatible) {
                throw new Error(`Update proposal incompatible with current strategy: ${this.updateStrategy.name}`);
            }
            const updatedModel = await this.updateStrategy.applyUpdate(currentModel, updateProposal);
            const consistencyResult = await this.consistencyValidator.validate(updatedModel);
            if (!consistencyResult.isValid) {
                throw new Error(`Updated model inconsistent: ${consistencyResult.errors.join(', ')}`);
            }
            const newVersion = this.generateNewVersion(currentModel.version);
            updatedModel.version = newVersion;
            await this.cognitiveModelRepository.save(updatedModel);
            const updateRecord = {
                id: (0, uuid_1.v4)(),
                userId: updateProposal.userId,
                fromVersion: currentModel.version,
                toVersion: newVersion,
                updateType: updateProposal.updateType,
                source: updateProposal.source,
                updateDetails: {
                    conceptsAdded: updateProposal.conceptsToAdd?.length || 0,
                    conceptsUpdated: updateProposal.conceptsToUpdate?.length || 0,
                    conceptsRemoved: updateProposal.conceptIdsToRemove?.length || 0,
                    relationsAdded: updateProposal.relationsToAdd?.length || 0,
                    relationsUpdated: updateProposal.relationsToUpdate?.length || 0,
                    relationsRemoved: updateProposal.relationIdsToRemove?.length || 0
                },
                confidenceScore: updateProposal.confidenceScore,
                timestamp: new Date(),
                relatedThoughtIds: updateProposal.relatedThoughtIds
            };
            await this.updateHistoryService.recordUpdate(updateRecord);
            return {
                success: true,
                newVersion: newVersion,
                oldVersion: currentModel.version,
                updateDetails: updateRecord.updateDetails,
                timestamp: new Date()
            };
        }
        catch (error) {
            return {
                success: false,
                newVersion: updateProposal.currentVersion,
                oldVersion: updateProposal.currentVersion,
                updateDetails: {
                    conceptsAdded: 0,
                    conceptsUpdated: 0,
                    conceptsRemoved: 0,
                    relationsAdded: 0,
                    relationsUpdated: 0,
                    relationsRemoved: 0
                },
                timestamp: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async batchApplyUpdates(updateProposals) {
        const results = [];
        let successfulUpdates = 0;
        let failedUpdates = 0;
        for (const proposal of updateProposals) {
            const result = await this.applyUpdate(proposal);
            results.push(result);
            if (result.success) {
                successfulUpdates++;
            }
            else {
                failedUpdates++;
            }
        }
        return {
            totalUpdates: updateProposals.length,
            successfulUpdates,
            failedUpdates,
            results,
            timestamp: new Date()
        };
    }
    async validateUpdateProposal(updateProposal) {
        const errors = [];
        const warnings = [];
        if (!updateProposal.id) {
            errors.push('Update proposal ID is required');
        }
        if (!updateProposal.userId) {
            errors.push('User ID is required');
        }
        if (!updateProposal.currentVersion) {
            errors.push('Current version is required');
        }
        if (!updateProposal.updateType) {
            errors.push('Update type is required');
        }
        if (!updateProposal.source) {
            errors.push('Update source is required');
        }
        if (updateProposal.confidenceScore < 0 || updateProposal.confidenceScore > 1) {
            errors.push('Confidence score must be between 0 and 1');
        }
        const currentModel = await this.cognitiveModelRepository.getById(updateProposal.userId);
        if (!currentModel) {
            errors.push(`Cognitive model not found for user: ${updateProposal.userId}`);
        }
        else {
            if (currentModel.version !== updateProposal.currentVersion) {
                errors.push(`Version mismatch. Current model version: ${currentModel.version}, Proposal version: ${updateProposal.currentVersion}`);
            }
            if (updateProposal.conceptsToUpdate) {
                for (const conceptUpdate of updateProposal.conceptsToUpdate) {
                    const conceptExists = currentModel.concepts.some(c => c.id === conceptUpdate.conceptId);
                    if (!conceptExists) {
                        errors.push(`Concept not found: ${conceptUpdate.conceptId}`);
                    }
                }
            }
            if (updateProposal.conceptIdsToRemove) {
                for (const conceptId of updateProposal.conceptIdsToRemove) {
                    const conceptExists = currentModel.concepts.some(c => c.id === conceptId);
                    if (!conceptExists) {
                        errors.push(`Concept not found: ${conceptId}`);
                    }
                }
            }
            if (updateProposal.relationsToUpdate) {
                for (const relationUpdate of updateProposal.relationsToUpdate) {
                    const relationExists = currentModel.relations.some(r => r.id === relationUpdate.relationId);
                    if (!relationExists) {
                        errors.push(`Relation not found: ${relationUpdate.relationId}`);
                    }
                }
            }
            if (updateProposal.relationIdsToRemove) {
                for (const relationId of updateProposal.relationIdsToRemove) {
                    const relationExists = currentModel.relations.some(r => r.id === relationId);
                    if (!relationExists) {
                        errors.push(`Relation not found: ${relationId}`);
                    }
                }
            }
            if (updateProposal.relationsToAdd) {
                for (const relation of updateProposal.relationsToAdd) {
                    const sourceConceptExists = currentModel.concepts.some(c => c.id === relation.sourceConceptId) ||
                        (updateProposal.conceptsToAdd && updateProposal.conceptsToAdd.some(c => c.id === relation.sourceConceptId));
                    const targetConceptExists = currentModel.concepts.some(c => c.id === relation.targetConceptId) ||
                        (updateProposal.conceptsToAdd && updateProposal.conceptsToAdd.some(c => c.id === relation.targetConceptId));
                    if (!sourceConceptExists) {
                        errors.push(`Source concept not found for relation: ${relation.sourceConceptId}`);
                    }
                    if (!targetConceptExists) {
                        errors.push(`Target concept not found for relation: ${relation.targetConceptId}`);
                    }
                }
            }
        }
        if (updateProposal.confidenceScore < 0.5) {
            warnings.push('Low confidence score. Consider reviewing this update proposal carefully.');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            timestamp: new Date()
        };
    }
    setUpdateStrategy(strategy) {
        this.updateStrategy = strategy;
    }
    getUpdateStrategy() {
        return this.updateStrategy;
    }
    generateNewVersion(currentVersion) {
        return `${Date.now()}`;
    }
}
exports.ModelUpdateServiceImpl = ModelUpdateServiceImpl;
//# sourceMappingURL=model-update-service-impl.js.map