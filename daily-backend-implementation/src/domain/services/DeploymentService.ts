/**
 * 部署服务接口
 * 定义部署相关的核心业务逻辑
 */
import {
  DeploymentConfig,
  DeploymentTask,
  DeploymentHistory,
  DeploymentEnvironmentConfig,
  DeploymentArtifact,
  DeploymentValidationResult,
  DeploymentEnvironment,
  DeploymentStatus
} from '../entities/DeploymentConfig';

export interface DeploymentService {
  /**
   * 获取部署配置列表
   * @param environment 环境类型（可选）
   * @returns 部署配置列表
   */
  getDeploymentConfigs(environment?: DeploymentEnvironment): Promise<DeploymentConfig[]>;

  /**
   * 根据ID获取部署配置
   * @param configId 部署配置ID
   * @returns 部署配置
   */
  getDeploymentConfigById(configId: string): Promise<DeploymentConfig>;

  /**
   * 创建部署配置
   * @param config 部署配置
   * @returns 创建的部署配置
   */
  createDeploymentConfig(config: Omit<DeploymentConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeploymentConfig>;

  /**
   * 更新部署配置
   * @param configId 部署配置ID
   * @param config 部署配置更新内容
   * @returns 更新后的部署配置
   */
  updateDeploymentConfig(configId: string, config: Partial<DeploymentConfig>): Promise<DeploymentConfig>;

  /**
   * 删除部署配置
   * @param configId 部署配置ID
   * @returns 删除结果
   */
  deleteDeploymentConfig(configId: string): Promise<boolean>;

  /**
   * 验证部署配置
   * @param configId 部署配置ID
   * @returns 验证结果
   */
  validateDeploymentConfig(configId: string): Promise<DeploymentValidationResult>;

  /**
   * 创建部署任务
   * @param configId 部署配置ID
   * @param deployedBy 部署者
   * @param taskParams 部署任务参数（可选）
   * @returns 创建的部署任务
   */
  createDeploymentTask(configId: string, deployedBy: string, taskParams?: Record<string, any>): Promise<DeploymentTask>;

  /**
   * 获取部署任务列表
   * @param environment 环境类型（可选）
   * @param status 部署状态（可选）
   * @returns 部署任务列表
   */
  getDeploymentTasks(environment?: DeploymentEnvironment, status?: DeploymentStatus): Promise<DeploymentTask[]>;

  /**
   * 根据ID获取部署任务
   * @param taskId 部署任务ID
   * @returns 部署任务
   */
  getDeploymentTaskById(taskId: string): Promise<DeploymentTask>;

  /**
   * 执行部署任务
   * @param taskId 部署任务ID
   * @returns 执行结果
   */
  executeDeploymentTask(taskId: string): Promise<boolean>;

  /**
   * 取消部署任务
   * @param taskId 部署任务ID
   * @returns 取消结果
   */
  cancelDeploymentTask(taskId: string): Promise<boolean>;

  /**
   * 回滚部署任务
   * @param taskId 部署任务ID
   * @param rolledBackBy 回滚者
   * @returns 回滚结果
   */
  rollbackDeploymentTask(taskId: string, rolledBackBy: string): Promise<boolean>;

  /**
   * 获取部署历史记录
   * @param environment 环境类型（可选）
   * @param limit 限制数量（可选）
   * @returns 部署历史记录列表
   */
  getDeploymentHistory(environment?: DeploymentEnvironment, limit?: number): Promise<DeploymentHistory[]>;

  /**
   * 获取部署历史记录详情
   * @param historyId 部署历史记录ID
   * @returns 部署历史记录详情
   */
  getDeploymentHistoryById(historyId: string): Promise<DeploymentHistory>;

  /**
   * 获取环境配置列表
   * @returns 环境配置列表
   */
  getEnvironmentConfigs(): Promise<DeploymentEnvironmentConfig[]>;

  /**
   * 根据环境类型获取环境配置
   * @param environment 环境类型
   * @returns 环境配置
   */
  getEnvironmentConfigByEnvironment(environment: DeploymentEnvironment): Promise<DeploymentEnvironmentConfig>;

  /**
   * 创建或更新环境配置
   * @param config 环境配置
   * @returns 创建或更新后的环境配置
   */
  upsertEnvironmentConfig(config: DeploymentEnvironmentConfig): Promise<DeploymentEnvironmentConfig>;

  /**
   * 删除环境配置
   * @param environment 环境类型
   * @returns 删除结果
   */
  deleteEnvironmentConfig(environment: DeploymentEnvironment): Promise<boolean>;

  /**
   * 获取部署制品列表
   * @param name 制品名称（可选）
   * @param version 制品版本（可选）
   * @returns 部署制品列表
   */
  getDeploymentArtifacts(name?: string, version?: string): Promise<DeploymentArtifact[]>;

  /**
   * 根据ID获取部署制品
   * @param artifactId 部署制品ID
   * @returns 部署制品
   */
  getDeploymentArtifactById(artifactId: string): Promise<DeploymentArtifact>;

  /**
   * 注册部署制品
   * @param artifact 部署制品
   * @returns 注册的部署制品
   */
  registerDeploymentArtifact(artifact: Omit<DeploymentArtifact, 'id' | 'createdAt'>): Promise<DeploymentArtifact>;

  /**
   * 删除部署制品
   * @param artifactId 部署制品ID
   * @returns 删除结果
   */
  deleteDeploymentArtifact(artifactId: string): Promise<boolean>;

  /**
   * 获取部署验证结果
   * @param configId 部署配置ID
   * @returns 部署验证结果列表
   */
  getDeploymentValidationResults(configId: string): Promise<DeploymentValidationResult[]>;

  /**
   * 清理旧的部署历史记录
   * @param days 保留天数
   * @returns 清理结果
   */
  cleanOldDeploymentHistory(days: number): Promise<number>;

  /**
   * 获取当前环境的部署状态
   * @param environment 环境类型
   * @returns 当前部署状态
   */
  getCurrentDeploymentStatus(environment: DeploymentEnvironment): Promise<DeploymentStatus>;

  /**
   * 获取部署统计信息
   * @param environment 环境类型（可选）
   * @returns 部署统计信息
   */
  getDeploymentStatistics(environment?: DeploymentEnvironment): Promise<Record<string, any>>;
}
