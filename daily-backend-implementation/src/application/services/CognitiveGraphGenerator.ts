import { UserCognitiveModel } from '../../domain/entities/cognitive-model';
import { CognitiveConcept } from '../../domain/entities/cognitive-concept';
import { CognitiveRelation, CognitiveRelationType } from '../../domain/entities/cognitive-relation';

/**
 * 认知图节点
 */
export interface CognitiveGraphNode {
  id: string;
  name: string;
  semanticIdentity: string;
  abstractionLevel: number;
  confidence: number;
  occurrenceCount: number;
  centrality?: number;
  metadata: Record<string, any>;
}

/**
 * 认知图边
 */
export interface CognitiveGraphEdge {
  id: string;
  source: string;
  target: string;
  type: CognitiveRelationType;
  confidence: number;
  strength: number;
  occurrenceCount: number;
  metadata: Record<string, any>;
}

/**
 * 认知图
 */
export interface CognitiveGraph {
  id: string;
  modelId: string;
  nodes: CognitiveGraphNode[];
  edges: CognitiveGraphEdge[];
  generatedAt: string;
  metadata: {
    generationTime: number;
    nodeCount: number;
    edgeCount: number;
  };
}

/**
 * 认知图生成选项
 */
export interface CognitiveGraphOptions {
  maxNodes?: number;
  maxEdges?: number;
  includeAllConcepts?: boolean;
  includeAllRelations?: boolean;
  minConfidenceThreshold?: number;
  minStrengthThreshold?: number;
  filterByConceptIds?: string[];
  filterByRelationTypes?: CognitiveRelationType[];
}

/**
 * 认知图生成器
 */
export class CognitiveGraphGenerator {
  private readonly defaultOptions: CognitiveGraphOptions = {
    maxNodes: 100,
    maxEdges: 200,
    includeAllConcepts: false,
    includeAllRelations: false,
    minConfidenceThreshold: 0.3,
    minStrengthThreshold: 0.2,
  };

  /**
   * 生成认知图
   * @param model 认知模型
   * @param options 生成选项
   * @returns 认知图
   */
  public generateCognitiveGraph(
    model: UserCognitiveModel,
    options: CognitiveGraphOptions = {}
  ): CognitiveGraph {
    const startTime = Date.now();
    const mergedOptions = { ...this.defaultOptions, ...options };

    // 从模型中获取概念和关系
    const concepts: CognitiveConcept[] = model.concepts;
    const relations: CognitiveRelation[] = model.relations;

    // 过滤概念
    const filteredConcepts = this.filterConcepts(concepts, mergedOptions);
    const conceptIdsToInclude = new Set(filteredConcepts.map(c => c.id));

    // 过滤关系，只保留连接已过滤概念的关系
    const filteredRelations = this.filterRelations(relations, mergedOptions)
      .filter(relation => 
        conceptIdsToInclude.has(relation.sourceConceptId) && 
        conceptIdsToInclude.has(relation.targetConceptId)
      );

    // 转换为图节点
    const nodes: CognitiveGraphNode[] = filteredConcepts.map(concept => ({
      id: concept.id,
      name: concept.name,
      semanticIdentity: concept.name,
      abstractionLevel: 0, // 暂时使用默认值
      confidence: concept.confidence,
      occurrenceCount: concept.occurrenceCount,
      centrality: concept.metadata.centrality,
      metadata: { ...concept.metadata },
    }));

    // 转换为图边
    const edges: CognitiveGraphEdge[] = filteredRelations.map(relation => ({
      id: relation.id,
      source: relation.sourceConceptId,
      target: relation.targetConceptId,
      type: relation.type,
      confidence: relation.confidence,
      strength: relation.strength,
      occurrenceCount: relation.occurrenceCount,
      metadata: { ...relation.metadata },
    }));

    // 计算节点中心度
    const nodesWithCentrality = this.calculateCentrality(nodes, edges);

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    return {
      id: `graph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      modelId: model.id,
      nodes: nodesWithCentrality,
      edges,
      generatedAt: new Date().toISOString(),
      metadata: {
        generationTime,
        nodeCount: nodesWithCentrality.length,
        edgeCount: edges.length,
      },
    };
  }

  /**
   * 过滤概念
   * @param concepts 原始概念列表
   * @param options 过滤选项
   * @returns 过滤后的概念列表
   */
  private filterConcepts(
    concepts: CognitiveConcept[],
    options: CognitiveGraphOptions
  ): CognitiveConcept[] {
    let filtered = [...concepts];

    // 按置信度阈值过滤
    if (options.minConfidenceThreshold !== undefined) {
      filtered = filtered.filter(concept => 
        concept.confidence >= options.minConfidenceThreshold!
      );
    }

    // 按概念ID过滤
    if (options.filterByConceptIds) {
      filtered = filtered.filter(concept => 
        options.filterByConceptIds!.includes(concept.id)
      );
    }

    // 限制最大节点数
    if (!options.includeAllConcepts && options.maxNodes !== undefined && filtered.length > options.maxNodes) {
      filtered = filtered
        .sort((a, b) => {
          // 按中心度和置信度排序
          const centralityA = a.metadata.centrality || 0;
          const centralityB = b.metadata.centrality || 0;
          if (centralityA !== centralityB) return centralityB - centralityA;
          return b.confidence - a.confidence;
        })
        .slice(0, options.maxNodes);
    }

    return filtered;
  }

  /**
   * 过滤关系
   * @param relations 原始关系列表
   * @param options 过滤选项
   * @returns 过滤后的关系列表
   */
  private filterRelations(
    relations: CognitiveRelation[],
    options: CognitiveGraphOptions
  ): CognitiveRelation[] {
    let filtered = [...relations];

    // 按置信度阈值过滤
    if (options.minConfidenceThreshold !== undefined) {
      filtered = filtered.filter(relation => 
        relation.confidence >= options.minConfidenceThreshold!
      );
    }

    // 按强度阈值过滤
    if (options.minStrengthThreshold !== undefined) {
      filtered = filtered.filter(relation => 
        relation.strength >= options.minStrengthThreshold!
      );
    }

    // 按关系类型过滤
    if (options.filterByRelationTypes) {
      filtered = filtered.filter(relation => 
        options.filterByRelationTypes!.includes(relation.type)
      );
    }

    // 限制最大边数
    if (!options.includeAllRelations && options.maxEdges !== undefined && filtered.length > options.maxEdges) {
      filtered = filtered
        .sort((a, b) => {
          // 按强度和置信度排序
          if (a.strength !== b.strength) return b.strength - a.strength;
          return b.confidence - a.confidence;
        })
        .slice(0, options.maxEdges);
    }

    return filtered;
  }

  /**
   * 计算节点中心度
   * @param nodes 节点列表
   * @param edges 边列表
   * @returns 更新了中心度的节点列表
   */
  private calculateCentrality(
    nodes: CognitiveGraphNode[],
    edges: CognitiveGraphEdge[]
  ): CognitiveGraphNode[] {
    // 简单的度中心度计算
    const degreeMap = new Map<string, number>();

    // 初始化所有节点的度为0
    nodes.forEach(node => degreeMap.set(node.id, 0));

    // 计算每个节点的度
    edges.forEach(edge => {
      degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
      degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
    });

    // 计算最大度
    const maxDegree = Math.max(...Array.from(degreeMap.values()), 1);

    // 更新节点中心度
    return nodes.map(node => ({
      ...node,
      centrality: (degreeMap.get(node.id) || 0) / maxDegree,
    }));
  }
}