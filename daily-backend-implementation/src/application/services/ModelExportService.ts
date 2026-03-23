// src/application/services/ModelExportService.ts
import { UserCognitiveModel } from '../../domain/entities/cognitive-model';
import { OutputFormattingService, FormattingOptions, FormattingResult, OutputFormat } from './OutputFormattingService';
import { ModelSummaryGenerator, ModelSummary, ModelSummaryOptions } from './ModelSummaryGenerator';
import { CognitiveStructureVisualizationService, VisualizationOptions, VisualizationResult } from './CognitiveStructureVisualizationService';

/**
 * 导出类型
 */
export enum ExportType {
  MODEL = 'model',
  SUMMARY = 'summary',
  VISUALIZATION = 'visualization',
  ALL = 'all',
}

/**
 * 导出选项
 */
export interface ExportOptions {
  type: ExportType;
  format: string;
  summaryOptions?: ModelSummaryOptions;
  visualizationOptions?: VisualizationOptions;
  formattingOptions?: FormattingOptions;
  includeAllData?: boolean;
}

/**
 * 导出结果
 */
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

/**
 * 模型导出服务
 */
export class ModelExportService {
  private readonly outputFormattingService: OutputFormattingService;
  private readonly modelSummaryGenerator: ModelSummaryGenerator;
  private readonly cognitiveStructureVisualizationService: CognitiveStructureVisualizationService;

  /**
   * 创建模型导出服务
   */
  constructor() {
    this.outputFormattingService = new OutputFormattingService();
    this.modelSummaryGenerator = new ModelSummaryGenerator();
    this.cognitiveStructureVisualizationService = new CognitiveStructureVisualizationService();
  }

  /**
   * 导出认知模型
   * @param model 认知模型
   * @param options 导出选项
   * @returns 导出结果
   */
  public async exportModel(
    model: UserCognitiveModel,
    options: ExportOptions
  ): Promise<ExportResult> {
    const startTime = Date.now();
    const files: ExportResult['files'] = [];
    const modelId = model.id;

    switch (options.type) {
      case ExportType.MODEL:
        // 导出模型
        const modelFormattingResult = this.outputFormattingService.formatModel(model, {
          format: options.format as OutputFormat,
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
        // 导出模型摘要
        const summary = this.modelSummaryGenerator.generateModelSummary(model, options.summaryOptions);
        const summaryFormattingResult = this.outputFormattingService.formatModelSummary(summary, {
          format: options.format as OutputFormat,
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
        // 导出可视化结果
        if (options.visualizationOptions) {
          const visualization = this.cognitiveStructureVisualizationService.generateVisualization(model, options.visualizationOptions);
          const visualizationFormattingResult = this.outputFormattingService.formatVisualization(visualization, {
            format: options.format as OutputFormat,
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
        // 导出所有内容
        // 1. 导出模型
        const allModelFormattingResult = this.outputFormattingService.formatModel(model, {
          format: options.format as OutputFormat,
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

        // 2. 导出模型摘要
        const allSummary = this.modelSummaryGenerator.generateModelSummary(model, options.summaryOptions);
        const allSummaryFormattingResult = this.outputFormattingService.formatModelSummary(allSummary, {
          format: options.format as OutputFormat,
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

        // 3. 导出可视化结果
        if (options.visualizationOptions) {
          const allVisualization = this.cognitiveStructureVisualizationService.generateVisualization(model, options.visualizationOptions);
          const allVisualizationFormattingResult = this.outputFormattingService.formatVisualization(allVisualization, {
            format: options.format as OutputFormat,
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