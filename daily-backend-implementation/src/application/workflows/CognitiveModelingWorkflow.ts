// src/application/workflows/CognitiveModelingWorkflow.ts
import { UserCognitiveModel } from '../../domain/entities/user-cognitive-model';
import { ThoughtFragment } from '../../domain/entities/thought-fragment';
import { CognitiveModelUpdateService } from '../services/CognitiveModelUpdateService';
import { ConceptRelationProcessor } from '../services/ConceptRelationProcessor';
import { ModelConsistencyChecker } from '../services/ModelConsistencyChecker';
import { CognitiveGraphGenerator } from '../services/CognitiveGraphGenerator';

/**
 * 认知建模工作流配置
 */
export interface CognitiveModelingWorkflowConfig {
  updateModel: boolean;
  processRelations: boolean;
  checkConsistency: boolean;
  autoFixConsistency: boolean;
  generateGraph: boolean;
  updateOptions?: any;
  relationProcessorOptions?: any;
  consistencyCheckerOptions?: any;
  graphGeneratorOptions?: any;
}

/**
 * 认知建模工作流结果
 */
export interface CognitiveModelingWorkflowResult {
  model: UserCognitiveModel;
  isConsistent: boolean;
  consistencyIssues: any[];
  graph?: any;
  metadata: {
    processingTime: number;
    updateChanges: any;
    relationProcessingChanges: any;
    consistencyFixes: any;
    graphStats: any;
  };
}

/**
 * 认知建模工作流
 */
export class CognitiveModelingWorkflow {
  private readonly cognitiveModelUpdateService: CognitiveModelUpdateService;
  private readonly conceptRelationProcessor: ConceptRelationProcessor;
  private readonly modelConsistencyChecker: ModelConsistencyChecker;
  private readonly cognitiveGraphGenerator: CognitiveGraphGenerator;

  private readonly defaultConfig: CognitiveModelingWorkflowConfig = {
    updateModel: true,
    processRelations: true,
    checkConsistency: true,
    autoFixConsistency: true,
    generateGraph: true,
  };

  /**
   * 创建认知建模工作流
   */
  constructor() {
    this.cognitiveModelUpdateService = new CognitiveModelUpdateService();
    this.conceptRelationProcessor = new ConceptRelationProcessor();
    this.modelConsistencyChecker = new ModelConsistencyChecker();
    this.cognitiveGraphGenerator = new CognitiveGraphGenerator();
  }

  /**
   * 执行认知建模工作流
   * @param model 认知模型
   * @param thoughtFragment 思维片段
   * @param config 工作流配置
   * @returns 工作流结果
   */
  public async execute(
    model: UserCognitiveModel,
    thoughtFragment: ThoughtFragment,
    config: Partial<CognitiveModelingWorkflowConfig> = {}
  ): Promise<CognitiveModelingWorkflowResult> {
    const startTime = Date.now();
    const workflowConfig = { ...this.defaultConfig, ...config };
    const metadata: CognitiveModelingWorkflowResult['metadata'] = {
      processingTime: 0,
      updateChanges: {},
      relationProcessingChanges: {},
      consistencyFixes: {},
      graphStats: {},
    };

    let updatedModel = model;
    let isConsistent = true;
    let consistencyIssues: any[] = [];
    let graph: any;

    // 1. 更新认知模型
    if (workflowConfig.updateModel) {
      const updateResult = this.cognitiveModelUpdateService.updateCognitiveModel(
        updatedModel,
        thoughtFragment,
        workflowConfig.updateOptions
      );
      updatedModel = updateResult.model;
      metadata.updateChanges = updateResult.changes;
    }

    // 2. 处理概念关系
    if (workflowConfig.processRelations) {
      const relationProcessingResult = this.conceptRelationProcessor.processConceptRelations(
        updatedModel.concepts,
        updatedModel.relations,
        workflowConfig.relationProcessorOptions
      );
      updatedModel.concepts = relationProcessingResult.concepts;
      updatedModel.relations = relationProcessingResult.relations;
      metadata.relationProcessingChanges = relationProcessingResult.metadata;
    }

    // 3. 检查模型一致性
    if (workflowConfig.checkConsistency) {
      const consistencyResult = this.modelConsistencyChecker.checkConsistency(updatedModel);
      isConsistent = consistencyResult.isConsistent;
      consistencyIssues = consistencyResult.issues;

      // 4. 自动修复一致性问题
      if (workflowConfig.autoFixConsistency && !isConsistent) {
        const fixResult = this.modelConsistencyChecker.autoFixConsistencyIssues(
          updatedModel,
          consistencyIssues
        );
        updatedModel = fixResult.model;
        consistencyIssues = fixResult.remainingIssues;
        isConsistent = consistencyIssues.length === 0;
        metadata.consistencyFixes = {
          fixedIssues: fixResult.fixedIssues,
          remainingIssues: fixResult.remainingIssues.length,
        };
      }
    }

    // 5. 生成认知图
    if (workflowConfig.generateGraph) {
      graph = this.cognitiveGraphGenerator.generateCognitiveGraph(
        updatedModel,
        workflowConfig.graphGeneratorOptions
      );
      metadata.graphStats = graph.metadata;
    }

    const endTime = Date.now();
    metadata.processingTime = endTime - startTime;

    return {
      model: updatedModel,
      isConsistent,
      consistencyIssues,
      graph,
      metadata,
    };
  }
}
