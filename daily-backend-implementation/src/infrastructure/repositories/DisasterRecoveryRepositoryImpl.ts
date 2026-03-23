/**
 * 灾难恢复仓库实现类
 * 使用内存存储来实现灾难恢复相关数据的访问操作
 */
import { DisasterRecoveryRepository } from '../../domain/repositories/DisasterRecoveryRepository';
import {
  DisasterRecoveryConfig,
  DisasterRecoveryEvent,
  RecoveryDrillPlan,
  RecoveryDrillResult,
  RecoveryNode
} from '../../domain/entities/DisasterRecoveryConfig';

/**
 * 灾难恢复仓库实现类
 */
export class DisasterRecoveryRepositoryImpl implements DisasterRecoveryRepository {
  /** 灾难恢复配置存储 */
  private disasterRecoveryConfig: DisasterRecoveryConfig | null = null;
  /** 灾难恢复事件存储 */
  private disasterRecoveryEvents: Map<string, DisasterRecoveryEvent> = new Map();
  /** 灾难恢复演练计划存储 */
  private recoveryDrillPlans: Map<string, RecoveryDrillPlan> = new Map();
  /** 灾难恢复演练结果存储 */
  private recoveryDrillResults: Map<string, RecoveryDrillResult> = new Map();
  /** 灾难恢复节点存储 */
  private recoveryNodes: Map<string, RecoveryNode> = new Map();

  /**
   * 保存灾难恢复配置
   * @param config 灾难恢复配置
   * @returns 保存的配置
   */
  async saveDisasterRecoveryConfig(config: DisasterRecoveryConfig): Promise<DisasterRecoveryConfig> {
    this.disasterRecoveryConfig = config;
    return config;
  }

  /**
   * 获取灾难恢复配置
   * @returns 灾难恢复配置
   */
  async getDisasterRecoveryConfig(): Promise<DisasterRecoveryConfig | null> {
    return this.disasterRecoveryConfig;
  }

  /**
   * 保存灾难恢复事件
   * @param event 灾难恢复事件
   * @returns 保存的事件
   */
  async saveDisasterRecoveryEvent(event: DisasterRecoveryEvent): Promise<DisasterRecoveryEvent> {
    this.disasterRecoveryEvents.set(event.id, event);
    return event;
  }

  /**
   * 获取灾难恢复事件列表
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 灾难恢复事件列表
   */
  async getDisasterRecoveryEvents(limit?: number, offset?: number): Promise<DisasterRecoveryEvent[]> {
    const events = Array.from(this.disasterRecoveryEvents.values())
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    const start = offset || 0;
    const end = limit ? start + limit : events.length;
    return events.slice(start, end);
  }

  /**
   * 获取灾难恢复事件详情
   * @param eventId 事件ID
   * @returns 灾难恢复事件详情
   */
  async getDisasterRecoveryEventById(eventId: string): Promise<DisasterRecoveryEvent | null> {
    return this.disasterRecoveryEvents.get(eventId) || null;
  }

  /**
   * 保存灾难恢复演练计划
   * @param plan 演练计划
   * @returns 保存的计划
   */
  async saveRecoveryDrillPlan(plan: RecoveryDrillPlan): Promise<RecoveryDrillPlan> {
    this.recoveryDrillPlans.set(plan.id, plan);
    return plan;
  }

  /**
   * 获取灾难恢复演练计划列表
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 演练计划列表
   */
  async getRecoveryDrillPlans(limit?: number, offset?: number): Promise<RecoveryDrillPlan[]> {
    const plans = Array.from(this.recoveryDrillPlans.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const start = offset || 0;
    const end = limit ? start + limit : plans.length;
    return plans.slice(start, end);
  }

  /**
   * 获取灾难恢复演练计划详情
   * @param planId 计划ID
   * @returns 演练计划详情
   */
  async getRecoveryDrillPlanById(planId: string): Promise<RecoveryDrillPlan | null> {
    return this.recoveryDrillPlans.get(planId) || null;
  }

  /**
   * 删除灾难恢复演练计划
   * @param planId 计划ID
   * @returns 删除结果
   */
  async deleteRecoveryDrillPlan(planId: string): Promise<boolean> {
    return this.recoveryDrillPlans.delete(planId);
  }

  /**
   * 保存灾难恢复演练结果
   * @param result 演练结果
   * @returns 保存的结果
   */
  async saveRecoveryDrillResult(result: RecoveryDrillResult): Promise<RecoveryDrillResult> {
    this.recoveryDrillResults.set(result.id, result);
    return result;
  }

  /**
   * 获取灾难恢复演练结果列表
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 演练结果列表
   */
  async getRecoveryDrillResults(limit?: number, offset?: number): Promise<RecoveryDrillResult[]> {
    const results = Array.from(this.recoveryDrillResults.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const start = offset || 0;
    const end = limit ? start + limit : results.length;
    return results.slice(start, end);
  }

  /**
   * 获取灾难恢复演练结果详情
   * @param resultId 结果ID
   * @returns 演练结果详情
   */
  async getRecoveryDrillResultById(resultId: string): Promise<RecoveryDrillResult | null> {
    return this.recoveryDrillResults.get(resultId) || null;
  }

  /**
   * 保存灾难恢复节点
   * @param node 恢复节点
   * @returns 保存的节点
   */
  async saveRecoveryNode(node: RecoveryNode): Promise<RecoveryNode> {
    this.recoveryNodes.set(node.id, node);
    return node;
  }

  /**
   * 获取灾难恢复节点列表
   * @returns 节点列表
   */
  async getRecoveryNodes(): Promise<RecoveryNode[]> {
    return Array.from(this.recoveryNodes.values());
  }

  /**
   * 获取灾难恢复节点详情
   * @param nodeId 节点ID
   * @returns 节点详情
   */
  async getRecoveryNodeById(nodeId: string): Promise<RecoveryNode | null> {
    return this.recoveryNodes.get(nodeId) || null;
  }

  /**
   * 删除灾难恢复节点
   * @param nodeId 节点ID
   * @returns 删除结果
   */
  async deleteRecoveryNode(nodeId: string): Promise<boolean> {
    return this.recoveryNodes.delete(nodeId);
  }

  /**
   * 更新灾难恢复节点状态
   * @param nodeId 节点ID
   * @param status 节点状态
   * @returns 更新后的节点
   */
  async updateRecoveryNodeStatus(nodeId: string, status: RecoveryNode['status']): Promise<RecoveryNode> {
    const node = this.recoveryNodes.get(nodeId);
    if (!node) {
      throw new Error(`节点不存在: ${nodeId}`);
    }

    node.status = status;
    node.updatedAt = new Date();
    this.recoveryNodes.set(nodeId, node);
    return node;
  }

  /**
   * 切换节点角色
   * @param nodeId 节点ID
   * @param role 目标角色
   * @returns 切换后的节点
   */
  async switchNodeRole(nodeId: string, role: 'ACTIVE' | 'PASSIVE'): Promise<RecoveryNode> {
    const node = this.recoveryNodes.get(nodeId);
    if (!node) {
      throw new Error(`节点不存在: ${nodeId}`);
    }

    node.currentRole = role;
    node.updatedAt = new Date();
    this.recoveryNodes.set(nodeId, node);
    return node;
  }
}
