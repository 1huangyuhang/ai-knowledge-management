"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelOutputWorkflow = void 0;
const ModelSummaryGenerator_1 = require("../services/ModelSummaryGenerator");
const CognitiveStructureVisualizationService_1 = require("../services/CognitiveStructureVisualizationService");
const OutputFormattingService_1 = require("../services/OutputFormattingService");
const ModelExportService_1 = require("../services/ModelExportService");
class ModelOutputWorkflow {
    modelSummaryGenerator;
    cognitiveStructureVisualizationService;
    outputFormattingService;
    modelExportService;
    defaultConfig = {
        generateSummary: true,
        generateVisualization: false,
        formatOutput: true,
        exportOutput: false,
        summaryOptions: {
            summaryLength: 'medium',
        },
        visualizationOptions: {
            type: CognitiveStructureVisualizationService_1.VisualizationType.GRAPH,
        },
        formattingOptions: {
            format: OutputFormattingService_1.OutputFormat.MARKDOWN,
        },
        exportOptions: {
            type: ModelExportService_1.ExportType.MODEL,
            format: 'json',
        },
    };
    constructor() {
        this.modelSummaryGenerator = new ModelSummaryGenerator_1.ModelSummaryGenerator();
        this.cognitiveStructureVisualizationService = new CognitiveStructureVisualizationService_1.CognitiveStructureVisualizationService();
        this.outputFormattingService = new OutputFormattingService_1.OutputFormattingService();
        this.modelExportService = new ModelExportService_1.ModelExportService();
    }
    async execute(model, config = {}) {
        const startTime = Date.now();
        const workflowConfig = { ...this.defaultConfig, ...config };
        const steps = [];
        let summary;
        let visualization;
        let formattedOutput;
        let exportResult;
        if (workflowConfig.generateSummary) {
            const stepStartTime = Date.now();
            try {
                summary = this.modelSummaryGenerator.generateModelSummary(model, workflowConfig.summaryOptions);
                steps.push({
                    name: 'generateSummary',
                    status: 'success',
                    time: Date.now() - stepStartTime,
                });
            }
            catch (error) {
                steps.push({
                    name: 'generateSummary',
                    status: 'failed',
                    time: Date.now() - stepStartTime,
                    error: error.message,
                });
            }
        }
        if (workflowConfig.generateVisualization && workflowConfig.visualizationOptions) {
            const stepStartTime = Date.now();
            try {
                visualization = this.cognitiveStructureVisualizationService.generateVisualization(model, workflowConfig.visualizationOptions);
                steps.push({
                    name: 'generateVisualization',
                    status: 'success',
                    time: Date.now() - stepStartTime,
                });
            }
            catch (error) {
                steps.push({
                    name: 'generateVisualization',
                    status: 'failed',
                    time: Date.now() - stepStartTime,
                    error: error.message,
                });
            }
        }
        if (workflowConfig.formatOutput && workflowConfig.formattingOptions) {
            const stepStartTime = Date.now();
            try {
                if (summary) {
                    formattedOutput = this.outputFormattingService.formatModelSummary(summary, workflowConfig.formattingOptions);
                }
                steps.push({
                    name: 'formatOutput',
                    status: 'success',
                    time: Date.now() - stepStartTime,
                });
            }
            catch (error) {
                steps.push({
                    name: 'formatOutput',
                    status: 'failed',
                    time: Date.now() - stepStartTime,
                    error: error.message,
                });
            }
        }
        if (workflowConfig.exportOutput && workflowConfig.exportOptions) {
            const stepStartTime = Date.now();
            try {
                exportResult = await this.modelExportService.exportModel(model, workflowConfig.exportOptions);
                steps.push({
                    name: 'exportOutput',
                    status: 'success',
                    time: Date.now() - stepStartTime,
                });
            }
            catch (error) {
                steps.push({
                    name: 'exportOutput',
                    status: 'failed',
                    time: Date.now() - stepStartTime,
                    error: error.message,
                });
            }
        }
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        return {
            model,
            summary,
            visualization,
            formattedOutput,
            exportResult,
            metadata: {
                processingTime,
                steps,
            },
        };
    }
}
exports.ModelOutputWorkflow = ModelOutputWorkflow;
//# sourceMappingURL=ModelOutputWorkflow.js.map