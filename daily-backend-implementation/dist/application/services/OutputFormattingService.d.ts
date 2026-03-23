import { ModelSummary } from './ModelSummaryGenerator';
import { VisualizationResult } from './CognitiveStructureVisualizationService';
import { UserCognitiveModel } from '../../domain/entities/cognitive-model';
export declare enum OutputFormat {
    JSON = "json",
    MARKDOWN = "markdown",
    HTML = "html",
    PDF = "pdf",
    CSV = "csv",
    GRAPHML = "graphml",
    SVG = "svg",
    PNG = "png"
}
export interface FormattingOptions {
    format: OutputFormat;
    includeMetadata?: boolean;
    includeStats?: boolean;
    includeTimestamp?: boolean;
    indentation?: number;
    colorize?: boolean;
    compact?: boolean;
}
export interface FormattingResult {
    id: string;
    content: string | Buffer;
    format: OutputFormat;
    mimeType: string;
    size: number;
    generatedAt: string;
    metadata: {
        generationTime: number;
        options: FormattingOptions;
    };
}
export declare class OutputFormattingService {
    private getMimeType;
    formatModelSummary(summary: ModelSummary, options: FormattingOptions): FormattingResult;
    private formatSummaryToHtml;
    formatVisualization(visualization: VisualizationResult, options: FormattingOptions): FormattingResult;
    formatModel(model: UserCognitiveModel, options: FormattingOptions): FormattingResult;
    private formatModelToCsv;
}
//# sourceMappingURL=OutputFormattingService.d.ts.map