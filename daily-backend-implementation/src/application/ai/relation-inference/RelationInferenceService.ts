/**
 * 关系推断服务
 * 用于推断认知概念之间的关系
 */
import { CognitiveConcept } from '../../../domain/entities';
import { CognitiveRelation, CognitiveRelationType } from '../../../domain/entities';
import { LLMClient } from '../../services/llm/LLMClient';
import { SimilaritySearchService } from '../../services/llm/embedding/SimilaritySearchService';

/**
 * 关系推断请求
 */
export interface RelationInferenceRequest {
  /**
   * 源概念
   */
  sourceConcept: CognitiveConcept;
  
  /**
   * 目标概念
   */
  targetConcept: CognitiveConcept;
  
  /**
   * 可选的上下文文本
   */
  context?: string;
}

/**
 * 关系推断结果
 */
export interface RelationInferenceResult {
  /**
   * 推断出的关系类型
   */
  relationType: CognitiveRelationType;
  
  /**
   * 关系的置信度评分（0-1）
   */
  confidenceScore: number;
  
  /**
   * 关系的描述
   */
  description: string;
}

/**
 * 关系推断服务接口
 */
export interface RelationInferenceService {
  /**
   * 推断两个概念之间的关系
   * @param request 关系推断请求
   * @returns 关系推断结果
   */
  inferRelation(request: RelationInferenceRequest): Promise<RelationInferenceResult>;
  
  /**
   * 批量推断多个概念对之间的关系
   * @param requests 关系推断请求数组
   * @returns 关系推断结果数组，每个元素对应一个请求的结果
   */
  batchInferRelations(requests: RelationInferenceRequest[]): Promise<RelationInferenceResult[]>;
  
  /**
   * 为一个概念推断与现有概念图中其他概念的关系
   * @param concept 要推断关系的概念
   * @param existingConcepts 现有概念列表
   * @param context 可选的上下文文本
   * @returns 推断出的关系列表
   */
  inferConceptRelations(concept: CognitiveConcept, existingConcepts: CognitiveConcept[], context?: string): Promise<CognitiveRelation[]>;
}

/**
 * 基于LLM的关系推断服务实现
 */
export class LLMBasedRelationInferenceService implements RelationInferenceService {
  private readonly llmClient: LLMClient;
  private readonly similaritySearchService: SimilaritySearchService;
  
  /**
   * 创建LLMBasedRelationInferenceService实例
   * @param llmClient LLM客户端
   * @param similaritySearchService 相似度搜索服务
   */
  constructor(llmClient: LLMClient, similaritySearchService: SimilaritySearchService) {
    this.llmClient = llmClient;
    this.similaritySearchService = similaritySearchService;
  }
  
  /**
   * 推断两个概念之间的关系
   * @param request 关系推断请求
   * @returns 关系推断结果
   */
  async inferRelation(request: RelationInferenceRequest): Promise<RelationInferenceResult> {
    const { sourceConcept, targetConcept, context } = request;
    
    // 生成关系推断的prompt
    const prompt = this.generateRelationInferencePrompt(sourceConcept, targetConcept, context);
    
    // 使用LLM进行结构化输出
    const result = await this.llmClient.generateStructuredOutput<{
      relationType: CognitiveRelationType;
      confidenceScore: number;
      description: string;
    }>(prompt);
    
    return {
      relationType: result.relationType,
      confidenceScore: result.confidenceScore,
      description: result.description
    };
  }
  
  /**
   * 批量推断多个概念对之间的关系
   * @param requests 关系推断请求数组
   * @returns 关系推断结果数组，每个元素对应一个请求的结果
   */
  async batchInferRelations(requests: RelationInferenceRequest[]): Promise<RelationInferenceResult[]> {
    // 批量处理，并发调用inferRelation方法
    return Promise.all(requests.map(request => this.inferRelation(request)));
  }
  
  /**
   * 为一个概念推断与现有概念图中其他概念的关系
   * @param concept 要推断关系的概念
   * @param existingConcepts 现有概念列表
   * @param context 可选的上下文文本
   * @returns 推断出的关系列表
   */
  async inferConceptRelations(concept: CognitiveConcept, existingConcepts: CognitiveConcept[], context?: string): Promise<CognitiveRelation[]> {
    const relations: CognitiveRelation[] = [];
    
    // 为每个现有概念生成关系推断请求
    const requests: RelationInferenceRequest[] = existingConcepts.map(existingConcept => ({
      sourceConcept: concept,
      targetConcept: existingConcept,
      context
    }));
    
    // 批量推断关系
    const results = await this.batchInferRelations(requests);
    
    // 转换为CognitiveRelation对象
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const targetConcept = existingConcepts[i];
      
      // 只添加置信度足够高的关系
      if (result.confidenceScore > 0.5) {
        // TODO: 实现CognitiveRelation的创建逻辑
        // 需要生成唯一ID，设置创建时间等
      }
    }
    
    return relations;
  }
  
  /**
   * 生成关系推断的prompt
   * @param sourceConcept 源概念
   * @param targetConcept 目标概念
   * @param context 可选的上下文文本
   * @returns 生成的prompt
   */
  private generateRelationInferencePrompt(
    sourceConcept: CognitiveConcept, 
    targetConcept: CognitiveConcept, 
    context?: string
  ): string {
    let prompt = `Analyze the relationship between the following two concepts:\n\n`;
    prompt += `Concept 1: ${sourceConcept.semanticIdentity} - ${sourceConcept.description}\n`;
    prompt += `Concept 2: ${targetConcept.semanticIdentity} - ${targetConcept.description}\n\n`;
    
    if (context) {
      prompt += `Context: ${context}\n\n`;
    }
    
    prompt += `Please identify the relationship type between these two concepts. Choose from the following options:\n`;
    prompt += `${Object.values(CognitiveRelationType).join(', ')}\n\n`;
    prompt += `Also provide a confidence score (0-1) and a brief description of the relationship.\n\n`;
    prompt += `Return your response in JSON format with the following structure:\n`;
    prompt += `{\n`;
    prompt += `  "relationType": "<relation_type>",\n`;
    prompt += `  "confidenceScore": <confidence_score>,\n`;
    prompt += `  "description": "<description>"\n`;
    prompt += `}`;
    
    return prompt;
  }
}
