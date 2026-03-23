import { v4 as uuidv4 } from 'uuid';
import { ThoughtFragment } from '../domain/entities/thought-fragment';
import { CognitiveConcept } from '../domain/entities/cognitive-concept';

/**
 * 测试数据生成器
 */
export class TestDataGenerator {
  /**
   * 生成思维片段测试数据
   */
  public static generateThoughtFragment(overrides?: Partial<ThoughtFragment>): ThoughtFragment {
    return {
      id: uuidv4(),
      content: '这是一个测试思维片段内容，用于单元测试和集成测试。',
      timestamp: new Date(),
      metadata: {
        source: 'test-source',
        tags: ['test-tag-1', 'test-tag-2'],
      },
      ...overrides,
    };
  }

  /**
   * 生成认知概念测试数据
   */
  public static generateCognitiveConcept(overrides?: Partial<CognitiveConcept>): CognitiveConcept {
    return {
      id: uuidv4(),
      name: '测试概念',
      description: '这是一个测试认知概念的描述。',
      importance: Math.random() * 10,
      relatedConcepts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * 生成多个思维片段
   */
  public static generateThoughtFragments(count: number): ThoughtFragment[] {
    return Array.from({ length: count }, () => this.generateThoughtFragment());
  }

  /**
   * 生成多个认知概念
   */
  public static generateCognitiveConcepts(count: number): CognitiveConcept[] {
    return Array.from({ length: count }, () => this.generateCognitiveConcept());
  }
}