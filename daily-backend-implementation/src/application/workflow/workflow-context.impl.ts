// WorkflowContextImpl实现类
// 实现WorkflowContext接口，用于存储工作流执行过程中的数据和管理执行状态
import { WorkflowContext } from '../interfaces/workflow/workflow-context.interface';
import { WorkflowStatus } from '../interfaces/workflow/workflow-status.enum';

export class WorkflowContextImpl implements WorkflowContext {
  private readonly data: Map<string, any> = new Map();
  private status: WorkflowStatus = WorkflowStatus.PENDING;
  
  /**
   * 设置上下文数据
   * @param key 键名
   * @param value 键值
   */
  public set<T>(key: string, value: T): void {
    this.data.set(key, value);
  }
  
  /**
   * 获取上下文数据
   * @param key 键名
   * @returns 上下文数据或undefined
   */
  public get<T>(key: string): T | undefined {
    return this.data.get(key) as T;
  }
  
  /**
   * 获取工作流执行状态
   * @returns 执行状态
   */
  public getStatus(): WorkflowStatus {
    return this.status;
  }
  
  /**
   * 设置工作流执行状态
   * @param status 执行状态
   */
  public setStatus(status: WorkflowStatus): void {
    this.status = status;
  }
}
