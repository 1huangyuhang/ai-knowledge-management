/**
 * 建议类别枚举
 * 定义系统生成的建议类别
 */
export enum SuggestionCategory {
  /**
   * 结构优化类别
   * 与认知模型结构相关的建议
   */
  STRUCTURE_OPTIMIZATION = 'STRUCTURE_OPTIMIZATION',
  
  /**
   * 内容扩展类别
   * 与认知模型内容扩展相关的建议
   */
  CONTENT_EXPANSION = 'CONTENT_EXPANSION',
  
  /**
   * 深度思考类别
   * 与深入思考相关的建议
   */
  DEEP_THINKING = 'DEEP_THINKING',
  
  /**
   * 学习建议类别
   * 与学习路径相关的建议
   */
  LEARNING_SUGGESTION = 'LEARNING_SUGGESTION',
  
  /**
   * 分析建议类别
   * 与数据分析相关的建议
   */
  ANALYSIS_SUGGESTION = 'ANALYSIS_SUGGESTION',
  
  /**
   * 演化建议类别
   * 与认知模型演化相关的建议
   */
  EVOLUTION_SUGGESTION = 'EVOLUTION_SUGGESTION'
}