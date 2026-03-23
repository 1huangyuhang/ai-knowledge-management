/**
 * 灾难恢复服务接口
 * 定义灾难恢复相关的业务操作
 */
import {
  DisasterRecoveryConfig,
  DisasterRecoveryEvent,
  RecoveryDrillPlan,
  RecoveryDrillResult,
  RecoveryNode
} from '../entities/DisasterRecoveryConfig';

/**
 * 灾难恢复服务接口
 */
export interface DisasterRecoveryService {
  /**
   * 获取灾难恢复配置
   * @returns 灾难恢复配置
   */
  getDisasterRecoveryConfig(): Promise<DisasterRecoveryConfig | null>;

  /**
   * 更新灾难恢复配置
   * @param config 灾难恢复配置
   * @returns 更新后的配置
   */
  updateDisasterRecoveryConfig(config: DisasterRecoveryConfig): Promise<DisasterRecoveryConfig>;

  /**
   * 触发灾难恢复
   * @param eventId 灾难事件ID
   * @returns 恢复操作结果
   */
  triggerDisasterRecovery(eventId: string): Promise<boolean>;

  /**
   * 获取灾难恢复事件列表
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 灾难恢复事件列表
   */
  getDisasterRecoveryEvents(limit?: number, offset?: number): Promise<DisasterRecoveryEvent[]>;

  /**
   * 获取灾难恢复事件详情
   * @param eventId 事件ID
   * @returns 灾难恢复事件详情
   */
  getDisasterRecoveryEventById(eventId: string): Promise<DisasterRecoveryEvent | null>;

  /**
   * 创建灾难恢复演练计划
   * @param plan 演练计划
   * @returns 创建的演练计划
   */
  createRecoveryDrillPlan(plan: RecoveryDrillPlan): Promise<RecoveryDrillPlan>;

  /**
   * 获取灾难恢复演练计划列表
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 演练计划列表
   */
  getRecoveryDrillPlans(limit?: number, offset?: number): Promise<RecoveryDrillPlan[]>;

  /**
   * 更新灾难恢复演练计划
   * @param plan 演练计划
   * @returns 更新后的演练计划
   */
  updateRecoveryDrillPlan(plan: RecoveryDrillPlan): Promise<RecoveryDrillPlan>;

  /**
   * 删除灾难恢复演练计划
   * @param planId 计划ID
   * @returns 删除结果
   */
  deleteRecoveryDrillPlan(planId: string): Promise<boolean>;

  /**
   * 执行灾难恢复演练
   * @param planId 计划ID
   * @returns 演练结果ID
   */
  executeRecoveryDrill(planId: string): Promise<string>;

  /**
   * 获取灾难恢复演练结果列表
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 演练结果列表
   */
  getRecoveryDrillResults(limit?: number, offset?: number): Promise<RecoveryDrillResult[]>;

  /**
   * 获取灾难恢复演练结果详情
   * @param resultId 结果ID
   * @returns 演练结果详情
   */
  getRecoveryDrillResultById(resultId: string): Promise<RecoveryDrillResult | null>;

  /**
   * 获取灾难恢复节点列表
   * @returns 节点列表
   */
  getRecoveryNodes(): Promise<RecoveryNode[]>;

  /**
   * 更新灾难恢复节点状态
   * @param nodeId 节点ID
   * @param status 节点状态
   * @returns 更新后的节点
   */
  updateRecoveryNodeStatus(nodeId: string, status: RecoveryNode['status']): Promise<RecoveryNode>;

  /**
   * 切换节点角色
   * @param nodeId 节点ID
   * @param role 目标角色
   * @returns 切换结果
   */
  switchNodeRole(nodeId: string, role: 'ACTIVE' | 'PASSIVE'): Promise<boolean>;

  /**
   * 获取灾难恢复状态
   * @returns 灾难恢复状态
   */
  getDisasterRecoveryStatus(): Promise<{
    overallStatus: string;
    nodes: RecoveryNode[];
    recentEvents: DisasterRecoveryEvent[];
  }>;
}
