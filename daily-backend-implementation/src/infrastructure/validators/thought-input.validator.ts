/**
 * 思想片段输入验证器
 * 用于验证思想片段输入数据的合法性
 */
import { CognitiveError } from '../../domain/errors/cognitive-error';

/**
 * 思想片段输入数据接口
 */
export interface ThoughtInput {
  userId: string;
  content: string;
  source?: string;
}

/**
 * 思想片段输入验证器类
 */
export class ThoughtInputValidator {
  /**
   * 验证思想片段输入数据
   * @param input 思想片段输入数据
   * @returns 验证后的输入数据
   * @throws {CognitiveError} 如果输入数据不合法
   */
  static validate(input: ThoughtInput): ThoughtInput {
    // 验证用户ID
    if (!input.userId) {
      throw new CognitiveError('User ID is required', 'INVALID_INPUT');
    }

    // 验证内容
    if (!input.content || input.content.trim().length === 0) {
      throw CognitiveError.emptyThoughtContent();
    }

    // 验证内容长度
    if (input.content.length > 10000) {
      throw new CognitiveError('Content length cannot exceed 10000 characters', 'INVALID_INPUT');
    }

    // 验证来源
    if (input.source && input.source.length > 100) {
      throw new CognitiveError('Source length cannot exceed 100 characters', 'INVALID_INPUT');
    }

    return {
      userId: input.userId.trim(),
      content: input.content.trim(),
      source: input.source?.trim() || 'manual'
    };
  }
}