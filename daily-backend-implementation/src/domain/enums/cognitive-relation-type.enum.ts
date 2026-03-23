/**
 * 认知关系类型枚举
 * 定义认知概念之间的关系类型
 */
export enum CognitiveRelationType {
  /** 子概念关系 */
  SUB_CONCEPT = 'sub_concept',
  /** 父概念关系 */
  SUPER_CONCEPT = 'super_concept',
  /** 关联关系 */
  ASSOCIATED_WITH = 'associated_with',
  /** 因果关系 */
  CAUSES = 'causes',
  /** 组成关系 */
  COMPOSED_OF = 'composed_of',
  /** 等价关系 */
  EQUIVALENT_TO = 'equivalent_to',
  /** 对比关系 */
  CONTRAST_WITH = 'contrast_with',
  /** 实现关系 */
  IMPLEMENTS = 'implements',
  /** 实例关系 */
  INSTANCE_OF = 'instance_of',
  /** 影响关系 */
  INFLUENCES = 'influences'
}