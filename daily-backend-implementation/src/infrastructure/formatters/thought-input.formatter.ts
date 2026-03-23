/**
 * 思想片段输入格式化器
 * 用于格式化思想片段输入数据，确保数据格式统一
 */
import { ThoughtInput } from '../validators/thought-input.validator';

/**
 * 思想片段输入格式化器类
 */
export class ThoughtInputFormatter {
  /**
   * 格式化思想片段输入数据
   * @param input 思想片段输入数据
   * @returns 格式化后的输入数据
   */
  static format(input: ThoughtInput): ThoughtInput {
    // 移除首尾空白字符
    const formattedInput: ThoughtInput = {
      userId: input.userId.trim(),
      content: input.content.trim(),
      source: input.source?.trim() || 'manual'
    };

    // 统一换行符格式
    formattedInput.content = formattedInput.content.replace(/\r\n/g, '\n');

    // 移除多余的空白行
    formattedInput.content = formattedInput.content.replace(/\n{3,}/g, '\n\n');

    return formattedInput;
  }

  /**
   * 提取思想片段的关键词
   * @param content 思想片段内容
   * @returns 关键词列表
   */
  static extractKeywords(content: string): string[] {
    // 简单的关键词提取逻辑，后续可以扩展为更复杂的算法
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could', 'all', 'any', 'some', 'no', 'not', 'only', 'such', 'own', 'same', 'that', 'those', 'this', 'these', 'every', 'each', 'other', 'another', 'more', 'less', 'most', 'least', 'so', 'than', 'too', 'very', 'just', 'enough', 'now', 'then', 'here', 'there', 'when', 'where', 'why', 'how', 'who', 'whom', 'whose', 'which', 'what']);

    const keywords = words
      .filter(word => !stopWords.has(word) && word.length > 2)
      .reduce((acc, word) => {
        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
        if (cleanWord && !acc.includes(cleanWord)) {
          acc.push(cleanWord);
        }
        return acc;
      }, [] as string[]);

    // 返回前10个关键词
    return keywords.slice(0, 10);
  }
}