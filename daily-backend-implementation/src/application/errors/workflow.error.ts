// WorkflowError类
// 工作流特定的错误类型，包含工作流和步骤的详细信息
export class WorkflowError extends Error {
  private readonly stepName: string;
  private readonly workflowName: string;
  
  /**
   * 创建工作流错误
   * @param message 错误信息
   * @param workflowName 工作流名称
   * @param stepName 步骤名称
   */
  constructor(message: string, workflowName: string, stepName: string) {
    super(message);
    this.name = 'WorkflowError';
    this.workflowName = workflowName;
    this.stepName = stepName;
  }
  
  /**
   * 获取错误的步骤名称
   * @returns 步骤名称
   */
  public getStepName(): string {
    return this.stepName;
  }
  
  /**
   * 获取错误的工作流名称
   * @returns 工作流名称
   */
  public getWorkflowName(): string {
    return this.workflowName;
  }
}
