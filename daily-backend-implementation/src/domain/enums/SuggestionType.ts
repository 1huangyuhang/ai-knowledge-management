/**
 * 建议类型枚举
 * 定义系统生成的建议类型
 */
export enum SuggestionType {
  /**
   * 概念关联建议
   * 建议用户关联相关概念
   */
  CONCEPT_RELATIONSHIP = 'CONCEPT_RELATIONSHIP',
  
  /**
   * 概念扩展建议
   * 建议用户扩展某个概念
   */
  CONCEPT_EXPANSION = 'CONCEPT_EXPANSION',
  
  /**
   * 模型结构优化建议
   * 建议优化认知模型结构
   */
  MODEL_STRUCTURE_OPTIMIZATION = 'MODEL_STRUCTURE_OPTIMIZATION',
  
  /**
   * 思想深度建议
   * 建议用户深入思考某个主题
   */
  THOUGHT_DEPTH = 'THOUGHT_DEPTH',
  
  /**
   * 认知盲点建议
   * 建议用户关注认知盲点
   */
  COGNITIVE_BLINDSPOT = 'COGNITIVE_BLINDSPOT',
  
  /**
   * 学习路径建议
   * 建议用户的学习路径
   */
  LEARNING_PATH = 'LEARNING_PATH',
  
  /**
   * 模型演化建议
   * 建议模型演化方向
   */
  MODEL_EVOLUTION = 'MODEL_EVOLUTION',
  
  /**
   * 多维分析建议
   * 建议进行多维分析
   */
  MULTIDIMENSIONAL_ANALYSIS = 'MULTIDIMENSIONAL_ANALYSIS'
}