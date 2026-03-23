"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHistoryServiceImpl = void 0;
const model_update_types_1 = require("./types/model-update.types");
class UpdateHistoryServiceImpl {
    cognitiveModelRepository;
    modelSnapshotService;
    constructor(cognitiveModelRepository, modelSnapshotService) {
        this.cognitiveModelRepository = cognitiveModelRepository;
        this.modelSnapshotService = modelSnapshotService;
    }
    async recordUpdate(updateRecord) {
        try {
            const currentModel = await this.cognitiveModelRepository.getById(updateRecord.userId);
            if (!currentModel) {
                throw new Error(`Cognitive model not found for user: ${updateRecord.userId}`);
            }
            await this.modelSnapshotService.createSnapshot(updateRecord.userId, currentModel, updateRecord.toVersion);
            return true;
        }
        catch (error) {
            console.error('Failed to record update history:', error);
            return false;
        }
    }
    async getUpdateHistory(userId, options) {
        try {
            return [];
        }
        catch (error) {
            console.error('Failed to get update history:', error);
            return [];
        }
    }
    async getModelByVersion(userId, versionId) {
        try {
            const snapshot = await this.modelSnapshotService.getSnapshot(userId, versionId);
            if (!snapshot) {
                return null;
            }
            return snapshot.model;
        }
        catch (error) {
            console.error('Failed to get model by version:', error);
            return null;
        }
    }
    async cleanupOldHistory(userId, retentionPolicy) {
        try {
            const cleanupDate = new Date();
            cleanupDate.setDate(cleanupDate.getDate() - retentionPolicy.retentionDays);
            const snapshots = await this.modelSnapshotService.getSnapshots(userId);
            let cleanedCount = 0;
            for (const snapshot of snapshots) {
                if (retentionPolicy.keepLatestVersion && snapshot.isLatest) {
                    continue;
                }
                if (retentionPolicy.keepCriticalUpdates && this.isCriticalUpdate(snapshot)) {
                    continue;
                }
                if (snapshot.createdAt < cleanupDate) {
                    await this.modelSnapshotService.deleteSnapshot(userId, snapshot.id);
                    cleanedCount++;
                }
            }
            return cleanedCount;
        }
        catch (error) {
            console.error('Failed to cleanup old history:', error);
            return 0;
        }
    }
    isCriticalUpdate(snapshot) {
        return snapshot.updateType === model_update_types_1.ModelUpdateType.FULL ||
            snapshot.updateType === model_update_types_1.ModelUpdateType.RESTRUCTURE;
    }
}
exports.UpdateHistoryServiceImpl = UpdateHistoryServiceImpl;
//# sourceMappingURL=update-history-service-impl.js.map