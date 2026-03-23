import { UserCognitiveModel } from '../../domain/entities/cognitive-model';
import { FormattingOptions } from './OutputFormattingService';
import { ModelSummaryOptions } from './ModelSummaryGenerator';
import { VisualizationOptions } from './CognitiveStructureVisualizationService';
export declare enum ExportType {
    MODEL = "model",
    SUMMARY = "summary",
    VISUALIZATION = "visualization",
    ALL = "all"
}
export interface ExportOptions {
    type: ExportType;
    format: string;
    summaryOptions?: ModelSummaryOptions;
    visualizationOptions?: VisualizationOptions;
    formattingOptions?: FormattingOptions;
    includeAllData?: boolean;
}
export interface ExportResult {
    id: string;
    modelId: string;
    type: ExportType;
    files: Array<{
        name: string;
        content: string | Buffer;
        format: string;
        mimeType: string;
        size: number;
    }>;
    generatedAt: string;
    metadata: {
        exportTime: number;
        options: ExportOptions;
    };
}
export declare class ModelExportService {
    private readonly outputFormattingService;
    private readonly modelSummaryGenerator;
    private readonly cognitiveStructureVisualizationService;
    constructor();
    exportModel(model: UserCognitiveModel, options: ExportOptions): Promise<ExportResult>;
}
//# sourceMappingURL=ModelExportService.d.ts.map