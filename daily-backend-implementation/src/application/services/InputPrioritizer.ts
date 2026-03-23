// src/application/services/InputPrioritizer.ts
import { UnifiedInput } from '../adapters/InputAdapter';

/**
 * 输入优先级分配器
 * 为不同类型的输入分配优先级，用于后续的AI调度
 */
export class InputPrioritizer {
  /**
   * 为输入分配优先级
   * @param input 统一输入格式
   * @returns 带优先级的输入
   */
  public assignPriority(input: UnifiedInput): UnifiedInput {
    const priorityScore = this.calculatePriorityScore(input);
    return {
      ...input,
      priority: priorityScore
    };
  }

  /**
   * 分析输入重要性
   * @param input 统一输入格式
   * @returns 重要性评分 (1-5)
   */
  public analyzeInputImportance(input: UnifiedInput): number {
    // 基于输入类型的基础评分
    let baseScore = 0;

    switch (input.type) {
      case 'file':
        baseScore = 4; // 文件输入通常包含更丰富的信息
        break;
      case 'speech':
        baseScore = 3; // 语音输入次之
        break;
      case 'text':
        baseScore = 2; // 直接文本输入优先级较低
        break;
      default:
        baseScore = 2;
    }

    // 基于内容长度的评分调整
    const contentLength = input.content.length;
    if (contentLength > 1000) {
      baseScore += 1;
    } else if (contentLength < 100) {
      baseScore -= 1;
    }

    // 基于元数据的评分调整
    if (input.metadata?.priority) {
      baseScore = Math.max(baseScore, input.metadata.priority);
    }

    // 确保评分在1-5之间
    return Math.max(1, Math.min(5, baseScore));
  }

  /**
   * 计算优先级分数
   * @param input 统一输入格式
   * @returns 优先级分数 (0-100)
   */
  public calculatePriorityScore(input: UnifiedInput): number {
    // 重要性评分（1-5）
    const importanceScore = this.analyzeInputImportance(input);
    
    // 时间衰减因子
    const timeFactor = this.calculateTimeFactor(input.createdAt);
    
    // 内容复杂度因子
    const complexityFactor = this.calculateComplexityFactor(input);
    
    // 综合计算优先级分数
    const priorityScore = importanceScore * 15 + timeFactor * 35 + complexityFactor * 50;
    
    // 确保分数在0-100之间
    return Math.max(0, Math.min(100, Math.round(priorityScore)));
  }

  /**
   * 计算时间因子
   * @param createdAt 创建时间
   * @returns 时间因子 (0-1)
   */
  private calculateTimeFactor(createdAt: Date): number {
    const now = new Date();
    const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    // 新输入优先级更高，随着时间推移优先级降低
    if (diffInHours < 1) {
      return 1.0; // 1小时内的输入
    } else if (diffInHours < 24) {
      return 0.7; // 1天内的输入
    } else if (diffInHours < 168) {
      return 0.4; // 1周内的输入
    } else {
      return 0.1; // 超过1周的输入
    }
  }

  /**
   * 计算内容复杂度因子
   * @param input 统一输入格式
   * @returns 复杂度因子 (0-1)
   */
  private calculateComplexityFactor(input: UnifiedInput): number {
    const content = input.content;
    const wordCount = content.split(/\s+/).length;
    const uniqueWords = new Set(content.split(/\s+/)).size;
    const sentenceCount = (content.match(/[.!?]+/g) || []).length + 1;
    
    // 计算复杂度分数
    let complexity = 0;
    
    // 基于词数
    if (wordCount > 1000) {
      complexity += 0.4;
    } else if (wordCount > 500) {
      complexity += 0.3;
    } else if (wordCount > 100) {
      complexity += 0.2;
    }
    
    // 基于词汇多样性
    const lexicalDiversity = uniqueWords / wordCount;
    if (lexicalDiversity > 0.8) {
      complexity += 0.3;
    } else if (lexicalDiversity > 0.5) {
      complexity += 0.2;
    } else if (lexicalDiversity > 0.3) {
      complexity += 0.1;
    }
    
    // 基于句子数量
    if (sentenceCount > 50) {
      complexity += 0.3;
    } else if (sentenceCount > 20) {
      complexity += 0.2;
    } else if (sentenceCount > 5) {
      complexity += 0.1;
    }
    
    // 确保复杂度因子在0-1之间
    return Math.min(1.0, complexity);
  }
}
