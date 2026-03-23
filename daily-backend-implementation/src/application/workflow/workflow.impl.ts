// WorkflowImpl实现类
// 实现Workflow接口，负责协调多个工作流步骤的执行
import { Workflow, WorkflowStep } from '../interfaces/workflow/workflow.interface';
import { WorkflowContext } from '../interfaces/workflow/workflow-context.interface';
import { WorkflowContextImpl } from './workflow-context.impl';
import { WorkflowStatus } from '../interfaces/workflow/workflow-status.enum';
import { WorkflowError } from '../errors/workflow.error';

export class WorkflowImpl<TInput, TOutput> implements Workflow<TInput, TOutput> {
  private readonly steps: WorkflowStep<any, any>[] = [];
  private readonly name: string;
  
  /**
   * 创建工作流实例
   * @param name 工作流名称
   */
  constructor(name: string) {
    this.name = name;
  }
  
  /**
   * 执行工作流
   * @param input 工作流输入数据
   * @returns 工作流输出结果
   */
  public async execute(input: TInput): Promise<TOutput> {
    const context = new WorkflowContextImpl();
    context.setStatus(WorkflowStatus.RUNNING);
    
    try {
      let result: any = input;
      
      // 依次执行每个步骤
      for (const step of this.steps) {
        try {
          result = await step.execute(result, context);
        } catch (error) {
          const stepName = step.getName();
          throw new WorkflowError(
            `Step execution failed: ${error instanceof Error ? error.message : String(error)}`,
            this.name,
            stepName
          );
        }
      }
      
      context.setStatus(WorkflowStatus.COMPLETED);
      return result as TOutput;
    } catch (error) {
      context.setStatus(WorkflowStatus.FAILED);
      throw error;
    }
  }
  
  /**
   * 获取工作流名称
   * @returns 工作流名称
   */
  public getName(): string {
    return this.name;
  }
  
  /**
   * 添加工作流步骤
   * @param step 工作流步骤
   */
  public addStep(step: WorkflowStep<any, any>): void {
    this.steps.push(step);
  }
}
