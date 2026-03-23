/**
 * 灾难恢复仓库接口
 * 定义灾难恢复相关实体的数据访问操作
 */
import {
  DisasterRecoveryConfig,
  DisasterRecoveryEvent,
  RecoveryDrillPlan,
  RecoveryDrillResult,
  RecoveryNode
} from '../entities/DisasterRecoveryConfig';

/**
 * 灾难恢复仓库接口
 */
export interface DisasterRecoveryRepository {
  /**
   * 保存灾难恢复配置
   * @param config 灾难恢复配置
   * @returns 保存的配置
   */
  saveDisasterRecoveryConfig(config: DisasterRecoveryConfig): Promise<DisasterRecoveryConfig>;

  /**
   * 获取灾难恢复配置
   * @returns 灾难恢复配置
   */
  getDisasterRecoveryConfig(): Promise<DisasterRecoveryConfig | null>;

  /**
   * 保存灾难恢复事件
   * @param event 灾难恢复事件
   * @returns 保存的事件
   */
  saveDisasterRecoveryEvent(event: DisasterRecoveryEvent): Promise<DisasterRecoveryEvent>;

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
   * 保存灾难恢复演练计划
   * @param plan 演练计划
   * @returns 保存的计划
   */
  saveRecoveryDrillPlan(plan: RecoveryDrillPlan): Promise<RecoveryDrillPlan>;

  /**
   * 获取灾难恢复演练计划列表
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 演练计划列表
   */
  getRecoveryDrillPlans(limit?: number, offset?: number): Promise<RecoveryDrillPlan[]>;

  /**
   * 获取灾难恢复演练计划详情
   * @param planId 计划ID
   * @returns 演练计划详情
   */
  getRecoveryDrillPlanById(planId: string): Promise<RecoveryDrillPlan | null>;

  /**
   * 删除灾难恢复演练计划
   * @param planId 计划ID
   * @returns 删除结果
   */
  deleteRecoveryDrillPlan(planId: string): Promise<boolean>;

  /**
   * 保存灾难恢复演练结果
   * @param result 演练结果
   * @returns 保存的结果
   */
  saveRecoveryDrillResult(result: RecoveryDrillResult): Promise<RecoveryDrillResult>;

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
   * 保存灾难恢复节点
   * @param node 恢复节点
   * @returns 保存的节点
   */
  saveRecoveryNode(node: RecoveryNode): Promise<RecoveryNode>;

  /**
   * 获取灾难恢复节点列表
   * @returns 节点列表
   */
  getRecoveryNodes(): Promise<RecoveryNode[]>;

  /**
   * 获取灾难恢复节点详情
   * @param nodeId 节点ID
   * @returns 节点详情
   */
  getRecoveryNodeById(nodeId: string): Promise<RecoveryNode | null>;

  /**
   * 删除灾难恢复节点
   * @param nodeId 节点ID
   * @returns 删除结果
   */
  deleteRecoveryNode(nodeId: string): Promise<boolean>;

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
   * @returns 切换后的节点
   */
  switchNodeRole(nodeId: string, role: 'ACTIVE' | 'PASSIVE'): Promise<RecoveryNode>;
}
