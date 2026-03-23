// src/application/services/OutputFormattingService.ts
import { ModelSummary } from './ModelSummaryGenerator';
import { VisualizationResult } from './CognitiveStructureVisualizationService';
import { UserCognitiveModel } from '../../domain/entities/cognitive-model';

/**
 * 输出格式
 */
export enum OutputFormat {
  JSON = 'json',
  MARKDOWN = 'markdown',
  HTML = 'html',
  PDF = 'pdf',
  CSV = 'csv',
  GRAPHML = 'graphml',
  SVG = 'svg',
  PNG = 'png',
}

/**
 * 格式化选项
 */
export interface FormattingOptions {
  format: OutputFormat;
  includeMetadata?: boolean;
  includeStats?: boolean;
  includeTimestamp?: boolean;
  indentation?: number;
  colorize?: boolean;
  compact?: boolean;
}

/**
 * 格式化结果
 */
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

/**
 * 输出格式化服务
 */
export class OutputFormattingService {
  /**
   * 获取输出格式的MIME类型
   * @param format 输出格式
   * @returns MIME类型
   */
  private getMimeType(format: OutputFormat): string {
    const mimeTypes: Record<OutputFormat, string> = {
      [OutputFormat.JSON]: 'application/json',
      [OutputFormat.MARKDOWN]: 'text/markdown',
      [OutputFormat.HTML]: 'text/html',
      [OutputFormat.PDF]: 'application/pdf',
      [OutputFormat.CSV]: 'text/csv',
      [OutputFormat.GRAPHML]: 'application/xml',
      [OutputFormat.SVG]: 'image/svg+xml',
      [OutputFormat.PNG]: 'image/png',
    };

    return mimeTypes[format] || 'application/octet-stream';
  }

  /**
   * 格式化模型摘要
   * @param summary 模型摘要
   * @param options 格式化选项
   * @returns 格式化结果
   */
  public formatModelSummary(
    summary: ModelSummary,
    options: FormattingOptions
  ): FormattingResult {
    const startTime = Date.now();
    let content: string | Buffer;

    switch (options.format) {
      case OutputFormat.JSON:
        content = JSON.stringify(summary, null, options.indentation || 2);
        break;
      case OutputFormat.MARKDOWN:
        content = summary.summary;
        break;
      case OutputFormat.HTML:
        content = this.formatSummaryToHtml(summary, options);
        break;
      default:
        throw new Error(`Unsupported format for model summary: ${options.format}`);
    }

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    return {
      id: `format-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      format: options.format,
      mimeType: this.getMimeType(options.format),
      size: typeof content === 'string' ? Buffer.byteLength(content) : content.length,
      generatedAt: new Date().toISOString(),
      metadata: {
        generationTime,
        options,
      },
    };
  }

  /**
   * 将模型摘要格式化为HTML
   * @param summary 模型摘要
   * @param options 格式化选项
   * @returns HTML字符串
   */
  private formatSummaryToHtml(
    summary: ModelSummary,
    options: FormattingOptions
  ): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${summary.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    h1, h2 {
      color: #2c3e50;
      border-bottom: 1px solid #eaecef;
      padding-bottom: 0.3em;
    }
    h1 {
      font-size: 2em;
    }
    h2 {
      font-size: 1.5em;
      margin-top: 1.5em;
    }
    ul {
      list-style-type: disc;
      padding-left: 20px;
    }
    li {
      margin-bottom: 0.5em;
    }
    .stats {
      background-color: #fff;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin: 15px 0;
    }
    .top-concepts, .top-relations {
      background-color: #fff;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin: 15px 0;
    }
    .concept-item, .relation-item {
      padding: 10px;
      margin: 5px 0;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    .timestamp {
      color: #666;
      font-size: 0.9em;
      margin-top: 20px;
      text-align: right;
    }
  </style>
</head>
<body>
  ${summary.summary.replace(/\n# (.*?)/g, '\n<h1>$1</h1>')
    .replace(/\n## (.*?)/g, '\n<h2>$2</h2>')
    .replace(/\n- (.*?)/g, '\n<li>$1</li>')
    .replace(/(\n<li>.*?<\/li>)+/g, '\n<ul>$&\n</ul>')}
  ${options.includeTimestamp ? `<div class="timestamp">生成时间: ${summary.generatedAt}</div>` : ''}
</body>
</html>`;
  }

  /**
   * 格式化可视化结果
   * @param visualization 可视化结果
   * @param options 格式化选项
   * @returns 格式化结果
   */
  public formatVisualization(
    visualization: VisualizationResult,
    options: FormattingOptions
  ): FormattingResult {
    const startTime = Date.now();
    let content: string | Buffer;

    switch (options.format) {
      case OutputFormat.JSON:
        content = JSON.stringify(visualization, null, options.indentation || 2);
        break;
      case OutputFormat.GRAPHML:
        // 这里应该使用更复杂的GraphML生成逻辑
        content = `<graphml xmlns="http://graphml.graphdrawing.org/xmlns"><graph id="G" edgedefault="undirected"></graph></graphml>`;
        break;
      default:
        throw new Error(`Unsupported format for visualization: ${options.format}`);
    }

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    return {
      id: `format-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      format: options.format,
      mimeType: this.getMimeType(options.format),
      size: typeof content === 'string' ? Buffer.byteLength(content) : content.length,
      generatedAt: new Date().toISOString(),
      metadata: {
        generationTime,
        options,
      },
    };
  }

  /**
   * 格式化认知模型
   * @param model 认知模型
   * @param options 格式化选项
   * @returns 格式化结果
   */
  public formatModel(
    model: UserCognitiveModel,
    options: FormattingOptions
  ): FormattingResult {
    const startTime = Date.now();
    let content: string | Buffer;

    switch (options.format) {
      case OutputFormat.JSON:
        content = JSON.stringify({
          id: model.id,
          concepts: model.concepts,
          relations: model.relations,
          createdAt: model.createdAt.toISOString(),
          updatedAt: model.updatedAt.toISOString(),
          metadata: model.metadata,
        }, null, options.indentation || 2);
        break;
      case OutputFormat.CSV:
        content = this.formatModelToCsv(model, options);
        break;
      default:
        throw new Error(`Unsupported format for model: ${options.format}`);
    }

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    return {
      id: `format-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      format: options.format,
      mimeType: this.getMimeType(options.format),
      size: typeof content === 'string' ? Buffer.byteLength(content) : content.length,
      generatedAt: new Date().toISOString(),
      metadata: {
        generationTime,
        options,
      },
    };
  }

  /**
   * 将认知模型格式化为CSV
   * @param model 认知模型
   * @param options 格式化选项
   * @returns CSV字符串
   */
  private formatModelToCsv(
    model: UserCognitiveModel,
    options: FormattingOptions
  ): string {
    let csvContent = '';

    // 添加概念CSV
    csvContent += 'Concepts:\n';
    csvContent += 'ID,Name,Confidence,OccurrenceCount,Centrality,CreatedAt,LastOccurrence\n';
    model.concepts.forEach(concept => {
      csvContent += `${concept.id},"${concept.name}",${concept.confidence},${concept.occurrenceCount},${concept.metadata.centrality || 0},${concept.createdAt.toISOString()},${concept.lastOccurrence.toISOString()}\n`;
    });

    // 添加关系CSV
    csvContent += '\nRelations:\n';
    csvContent += 'ID,Source,Target,Type,Confidence,Strength,OccurrenceCount,CreatedAt,LastOccurrence\n';
    model.relations.forEach(relation => {
      const sourceConcept = model.concepts.find(c => c.id === relation.sourceConceptId);
      const targetConcept = model.concepts.find(c => c.id === relation.targetConceptId);
      csvContent += `${relation.id},"${sourceConcept?.name || relation.sourceConceptId}","${targetConcept?.name || relation.targetConceptId}",${relation.type},${relation.confidence},${relation.strength},${relation.occurrenceCount},${relation.createdAt.toISOString()},${relation.lastOccurrence.toISOString()}\n`;
    });

    return csvContent;
  }
}