"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeAnalysisKeys = void 0;
exports.initializeThemeAnalysisDependencies = initializeThemeAnalysisDependencies;
const container_1 = require("./container");
const theme_analysis_service_impl_1 = require("../application/ai/cognitive-feedback/theme-analysis-service-impl");
async function initializeThemeAnalysisDependencies() {
    container_1.container.register('ThemeAnalysisService', () => {
        const cognitiveModelRepository = container_1.container.resolve('CognitiveModelRepository');
        return new theme_analysis_service_impl_1.ThemeAnalysisServiceImpl(cognitiveModelRepository);
    }, true);
    console.log('Theme analysis dependencies initialized and registered in DI container');
}
exports.ThemeAnalysisKeys = {
    ThemeAnalysisService: 'ThemeAnalysisService'
};
//# sourceMappingURL=theme-analysis.config.js.map