// src/application/services/InputMerger.ts
import { UnifiedInput } from '../adapters/InputAdapter';
import crypto from 'crypto';

export class InputMerger {
  /**
   * 合并相关输入
   * @param inputs 输入列表
   * @returns 合并后的输入列表
   */
  public mergeInputs(inputs: UnifiedInput[]): UnifiedInput[] {
    const mergedInputs: UnifiedInput[] = [];
    const processedInputs = new Set<string>();

    for (let i = 0; i < inputs.length; i++) {
      if (processedInputs.has(inputs[i].id)) {
        continue;
      }

      let mergedInput = inputs[i];
      processedInputs.add(inputs[i].id);

      for (let j = i + 1; j < inputs.length; j++) {
        if (processedInputs.has(inputs[j].id)) {
          continue;
        }

        if (this.isInputsRelated(mergedInput, inputs[j])) {
          mergedInput = this.mergeTwoInputs(mergedInput, inputs[j]);
          processedInputs.add(inputs[j].id);
        }
      }

      mergedInputs.push(mergedInput);
    }

    return mergedInputs;
  }

  /**
   * 判断两个输入是否相关
   * @param input1 输入1
   * @param input2 输入2
   * @returns 是否相关
   */
  public isInputsRelated(input1: UnifiedInput, input2: UnifiedInput): boolean {
    // 检查是否来自同一个用户
    if (input1.metadata.userId !== input2.metadata.userId) {
      return false;
    }

    // 检查时间差是否在阈值内（5分钟）
    const timeDiff = Math.abs(input1.createdAt.getTime() - input2.createdAt.getTime());
    if (timeDiff > 5 * 60 * 1000) {
      return false;
    }

    // 检查是否有相同的标签或主题
    if (input1.metadata.tags && input2.metadata.tags) {
      const commonTags = input1.metadata.tags.filter((tag: string) => 
        input2.metadata.tags.includes(tag)
      );
      if (commonTags.length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * 合并两个输入
   * @param input1 输入1
   * @param input2 输入2
   * @returns 合并后的输入
   */
  private mergeTwoInputs(input1: UnifiedInput, input2: UnifiedInput): UnifiedInput {
    return {
      id: crypto.randomUUID(),
      type: 'merged' as const,
      content: `${input1.content}\n\n${input2.content}`,
      metadata: {
        ...input1.metadata,
        ...input2.metadata,
        sources: [input1.source, input2.source],
        originalIds: [input1.id, input2.id],
        mergedAt: new Date()
      },
      source: 'merged_input',
      createdAt: new Date(Math.min(input1.createdAt.getTime(), input2.createdAt.getTime())),
      priority: Math.max(input1.priority || 0, input2.priority || 0)
    };
  }

  /**
   * 创建合并后的任务
   * @param mergedInput 合并后的输入
   * @returns 任务数据
   */
  public createMergedTask(mergedInput: UnifiedInput): any {
    return {
      type: 'COGNITIVE_ANALYSIS',
      input: mergedInput,
      metadata: {
        merged: true,
        originalInputs: mergedInput.metadata.originalIds || [mergedInput.id],
        inputTypes: mergedInput.metadata.sources || [mergedInput.source]
      }
    };
  }
}