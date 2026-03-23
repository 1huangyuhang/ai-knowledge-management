// WorkflowContext接口
// 用于存储工作流执行过程中的数据和管理执行状态
import { WorkflowStatus } from './workflow-status.enum';

export interface WorkflowContext {
  /**
   * 设置上下文数据
   * @param key 键名
   * @param value 键值
   */
  set<T>(key: string, value: T): void;
  
  /**
   * 获取上下文数据
   * @param key 键名
   * @returns 上下文数据或undefined
   */
  get<T>(key: string): T | undefined;
  
  /**
   * 获取工作流执行状态
   * @returns 执行状态
   */
  getStatus(): WorkflowStatus;
  
  /**
   * 设置工作流执行状态
   * @param status 执行状态
   */
  setStatus(status: WorkflowStatus): void;
}
