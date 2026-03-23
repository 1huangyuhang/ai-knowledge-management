// src/application/services/CognitiveStructureVisualizationService.ts
import { UserCognitiveModel } from '../../domain/entities/cognitive-model';
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