"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelExportService = exports.ExportType = void 0;
const OutputFormattingService_1 = require("./OutputFormattingService");
const ModelSummaryGenerator_1 = require("./ModelSummaryGenerator");
const CognitiveStructureVisualizationService_1 = require("./CognitiveStructureVisualizationService");
var ExportType;
(function (ExportType) {
    ExportType["MODEL"] = "model";
    ExportType["SUMMARY"] = "summary";
    ExportType["VISUALIZATION"] = "visualization";
    ExportType["ALL"] = "all";
})(ExportType || (exports.ExportType = ExportType = {}));
class ModelExportService {
    outputFormattingService;
    modelSummaryGenerator;
    cognitiveStructureVisualizationService;
    constructor() {
        this.outputFormattingService = new OutputFormattingService_1.OutputFormattingService();
        this.modelSummaryGenerator = new ModelSummaryGenerator_1.ModelSummaryGenerator();
        this.cognitiveStructureVisualizationService = new CognitiveStructureVisualizationService_1.CognitiveStructureVisualizationService();
    }
    async exportModel(model, options) {
        const startTime = Date.now();
        const files = [];
        const modelId = model.id;
        switch (options.type) {
            case ExportType.MODEL:
                const modelFormattingResult = this.outputFormattingService.formatModel(model, {
                    format: options.format,
                    includeMetadata: true,
                    includeStats: true,
                    includeTimestamp: true,
                    ...options.formattingOptions,
                });
                files.push({
                    name: `model-${modelId}.${options.format}`,
                    content: modelFormattingResult.content,
                    format: options.format,
                    mimeType: modelFormattingResult.mimeType,
                    size: modelFormattingResult.size,
                });
                break;
            case ExportType.SUMMARY:
                const summary = this.modelSummaryGenerator.generateModelSummary(model, options.summaryOptions);
                const summaryFormattingResult = this.outputFormattingService.formatModelSummary(summary, {
                    format: options.format,
                    includeMetadata: true,
                    includeStats: true,
                    includeTimestamp: true,
                    ...options.formattingOptions,
                });
                files.push({
                    name: `model-summary-${modelId}.${options.format}`,
                    content: summaryFormattingResult.content,
                    format: options.format,
                    mimeType: summaryFormattingResult.mimeType,
                    size: summaryFormattingResult.size,
                });
                break;
            case ExportType.VISUALIZATION:
                if (options.visualizationOptions) {
                    const visualization = this.cognitiveStructureVisualizationService.generateVisualization(model, options.visualizationOptions);
                    const visualizationFormattingResult = this.outputFormattingService.formatVisualization(visualization, {
                        format: options.format,
                        includeMetadata: true,
                        includeStats: true,
                        includeTimestamp: true,
                        ...options.formattingOptions,
                    });
                    files.push({
                        name: `model-visualization-${modelId}.${options.format}`,
                        content: visualizationFormattingResult.content,
                        format: options.format,
                        mimeType: visualizationFormattingResult.mimeType,
                        size: visualizationFormattingResult.size,
                    });
                }
                break;
            case ExportType.ALL:
                const allModelFormattingResult = this.outputFormattingService.formatModel(model, {
                    format: options.format,
                    includeMetadata: true,
                    includeStats: true,
                    includeTimestamp: true,
                    ...options.formattingOptions,
                });
                files.push({
                    name: `model-${modelId}.${options.format}`,
                    content: allModelFormattingResult.content,
                    format: options.format,
                    mimeType: allModelFormattingResult.mimeType,
                    size: allModelFormattingResult.size,
                });
                const allSummary = this.modelSummaryGenerator.generateModelSummary(model, options.summaryOptions);
                const allSummaryFormattingResult = this.outputFormattingService.formatModelSummary(allSummary, {
                    format: options.format,
                    includeMetadata: true,
                    includeStats: true,
                    includeTimestamp: true,
                    ...options.formattingOptions,
                });
                files.push({
                    name: `model-summary-${modelId}.${options.format}`,
                    content: allSummaryFormattingResult.content,
                    format: options.format,
                    mimeType: allSummaryFormattingResult.mimeType,
                    size: allSummaryFormattingResult.size,
                });
                if (options.visualizationOptions) {
                    const allVisualization = this.cognitiveStructureVisualizationService.generateVisualization(model, options.visualizationOptions);
                    const allVisualizationFormattingResult = this.outputFormattingService.formatVisualization(allVisualization, {
                        format: options.format,
                        includeMetadata: true,
                        includeStats: true,
                        includeTimestamp: true,
                        ...options.formattingOptions,
                    });
                    files.push({
                        name: `model-visualization-${modelId}.${options.format}`,
                        content: allVisualizationFormattingResult.content,
                        format: options.format,
                        mimeType: allVisualizationFormattingResult.mimeType,
                        size: allVisualizationFormattingResult.size,
                    });
                }
                break;
        }
        const endTime = Date.now();
        const exportTime = endTime - startTime;
        return {
            id: `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            modelId: modelId,
            type: options.type,
            files,
            generatedAt: new Date().toISOString(),
            metadata: {
                exportTime,
                options,
            },
        };
    }
}
exports.ModelExportService = ModelExportService;
//# sourceMappingURL=ModelExportService.js.map