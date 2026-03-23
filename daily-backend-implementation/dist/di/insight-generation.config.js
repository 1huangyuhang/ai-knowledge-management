"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightGenerationKeys = void 0;
exports.initializeInsightGenerationDependencies = initializeInsightGenerationDependencies;
const container_1 = require("./container");
const insight_generation_service_impl_1 = require("../application/ai/cognitive-feedback/insight-generation-service-impl");
async function initializeInsightGenerationDependencies() {
    container_1.container.register('InsightGenerationService', () => {
        const cognitiveModelRepository = container_1.container.resolve('CognitiveModelRepository');
        const evolutionAnalysisService = container_1.container.resolve('EvolutionAnalysisService');
        const cacheService = container_1.container.resolve('CacheService');
        return new insight_generation_service_impl_1.InsightGenerationServiceImpl(cognitiveModelRepository, evolutionAnalysisService, cacheService);
    }, true);
    console.log('Insight generation dependencies initialized and registered in DI container');
}
exports.InsightGenerationKeys = {
    InsightGenerationService: 'InsightGenerationService'
};
//# sourceMappingURL=insight-generation.config.js.map