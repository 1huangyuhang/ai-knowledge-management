# Day 25: 第一阶段 - 系统地基期 - Week 4 - 第25天 代码实现

## 模型输出实现

### 1. 模型摘要生成器

```typescript
// src/application/services/ModelSummaryGenerator.ts
import { UserCognitiveModel } from '../../domain/entities/UserCognitiveModel';
import { CognitiveConcept } from '../../domain/entities/CognitiveConcept';
import { CognitiveRelation } from '../../domain/entities/CognitiveRelation';

/**
 * 模型摘要选项
 */
export interface ModelSummaryOptions {
  includeTopConcepts?: number;
  includeTopRelations?: number;
  includeConfidenceStats?: boolean;
  includeStructureStats?: boolean;
  includeGrowthStats?: boolean;
  summaryLength?: 'short' | 'medium' | 'long';
}

/**
 * 模型摘要统计信息
 */
export interface ModelSummaryStats {
  conceptCount: number;
  relationCount: number;
  averageConceptConfidence: number;
  averageRelationConfidence: number;
  averageRelationStrength: number;
  topConcepts: Array<{
    name: string;
    confidence: number;
    occurrenceCount: number;
    centrality?: number;
  }>;
  topRelations: Array<{
    source: string;
    target: string;
    type: string;
    confidence: number;
    strength: number;
    occurrenceCount: number;
  }>;
  structureDensity: number;
  growthRate?: number;
}

/**
 * 模型摘要
 */
export interface ModelSummary {
  id: string;
  modelId: string;
  title: string;
  summary: string;
  stats: ModelSummaryStats;
  generatedAt: string;
  metadata: {
    generationTime: number;
    options: ModelSummaryOptions;
  };
}

/**
 * 模型摘要生成器
 */
export class ModelSummaryGenerator {
  private readonly defaultOptions: ModelSummaryOptions = {
    includeTopConcepts: 10,
    includeTopRelations: 10,
    includeConfidenceStats: true,
    includeStructureStats: true,
    includeGrowthStats: false,
    summaryLength: 'medium',
  };

  /**
   * 生成模型摘要
   * @param model 认知模型
   * @param options 摘要生成选项
   * @returns 模型摘要
   */
  public generateModelSummary(
    model: UserCognitiveModel,
    options: ModelSummaryOptions = {}
  ): ModelSummary {
    const startTime = Date.now();
    const mergedOptions = { ...this.defaultOptions, ...options };

    // 计算统计信息
    const stats = this.calculateStats(model, mergedOptions);

    // 生成摘要文本
    const summary = this.generateSummaryText(model, stats, mergedOptions);

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    return {
      id: `summary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      modelId: model.id,
      title: `认知模型摘要 - ${new Date().toLocaleDateString()}`,
      summary,
      stats,
      generatedAt: new Date().toISOString(),
      metadata: {
        generationTime,
        options: mergedOptions,
      },
    };
  }

  /**
   * 计算模型统计信息
   * @param model 认知模型
   * @param options 摘要生成选项
   * @returns 统计信息
   */
  private calculateStats(
    model: UserCognitiveModel,
    options: ModelSummaryOptions
  ): ModelSummaryStats {
    // 计算平均置信度
    const averageConceptConfidence = model.concepts.length > 0
      ? model.concepts.reduce((sum, concept) => sum + concept.confidence, 0) / model.concepts.length
      : 0;

    const averageRelationConfidence = model.relations.length > 0
      ? model.relations.reduce((sum, relation) => sum + relation.confidence, 0) / model.relations.length
      : 0;

    const averageRelationStrength = model.relations.length > 0
      ? model.relations.reduce((sum, relation) => sum + relation.strength, 0) / model.relations.length
      : 0;

    // 计算结构密度（简单实现：边数 / 可能的最大边数）
    const maxPossibleEdges = model.concepts.length * (model.concepts.length - 1) / 2;
    const structureDensity = maxPossibleEdges > 0
      ? model.relations.length / maxPossibleEdges
      : 0;

    // 获取顶级概念
    const topConcepts = [...model.concepts]
      .sort((a, b) => {
        // 优先按中心度排序，其次按置信度，最后按出现次数
        const centralityA = a.metadata.centrality || 0;
        const centralityB = b.metadata.centrality || 0;
        if (centralityA !== centralityB) return centralityB - centralityA;
        if (a.confidence !== b.confidence) return b.confidence - a.confidence;
        return b.occurrenceCount - a.occurrenceCount;
      })
      .slice(0, options.includeTopConcepts)
      .map(concept => ({
        name: concept.name,
        confidence: concept.confidence,
        occurrenceCount: concept.occurrenceCount,
        centrality: concept.metadata.centrality,
      }));

    // 获取顶级关系
    const topRelations = [...model.relations]
      .sort((a, b) => {
        // 优先按强度排序，其次按置信度，最后按出现次数
        if (a.strength !== b.strength) return b.strength - a.strength;
        if (a.confidence !== b.confidence) return b.confidence - a.confidence;
        return b.occurrenceCount - a.occurrenceCount;
      })
      .slice(0, options.includeTopRelations)
      .map(relation => {
        const sourceConcept = model.concepts.find(c => c.id === relation.sourceConceptId);
        const targetConcept = model.concepts.find(c => c.id === relation.targetConceptId);
        return {
          source: sourceConcept?.name || relation.sourceConceptId,
          target: targetConcept?.name || relation.targetConceptId,
          type: relation.type,
          confidence: relation.confidence,
          strength: relation.strength,
          occurrenceCount: relation.occurrenceCount,
        };
      });

    return {
      conceptCount: model.concepts.length,
      relationCount: model.relations.length,
      averageConceptConfidence,
      averageRelationConfidence,
      averageRelationStrength,
      topConcepts,
      topRelations,
      structureDensity,
    };
  }

  /**
   * 生成摘要文本
   * @param model 认知模型
   * @param stats 统计信息
   * @param options 摘要生成选项
   * @returns 摘要文本
   */
  private generateSummaryText(
    model: UserCognitiveModel,
    stats: ModelSummaryStats,
    options: ModelSummaryOptions
  ): string {
    let summaryParts: string[] = [];

    // 基本信息
    summaryParts.push(`# 认知模型摘要`);
    summaryParts.push(`
## 基本信息`);
    summaryParts.push(`- 模型ID: ${model.id}`);
    summaryParts.push(`- 创建时间: ${model.createdAt.toLocaleString()}`);
    summaryParts.push(`- 更新时间: ${model.updatedAt.toLocaleString()}`);

    // 概念和关系统计
    summaryParts.push(`
## 结构统计`);
    summaryParts.push(`- 概念数量: ${stats.conceptCount}`);
    summaryParts.push(`- 关系数量: ${stats.relationCount}`);
    summaryParts.push(`- 结构密度: ${(stats.structureDensity * 100).toFixed(2)}%`);

    // 置信度统计
    if (options.includeConfidenceStats) {
      summaryParts.push(`
## 置信度统计`);
      summaryParts.push(`- 平均概念置信度: ${stats.averageConceptConfidence.toFixed(2)}`);
      summaryParts.push(`- 平均关系置信度: ${stats.averageRelationConfidence.toFixed(2)}`);
      summaryParts.push(`- 平均关系强度: ${stats.averageRelationStrength.toFixed(2)}`);
    }

    // 顶级概念
    if (stats.topConcepts.length > 0) {
      summaryParts.push(`
## 核心概念`);
      stats.topConcepts.forEach((concept, index) => {
        const centralityText = concept.centrality ? `, 中心度: ${concept.centrality.toFixed(2)}` : '';
        summaryParts.push(`${index + 1}. ${concept.name} (置信度: ${concept.confidence.toFixed(2)}, 出现次数: ${concept.occurrenceCount}${centralityText})`);
      });
    }

    // 顶级关系
    if (stats.topRelations.length > 0 && options.summaryLength !== 'short') {
      summaryParts.push(`
## 关键关系`);
      stats.topRelations.forEach((relation, index) => {
        summaryParts.push(`${index + 1}. ${relation.source} ↔ ${relation.target} (${relation.type}, 强度: ${relation.strength.toFixed(2)}, 置信度: ${relation.confidence.toFixed(2)})`);
      });
    }

    // 结构分析
    if (options.includeStructureStats && options.summaryLength === 'long') {
      summaryParts.push(`
## 结构分析`);
      if (stats.structureDensity < 0.1) {
        summaryParts.push(`- 模型结构较为稀疏，概念之间的连接较少，建议增加相关概念的关联关系。`);
      } else if (stats.structureDensity > 0.5) {
        summaryParts.push(`- 模型结构较为密集，概念之间的连接丰富，形成了较为完整的认知网络。`);
      } else {
        summaryParts.push(`- 模型结构密度适中，概念之间存在一定的连接关系，建议继续丰富概念之间的关联。`);
      }

      if (stats.averageConceptConfidence < 0.5) {
        summaryParts.push(`- 模型概念的平均置信度较低，建议增加相关概念的出现次数以提高置信度。`);
      } else {
        summaryParts.push(`- 模型概念的平均置信度较高，表明模型对概念的认知较为稳定。`);
      }
    }

    return summaryParts.join('\n');
  }
}
```

### 2. 认知结构可视化服务

```typescript
// src/application/services/CognitiveStructureVisualizationService.ts
import { UserCognitiveModel } from '../../domain/entities/UserCognitiveModel';
import { CognitiveGraphGenerator } from './CognitiveGraphGenerator';
import { CognitiveGraph } from './CognitiveGraphGenerator';

/**
 * 可视化类型
 */
export enum VisualizationType {
  GRAPH = 'graph',
  HIERARCHY = 'hierarchy',
  MATRIX = 'matrix',
  TIMELINE = 'timeline',
}

/**
 * 可视化选项
 */
export interface VisualizationOptions {
  type: VisualizationType;
  includeConcepts?: boolean;
  includeRelations?: boolean;
  includeConfidence?: boolean;
  includeStrength?: boolean;
  includeOccurrenceCount?: boolean;
  nodeSize?: 'small' | 'medium' | 'large';
  edgeThickness?: 'thin' | 'medium' | 'thick';
  colorScheme?: 'default' | 'confidence' | 'strength' | 'occurrence';
  maxNodes?: number;
  maxEdges?: number;
}

/**
 * 可视化结果
 */
export interface VisualizationResult {
  id: string;
  modelId: string;
  type: VisualizationType;
  data: any;
  format: 'json' | 'graphml' | 'svg' | 'png';
  generatedAt: string;
  metadata: {
    generationTime: number;
    nodeCount: number;
    edgeCount: number;
    options: VisualizationOptions;
  };
}

/**
 * 认知结构可视化服务
 */
export class CognitiveStructureVisualizationService {
  private readonly cognitiveGraphGenerator: CognitiveGraphGenerator;

  /**
   * 创建认知结构可视化服务
   */
  constructor() {
    this.cognitiveGraphGenerator = new CognitiveGraphGenerator();
  }

  /**
   * 生成认知结构可视化
   * @param model 认知模型
   * @param options 可视化选项
   * @returns 可视化结果
   */
  public generateVisualization(
    model: UserCognitiveModel,
    options: VisualizationOptions
  ): VisualizationResult {
    const startTime = Date.now();

    let visualizationData: any;
    let format: 'json' | 'graphml' | 'svg' | 'png' = 'json';

    switch (options.type) {
      case VisualizationType.GRAPH:
        // 生成图形可视化
        const graph = this.cognitiveGraphGenerator.generateCognitiveGraph(model, {
          maxNodes: options.maxNodes,
          maxEdges: options.maxEdges,
        });
        visualizationData = graph;
        break;

      case VisualizationType.HIERARCHY:
        // 生成层次结构可视化
        visualizationData = this.generateHierarchyVisualization(model, options);
        break;

      case VisualizationType.MATRIX:
        // 生成矩阵可视化
        visualizationData = this.generateMatrixVisualization(model, options);
        break;

      case VisualizationType.TIMELINE:
        // 生成时间线可视化
        visualizationData = this.generateTimelineVisualization(model, options);
        break;

      default:
        throw new Error(`Unsupported visualization type: ${options.type}`);
    }

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    return {
      id: `viz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      modelId: model.id,
      type: options.type,
      data: visualizationData,
      format,
      generatedAt: new Date().toISOString(),
      metadata: {
        generationTime,
        nodeCount: model.concepts.length,
        edgeCount: model.relations.length,
        options,
      },
    };
  }

  /**
   * 生成层次结构可视化
   * @param model 认知模型
   * @param options 可视化选项
   * @returns 层次结构数据
   */
  private generateHierarchyVisualization(
    model: UserCognitiveModel,
    options: VisualizationOptions
  ): any {
    // 简单的层次结构生成，将概念按中心度排序
    const sortedConcepts = [...model.concepts]
      .sort((a, b) => {
        const centralityA = a.metadata.centrality || 0;
        const centralityB = b.metadata.centrality || 0;
        return centralityB - centralityA;
      })
      .slice(0, options.maxNodes || 50);

    // 构建层次结构
    const hierarchy = {
      id: 'root',
      name: '认知模型',
      children: sortedConcepts.map(concept => ({
        id: concept.id,
        name: concept.name,
        value: concept.confidence,
        occurrenceCount: concept.occurrenceCount,
        centrality: concept.metadata.centrality,
        children: [], // 可以根据需要添加子概念
      })),
    };

    return hierarchy;
  }

  /**
   * 生成矩阵可视化
   * @param model 认知模型
   * @param options 可视化选项
   * @returns 矩阵数据
   */
  private generateMatrixVisualization(
    model: UserCognitiveModel,
    options: VisualizationOptions
  ): any {
    // 简单的矩阵生成
    const concepts = [...model.concepts]
      .sort((a, b) => {
        const centralityA = a.metadata.centrality || 0;
        const centralityB = b.metadata.centrality || 0;
        return centralityB - centralityA;
      })
      .slice(0, options.maxNodes || 20);

    // 创建概念索引映射
    const conceptIndex = new Map<string, number>();
    concepts.forEach((concept, index) => {
      conceptIndex.set(concept.id, index);
    });

    // 初始化矩阵
    const matrix = Array(concepts.length).fill(0).map(() => Array(concepts.length).fill(0));

    // 填充矩阵
    model.relations.forEach(relation => {
      const sourceIndex = conceptIndex.get(relation.sourceConceptId);
      const targetIndex = conceptIndex.get(relation.targetConceptId);
      if (sourceIndex !== undefined && targetIndex !== undefined) {
        matrix[sourceIndex][targetIndex] = relation.strength;
      }
    });

    return {
      concepts: concepts.map(c => c.name),
      matrix,
      metadata: {
        conceptCount: concepts.length,
        relationCount: model.relations.length,
        colorScheme: options.colorScheme,
      },
    };
  }

  /**
   * 生成时间线可视化
   * @param model 认知模型
   * @param options 可视化选项
   * @returns 时间线数据
   */
  private generateTimelineVisualization(
    model: UserCognitiveModel,
    options: VisualizationOptions
  ): any {
    // 简单的时间线生成
    const timelineData = {
      modelCreation: model.createdAt.toISOString(),
      modelUpdate: model.updatedAt.toISOString(),
      conceptTimeline: this.generateConceptTimeline(model, options),
      relationTimeline: this.generateRelationTimeline(model, options),
    };

    return timelineData;
  }

  /**
   * 生成概念时间线
   * @param model 认知模型
   * @param options 可视化选项
   * @returns 概念时间线数据
   */
  private generateConceptTimeline(
    model: UserCognitiveModel,
    options: VisualizationOptions
  ): any {
    // 按创建时间排序概念
    const sortedConcepts = [...model.concepts]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, options.maxNodes || 50);

    return sortedConcepts.map(concept => ({
      id: concept.id,
      name: concept.name,
      createdAt: concept.createdAt.toISOString(),
      lastOccurrence: concept.lastOccurrence.toISOString(),
      confidence: concept.confidence,
      occurrenceCount: concept.occurrenceCount,
    }));
  }

  /**
   * 生成关系时间线
   * @param model 认知模型
   * @param options 可视化选项
   * @returns 关系时间线数据
   */
  private generateRelationTimeline(
    model: UserCognitiveModel,
    options: VisualizationOptions
  ): any {
    // 按创建时间排序关系
    const sortedRelations = [...model.relations]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, options.maxEdges || 50);

    return sortedRelations.map(relation => {
      const sourceConcept = model.concepts.find(c => c.id === relation.sourceConceptId);
      const targetConcept = model.concepts.find(c => c.id === relation.targetConceptId);
      return {
        id: relation.id,
        source: sourceConcept?.name || relation.sourceConceptId,
        target: targetConcept?.name || relation.targetConceptId,
        type: relation.type,
        createdAt: relation.createdAt.toISOString(),
        lastOccurrence: relation.lastOccurrence.toISOString(),
        confidence: relation.confidence,
        strength: relation.strength,
        occurrenceCount: relation.occurrenceCount,
      };
    });
  }
}
```

### 3. 输出格式化服务

```typescript
// src/application/services/OutputFormattingService.ts
import { ModelSummary } from './ModelSummaryGenerator';
import { VisualizationResult } from './CognitiveStructureVisualizationService';
import { UserCognitiveModel } from '../../domain/entities/UserCognitiveModel';

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
```

### 4. 模型导出服务

```typescript
// src/application/services/ModelExportService.ts
import { UserCognitiveModel } from '../../domain/entities/UserCognitiveModel';
import { OutputFormattingService, FormattingOptions, FormattingResult } from './OutputFormattingService';
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

    switch (options.type) {
      case ExportType.MODEL:
        // 导出模型
        const modelFormattingResult = this.outputFormattingService.formatModel(model, {
          format: options.format as any,
          includeMetadata: true,
          includeStats: true,
          includeTimestamp: true,
          ...options.formattingOptions,
        });
        files.push({
          name: `model-${model.id}.${options.format}`,
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
          format: options.format as any,
          includeMetadata: true,
          includeStats: true,
          includeTimestamp: true,
          ...options.formattingOptions,
        });
        files.push({
          name: `model-summary-${model.id}.${options.format}`,
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
            format: options.format as any,
            includeMetadata: true,
            includeStats: true,
            includeTimestamp: true,
            ...options.formattingOptions,
          });
          files.push({
            name: `model-visualization-${model.id}.${options.format}`,
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
          format: options.format as any,
          includeMetadata: true,
          includeStats: true,
          includeTimestamp: true,
          ...options.formattingOptions,
        });
        files.push({
          name: `model-${model.id}.${options.format}`,
          content: allModelFormattingResult.content,
          format: options.format,
          mimeType: allModelFormattingResult.mimeType,
          size: allModelFormattingResult.size,
        });

        // 2. 导出模型摘要
        const allSummary = this.modelSummaryGenerator.generateModelSummary(model, options.summaryOptions);
        const allSummaryFormattingResult = this.outputFormattingService.formatModelSummary(allSummary, {
          format: options.format as any,
          includeMetadata: true,
          includeStats: true,
          includeTimestamp: true,
          ...options.formattingOptions,
        });
        files.push({
          name: `model-summary-${model.id}.${options.format}`,
          content: allSummaryFormattingResult.content,
          format: options.format,
          mimeType: allSummaryFormattingResult.mimeType,
          size: allSummaryFormattingResult.size,
        });

        // 3. 导出可视化结果
        if (options.visualizationOptions) {
          const allVisualization = this.cognitiveStructureVisualizationService.generateVisualization(model, options.visualizationOptions);
          const allVisualizationFormattingResult = this.outputFormattingService.formatVisualization(allVisualization, {
            format: options.format as any,
            includeMetadata: true,
            includeStats: true,
            includeTimestamp: true,
            ...options.formattingOptions,
          });
          files.push({
            name: `model-visualization-${model.id}.${options.format}`,
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
      modelId: model.id,
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
```

### 5. 模型输出工作流

```typescript
// src/application/workflows/ModelOutputWorkflow.ts
import { UserCognitiveModel } from '../../domain/entities/UserCognitiveModel';
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
```
