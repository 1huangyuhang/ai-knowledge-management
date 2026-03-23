// WorkflowStep接口
// 定义单个工作流步骤的执行逻辑
import { WorkflowContext } from './workflow-context.interface';

export interface WorkflowStep<TInput, TOutput> {
  /**
   * 执行工作流步骤
   * @param input 步骤输入数据
   * @param context 工作流上下文
   * @returns 步骤输出结果
   */
  execute(input: TInput, context: WorkflowContext): Promise<TOutput>;
  
  /**
   * 获取步骤名称
   * @returns 步骤名称
   */
  getName(): string;
}
