"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelUpdateServiceImpl = void 0;
const uuid_1 = require("uuid");
const incremental_update_strategy_1 = require("./strategies/incremental-update-strategy");
const model_consistency_validator_1 = require("./model-consistency-validator");
class ModelUpdateServiceImpl {
    updateStrategy;
    cognitiveModelRepository;
    updateHistoryService;
    consistencyValidator;
    constructor(cognitiveModelRepository, updateHistoryService) {
        this.cognitiveModelRepository = cognitiveModelRepository;
        this.updateHistoryService = updateHistoryService;
        this.consistencyValidator = new model_consistency_validator_1.ModelConsistencyValidatorImpl();
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
            updatedModel.updatedAt = new Date();
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
                newVersion: updateProposal.currentVersion || 'unknown',
                oldVersion: updateProposal.currentVersion || 'unknown',
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
        for (const updateProposal of updateProposals) {
            const result = await this.applyUpdate(updateProposal);
            results.push(result);
        }
        const successfulUpdates = results.filter(r => r.success).length;
        const failedUpdates = results.filter(r => !r.success).length;
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
        if (!updateProposal.id) {
            errors.push('Update proposal missing required field: id');
        }
        if (!updateProposal.userId) {
            errors.push('Update proposal missing required field: userId');
        }
        if (!updateProposal.updateType) {
            errors.push('Update proposal missing required field: updateType');
        }
        if (updateProposal.confidenceScore === undefined || updateProposal.confidenceScore === null) {
            errors.push('Update proposal missing required field: confidenceScore');
        }
        else if (typeof updateProposal.confidenceScore !== 'number' || updateProposal.confidenceScore < 0 || updateProposal.confidenceScore > 1) {
            errors.push('Update proposal confidenceScore must be a number between 0 and 1');
        }
        if (!updateProposal.source) {
            errors.push('Update proposal missing required field: source');
        }
        if (!updateProposal.timestamp) {
            errors.push('Update proposal missing required field: timestamp');
        }
        if (updateProposal.conceptsToAdd && !Array.isArray(updateProposal.conceptsToAdd)) {
            errors.push('Update proposal conceptsToAdd must be an array');
        }
        if (updateProposal.conceptsToUpdate && !Array.isArray(updateProposal.conceptsToUpdate)) {
            errors.push('Update proposal conceptsToUpdate must be an array');
        }
        if (updateProposal.conceptIdsToRemove && !Array.isArray(updateProposal.conceptIdsToRemove)) {
            errors.push('Update proposal conceptIdsToRemove must be an array');
        }
        if (updateProposal.relationsToAdd && !Array.isArray(updateProposal.relationsToAdd)) {
            errors.push('Update proposal relationsToAdd must be an array');
        }
        if (updateProposal.relationsToUpdate && !Array.isArray(updateProposal.relationsToUpdate)) {
            errors.push('Update proposal relationsToUpdate must be an array');
        }
        if (updateProposal.relationIdsToRemove && !Array.isArray(updateProposal.relationIdsToRemove)) {
            errors.push('Update proposal relationIdsToRemove must be an array');
        }
        if (updateProposal.relatedThoughtIds && !Array.isArray(updateProposal.relatedThoughtIds)) {
            errors.push('Update proposal relatedThoughtIds must be an array');
        }
        return {
            isValid: errors.length === 0,
            errors,
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
        return `v${Date.now()}`;
    }
}
exports.ModelUpdateServiceImpl = ModelUpdateServiceImpl;
//# sourceMappingURL=model-update-service-impl.js.map