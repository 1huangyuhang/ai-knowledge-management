// src/application/workflows/ModelOutputWorkflow.ts
import { UserCognitiveModel } from '../../domain/entities/cognitive-model';
import { ModelSummaryGenerator, ModelSummary, ModelSummaryOptions } from '../services/ModelSummaryGenerator';
import { CognitiveStructureVisualizationService, VisualizationResult, VisualizationOptions, VisualizationType } from '../services/CognitiveStructureVisualizationService';
import { OutputFormattingService, FormattingResult, FormattingOptions, OutputFormat } from '../services/OutputFormattingService';
import { ModelExportService, ExportResult, ExportOptions, ExportType } from '../services/ModelExportService';

/**
 * 模型输出工作流配置
 */
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

/**
 * 模型输出工作流结果
 */
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

/**
 * 模型输出工作流
 */
export class ModelOutputWorkflow {
  private readonly modelSummaryGenerator: ModelSummaryGenerator;
  private readonly cognitiveStructureVisualizationService: CognitiveStructureVisualizationService;
  private readonly outputFormattingService: OutputFormattingService;
  private readonly modelExportService: ModelExportService;

  private readonly defaultConfig: ModelOutputWorkflowConfig = {
    generateSummary: true,
    generateVisualization: false,
    formatOutput: true,
    exportOutput: false,
    summaryOptions: {
      summaryLength: 'medium',
    },
    visualizationOptions: {
      type: VisualizationType.GRAPH,
    },
    formattingOptions: {
      format: OutputFormat.MARKDOWN,
    },
    exportOptions: {
      type: ExportType.MODEL,
      format: 'json',
    },
  };

  /**
   * 创建模型输出工作流
   */
  constructor() {
    this.modelSummaryGenerator = new ModelSummaryGenerator();
    this.cognitiveStructureVisualizationService = new CognitiveStructureVisualizationService();
    this.outputFormattingService = new OutputFormattingService();
    this.modelExportService = new ModelExportService();
  }

  /**
   * 执行模型输出工作流
   * @param model 认知模型
   * @param config 工作流配置
   * @returns 工作流结果
   */
  public async execute(
    model: UserCognitiveModel,
    config: Partial<ModelOutputWorkflowConfig> = {}
  ): Promise<ModelOutputWorkflowResult> {
    const startTime = Date.now();
    const workflowConfig = { ...this.defaultConfig, ...config };
    const steps: Array<{
      name: string;
      status: 'success' | 'failed';
      time: number;
      error?: string;
    }> = [];

    let summary: ModelSummary | undefined;
    let visualization: VisualizationResult | undefined;
    let formattedOutput: FormattingResult | undefined;
    let exportResult: ExportResult | undefined;

    // 1. 生成模型摘要
    if (workflowConfig.generateSummary) {
      const stepStartTime = Date.now();
      try {
        summary = this.modelSummaryGenerator.generateModelSummary(model, workflowConfig.summaryOptions);
        steps.push({
          name: 'generateSummary',
          status: 'success',
          time: Date.now() - stepStartTime,
        });
      } catch (error: any) {
        steps.push({
          name: 'generateSummary',
          status: 'failed',
          time: Date.now() - stepStartTime,
          error: error.message,
        });
      }
    }

    // 2. 生成可视化结果
    if (workflowConfig.generateVisualization && workflowConfig.visualizationOptions) {
      const stepStartTime = Date.now();
      try {
        visualization = this.cognitiveStructureVisualizationService.generateVisualization(
          model,
          workflowConfig.visualizationOptions
        );
        steps.push({
          name: 'generateVisualization',
          status: 'success',
          time: Date.now() - stepStartTime,
        });
      } catch (error: any) {
        steps.push({
          name: 'generateVisualization',
          status: 'failed',
          time: Date.now() - stepStartTime,
          error: error.message,
        });
      }
    }

    // 3. 格式化输出
    if (workflowConfig.formatOutput && workflowConfig.formattingOptions) {
      const stepStartTime = Date.now();
      try {
        if (summary) {
          formattedOutput = this.outputFormattingService.formatModelSummary(
            summary,
            workflowConfig.formattingOptions
          );
        }
        steps.push({
          name: 'formatOutput',
          status: 'success',
          time: Date.now() - stepStartTime,
        });
      } catch (error: any) {
        steps.push({
          name: 'formatOutput',
          status: 'failed',
          time: Date.now() - stepStartTime,
          error: error.message,
        });
      }
    }

    // 4. 导出输出
    if (workflowConfig.exportOutput && workflowConfig.exportOptions) {
      const stepStartTime = Date.now();
      try {
        exportResult = await this.modelExportService.exportModel(model, workflowConfig.exportOptions);
        steps.push({
          name: 'exportOutput',
          status: 'success',
          time: Date.now() - stepStartTime,
        });
      } catch (error: any) {
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