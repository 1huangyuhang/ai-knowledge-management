"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceOptimizationRepositoryImpl = void 0;
class PerformanceOptimizationRepositoryImpl {
    logger;
    performanceBaselines = new Map();
    optimizationResults = new Map();
    constructor(logger) {
        this.logger = logger;
    }
    async savePerformanceBaseline(baseline) {
        this.logger.info('Saving performance baseline', { baselineId: baseline.id });
        this.performanceBaselines.set(baseline.id, baseline);
        return baseline;
    }
    async getPerformanceBaseline(id) {
        this.logger.info('Getting performance baseline', { baselineId: id });
        return this.performanceBaselines.get(id) || null;
    }
    async getAllPerformanceBaselines(limit, offset) {
        this.logger.info('Getting all performance baselines', { limit, offset });
        return Array.from(this.performanceBaselines.values())
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(offset, offset + limit);
    }
    async getLatestPerformanceBaseline() {
        this.logger.info('Getting latest performance baseline');
        const baselines = Array.from(this.performanceBaselines.values());
        if (baselines.length === 0) {
            return null;
        }
        return baselines.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    }
    async saveOptimizationResult(result) {
        this.logger.info('Saving optimization result', { resultId: result.id });
        this.optimizationResults.set(result.id, result);
        return result;
    }
    async getOptimizationResult(id) {
        this.logger.info('Getting optimization result', { resultId: id });
        return this.optimizationResults.get(id) || null;
    }
    async getAllOptimizationResults(limit, offset) {
        this.logger.info('Getting all optimization results', { limit, offset });
        return Array.from(this.optimizationResults.values())
            .sort((a, b) => {
            const endTimeA = a.endTime?.getTime() || 0;
            const endTimeB = b.endTime?.getTime() || 0;
            return endTimeB - endTimeA;
        })
            .slice(offset, offset + limit);
    }
    async getOptimizationResultsByType(type, limit, offset) {
        this.logger.info('Getting optimization results by type', { type, limit, offset });
        return Array.from(this.optimizationResults.values())
            .filter(result => result.type === type)
            .sort((a, b) => {
            const endTimeA = a.endTime?.getTime() || 0;
            const endTimeB = b.endTime?.getTime() || 0;
            return endTimeB - endTimeA;
        })
            .slice(offset, offset + limit);
    }
    async updateOptimizationStatus(id, status) {
        this.logger.info('Updating optimization status', { resultId: id, status });
        const result = this.optimizationResults.get(id);
        if (!result) {
            return null;
        }
        const updatedResult = {
            ...result,
            status: status,
            endTime: new Date()
        };
        this.optimizationResults.set(id, updatedResult);
        return updatedResult;
    }
    async deleteOptimizationResult(id) {
        this.logger.info('Deleting optimization result', { resultId: id });
        return this.optimizationResults.delete(id);
    }
    async deletePerformanceBaseline(id) {
        this.logger.info('Deleting performance baseline', { baselineId: id });
        return this.performanceBaselines.delete(id);
    }
    async cleanupOldData(days) {
        this.logger.info('Cleaning up old performance data', { days });
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        let deletedCount = 0;
        for (const [id, baseline] of this.performanceBaselines.entries()) {
            if (baseline.createdAt < cutoffDate) {
                this.performanceBaselines.delete(id);
                deletedCount++;
            }
        }
        for (const [id, result] of this.optimizationResults.entries()) {
            const endTime = result.endTime || result.startTime;
            if (endTime < cutoffDate) {
                this.optimizationResults.delete(id);
                deletedCount++;
            }
        }
        this.logger.info('Cleanup completed', { deletedCount });
        return deletedCount;
    }
}
exports.PerformanceOptimizationRepositoryImpl = PerformanceOptimizationRepositoryImpl;
//# sourceMappingURL=PerformanceOptimizationRepositoryImpl.js.map