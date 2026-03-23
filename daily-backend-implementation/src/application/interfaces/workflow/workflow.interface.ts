// Workflow接口
// 定义工作流的基本操作，负责协调多个工作流步骤的执行
import { WorkflowStep } from './workflow-step.interface';

export interface Workflow<TInput, TOutput> {
  /**
   * 执行工作流
   * @param input 工作流输入数据
   * @returns 工作流输出结果
   */
  execute(input: TInput): Promise<TOutput>;
  
  /**
   * 获取工作流名称
   * @returns 工作流名称
   */
  getName(): string;
  
  /**
   * 添加工作流步骤
   * @param step 工作流步骤
   */
  addStep(step: WorkflowStep<any, any>): void;
}
