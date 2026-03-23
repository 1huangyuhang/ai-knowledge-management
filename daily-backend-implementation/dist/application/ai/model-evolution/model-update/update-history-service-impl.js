"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHistoryServiceImpl = void 0;
class UpdateHistoryServiceImpl {
    updateHistoryRepository;
    constructor(updateHistoryRepository) {
        this.updateHistoryRepository = updateHistoryRepository;
    }
    async recordUpdate(updateRecord) {
        try {
            await this.updateHistoryRepository.save(updateRecord);
            return true;
        }
        catch (error) {
            console.error('Failed to record update history:', error);
            return false;
        }
    }
    async getUpdateHistory(userId, options) {
        try {
            const query = {
                userId,
                ...(options?.startTime && { timestamp: { $gte: options.startTime } }),
                ...(options?.endTime && { timestamp: { ...(query?.timestamp || {}), $lte: options.endTime } }),
                ...(options?.updateType && { updateType: options.updateType }),
                ...(options?.source && { source: options.source })
            };
            const pagination = {
                page: options?.page || 1,
                limit: options?.limit || 10
            };
            const result = await this.updateHistoryRepository.find(query, pagination);
            return result;
        }
        catch (error) {
            console.error('Failed to get update history:', error);
            return [];
        }
    }
    async getModelByVersion(userId, versionId) {
        try {
            const updateRecord = await this.updateHistoryRepository.findOne({
                userId,
                $or: [
                    { fromVersion: versionId },
                    { toVersion: versionId }
                ]
            });
            if (!updateRecord) {
                return null;
            }
            return await this.updateHistoryRepository.getModelByVersion(userId, versionId);
        }
        catch (error) {
            console.error('Failed to get model by version:', error);
            return null;
        }
    }
    async cleanupOldHistory(userId, retentionPolicy) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionPolicy.retentionDays);
            const query = {
                userId,
                timestamp: { $lt: cutoffDate }
            };
            if (retentionPolicy.keepLatestVersion) {
                const latestRecord = await this.updateHistoryRepository.findOne({
                    userId
                }, {
                    sort: { timestamp: -1 }
                });
                if (latestRecord) {
                    query.$and = [
                        query.$and || [],
                        {
                            $not: {
                                toVersion: latestRecord.toVersion
                            }
                        }
                    ];
                }
            }
            const result = await this.updateHistoryRepository.deleteMany(query);
            return result.deletedCount || 0;
        }
        catch (error) {
            console.error('Failed to cleanup old history:', error);
            return 0;
        }
    }
}
exports.UpdateHistoryServiceImpl = UpdateHistoryServiceImpl;
//# sourceMappingURL=update-history-service-impl.js.map