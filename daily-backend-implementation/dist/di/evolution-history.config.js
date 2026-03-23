"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionHistoryKeys = void 0;
exports.initializeEvolutionHistoryDependencies = initializeEvolutionHistoryDependencies;
const container_1 = require("./container");
const evolution_history_service_impl_1 = require("../application/ai/model-evolution/evolution-history/evolution-history-service-impl");
const model_snapshot_service_impl_1 = require("../application/ai/model-evolution/evolution-history/model-snapshot-service-impl");
const version_comparison_service_impl_1 = require("../application/ai/model-evolution/version-comparison-service-impl");
const version_management_service_impl_1 = require("../application/ai/model-evolution/version-management/version-management-service-impl");
const evolution_analysis_service_impl_1 = require("../application/ai/model-evolution/evolution-analysis/evolution-analysis-service-impl");
class MockCompressionService {
    async compress(data) {
        return data;
    }
    async decompress(data) {
        return data;
    }
}
class MockEncryptionService {
    async encrypt(data) {
        return data;
    }
    async decrypt(data) {
        return data;
    }
}
class MockEvolutionEventRepository {
    async save(event) {
        console.log('Saving evolution event:', event.id);
    }
    async find(query) {
        return [];
    }
    async findById(id) {
        return null;
    }
    async findByUserIdAndVersion(userId, version) {
        return [];
    }
    async deleteByTimeRange(startTime, endTime) {
        return 0;
    }
    async deleteByUserId(userId) {
        return 0;
    }
}
class MockSnapshotRepository {
    async save(snapshot) {
        console.log('Saving snapshot:', snapshot.id);
    }
    async find(query) {
        return [];
    }
    async findById(id) {
        return null;
    }
    async findByUserIdAndVersion(userId, version) {
        return null;
    }
    async deleteByTimeRange(startTime, endTime) {
        return 0;
    }
    async deleteByUserId(userId) {
        return 0;
    }
}
class MockVersionRepository {
    async save(version) {
        console.log('Saving version:', version.id);
        return version;
    }
    async find(userId, options) {
        return [];
    }
    async findById(userId, versionId) {
        return null;
    }
    async delete(userId, versionId) {
        return true;
    }
}
class MockMachineLearningService {
    async predict(data) {
        return {};
    }
    async analyze(data) {
        return {};
    }
}
class MockDataAnalysisService {
    async analyze(data) {
        return {};
    }
    async calculateMetrics(data) {
        return {};
    }
}
async function initializeEvolutionHistoryDependencies() {
    container_1.container.register('CompressionService', () => new MockCompressionService(), true);
    container_1.container.register('EncryptionService', () => new MockEncryptionService(), true);
    container_1.container.register('EvolutionEventRepository', () => new MockEvolutionEventRepository(), true);
    container_1.container.register('SnapshotRepository', () => new MockSnapshotRepository(), true);
    container_1.container.register('ModelSnapshotService', () => {
        const snapshotRepository = container_1.container.resolve('SnapshotRepository');
        const compressionService = container_1.container.resolve('CompressionService');
        const encryptionService = container_1.container.resolve('EncryptionService');
        return new model_snapshot_service_impl_1.ModelSnapshotServiceImpl(snapshotRepository, compressionService, encryptionService);
    }, true);
    container_1.container.register('VersionComparisonService', () => {
        const modelSnapshotService = container_1.container.resolve('ModelSnapshotService');
        const evolutionEventRepository = container_1.container.resolve('EvolutionEventRepository');
        return new version_comparison_service_impl_1.VersionComparisonServiceImpl(modelSnapshotService, evolutionEventRepository);
    }, true);
    container_1.container.register('EvolutionHistoryService', () => {
        const evolutionEventRepository = container_1.container.resolve('EvolutionEventRepository');
        const modelSnapshotService = container_1.container.resolve('ModelSnapshotService');
        const versionComparisonService = container_1.container.resolve('VersionComparisonService');
        return new evolution_history_service_impl_1.EvolutionHistoryServiceImpl(evolutionEventRepository, modelSnapshotService, versionComparisonService);
    }, true);
    container_1.container.register('VersionRepository', () => new MockVersionRepository(), true);
    container_1.container.register('VersionManagementService', () => {
        const versionRepository = container_1.container.resolve('VersionRepository');
        const modelSnapshotService = container_1.container.resolve('ModelSnapshotService');
        return new version_management_service_impl_1.VersionManagementServiceImpl(versionRepository, modelSnapshotService);
    }, true);
    container_1.container.register('MachineLearningService', () => new MockMachineLearningService(), true);
    container_1.container.register('DataAnalysisService', () => new MockDataAnalysisService(), true);
    container_1.container.register('EvolutionPatternRecognitionService', () => {
        const machineLearningService = container_1.container.resolve('MachineLearningService');
        return new evolution_analysis_service_impl_1.EvolutionPatternRecognitionServiceImpl(machineLearningService);
    }, true);
    container_1.container.register('EvolutionAnalysisService', () => {
        const evolutionHistoryService = container_1.container.resolve('EvolutionHistoryService');
        const versionManagementService = container_1.container.resolve('VersionManagementService');
        const evolutionPatternService = container_1.container.resolve('EvolutionPatternRecognitionService');
        const dataAnalysisService = container_1.container.resolve('DataAnalysisService');
        return new evolution_analysis_service_impl_1.EvolutionAnalysisServiceImpl(evolutionHistoryService, versionManagementService, evolutionPatternService, dataAnalysisService);
    }, true);
    console.log('Evolution history dependencies initialized and registered in DI container');
}
exports.EvolutionHistoryKeys = {
    CompressionService: 'CompressionService',
    EncryptionService: 'EncryptionService',
    EvolutionEventRepository: 'EvolutionEventRepository',
    SnapshotRepository: 'SnapshotRepository',
    ModelSnapshotService: 'ModelSnapshotService',
    VersionComparisonService: 'VersionComparisonService',
    EvolutionHistoryService: 'EvolutionHistoryService',
    VersionRepository: 'VersionRepository',
    VersionManagementService: 'VersionManagementService',
    MachineLearningService: 'MachineLearningService',
    DataAnalysisService: 'DataAnalysisService',
    EvolutionPatternRecognitionService: 'EvolutionPatternRecognitionService',
    EvolutionAnalysisService: 'EvolutionAnalysisService'
};
//# sourceMappingURL=evolution-history.config.js.map