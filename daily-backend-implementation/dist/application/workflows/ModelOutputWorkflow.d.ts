import { UserCognitiveModel } from '../../domain/entities/cognitive-model';
import { ModelSummary, ModelSummaryOptions } from '../services/ModelSummaryGenerator';
import { VisualizationResult, VisualizationOptions } from '../services/CognitiveStructureVisualizationService';
import { FormattingResult, FormattingOptions } from '../services/OutputFormattingService';
import { ExportResult, ExportOptions } from '../services/ModelExportService';
export interface ModelOutputWorkflowConfig {
    generateSummary?: boolean;
    generateVisualization?: boolean;
    formatOutput?: boolean;
    exportOutput?: boolean;
    summaryOptions?: ModelSummaryOptions;
    visualizationOptions?: VisualizationOptions;
    formattingOptions?: FormattingOptions;
    exportOptions?: ExportOptions;
}
export interface ModelOutputWorkflowResult {
    model: UserCognitiveModel;
    summary?: ModelSummary;
    visualization?: VisualizationResult;
    formattedOutput?: FormattingResult;
    exportResult?: ExportResult;
    metadata: {
        processingTime: number;
        steps: Array<{
            name: string;
            status: 'success' | 'failed';
            time: number;
            error?: string;
        }>;
    };
}
export declare class ModelOutputWorkflow {
    private readonly modelSummaryGenerator;
    private readonly cognitiveStructureVisualizationService;
    private readonly outputFormattingService;
    private readonly modelExportService;
    private readonly defaultConfig;
    constructor();
    execute(model: UserCognitiveModel, config?: Partial<ModelOutputWorkflowConfig>): Promise<ModelOutputWorkflowResult>;
}
//# sourceMappingURL=ModelOutputWorkflow.d.ts.map