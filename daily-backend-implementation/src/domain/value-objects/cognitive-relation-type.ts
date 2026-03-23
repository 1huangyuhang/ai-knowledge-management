/**
 * 认知关系类型值对象
 * 封装认知概念之间的关系类型
 */
export class CognitiveRelationType {
  private readonly value: string;

  /**
   * 创建认知关系类型实例
   * @param value 关系类型字符串
   */
  constructor(value: string) {
    if (!this.isValidRelationType(value)) {
      throw new Error('Invalid cognitive relation type');
    }
    this.value = value;
  }

  /**
   * 获取关系类型字符串值
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 验证关系类型是否有效
   * @param type 要验证的关系类型字符串
   * @returns 是否为有效的关系类型
   */
  private isValidRelationType(type: string): boolean {
    const validTypes = [
      'sub_concept',
      'super_concept',
      'associated_with',
      'causes',
      'composed_of',
      'equivalent_to',
      'contrast_with',
      'implements',
      'instance_of',
      'influences'
    ];
    return validTypes.includes(type);
  }

  /**
   * 比较两个认知关系类型是否相等
   * @param other 另一个认知关系类型实例
   * @returns 是否相等
   */
  equals(other: CognitiveRelationType): boolean {
    return this.value === other.getValue();
  }

  /**
   * 获取关系类型的可读名称
   * @returns 可读名称
   */
  getReadableName(): string {
    const nameMap: Record<string, string> = {
      'sub_concept': '子概念',
      'super_concept': '父概念',
      'associated_with': '关联',
      'causes': '导致',
      'composed_of': '组成',
      'equivalent_to': '等价',
      'contrast_with': '对比',
      'implements': '实现',
      'instance_of': '实例',
      'influences': '影响'
    };
    return nameMap[this.value] || this.value;
  }
}