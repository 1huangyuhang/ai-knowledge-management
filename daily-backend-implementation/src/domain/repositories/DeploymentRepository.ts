/**
 * 部署仓库接口
 * 定义部署相关数据的持久化和查询操作
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

export interface DeploymentRepository {
  /**
   * 保存部署配置
   * @param config 部署配置
   * @returns 保存后的部署配置
   */
  saveDeploymentConfig(config: DeploymentConfig): Promise<DeploymentConfig>;

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
  getDeploymentConfigById(configId: string): Promise<DeploymentConfig | null>;

  /**
   * 删除部署配置
   * @param configId 部署配置ID
   * @returns 删除结果
   */
  deleteDeploymentConfig(configId: string): Promise<boolean>;

  /**
   * 保存部署任务
   * @param task 部署任务
   * @returns 保存后的部署任务
   */
  saveDeploymentTask(task: DeploymentTask): Promise<DeploymentTask>;

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
  getDeploymentTaskById(taskId: string): Promise<DeploymentTask | null>;

  /**
   * 更新部署任务状态
   * @param taskId 部署任务ID
   * @param status 部署状态
   * @param result 部署结果（可选）
   * @param errorMessage 错误信息（可选）
   * @returns 更新后的部署任务
   */
  updateDeploymentTaskStatus(
    taskId: string,
    status: DeploymentStatus,
    result?: Record<string, any>,
    errorMessage?: string
  ): Promise<DeploymentTask>;

  /**
   * 保存部署历史记录
   * @param history 部署历史记录
   * @returns 保存后的部署历史记录
   */
  saveDeploymentHistory(history: DeploymentHistory): Promise<DeploymentHistory>;

  /**
   * 获取部署历史记录列表
   * @param environment 环境类型（可选）
   * @param limit 限制数量（可选）
   * @returns 部署历史记录列表
   */
  getDeploymentHistory(environment?: DeploymentEnvironment, limit?: number): Promise<DeploymentHistory[]>;

  /**
   * 根据ID获取部署历史记录
   * @param historyId 部署历史记录ID
   * @returns 部署历史记录
   */
  getDeploymentHistoryById(historyId: string): Promise<DeploymentHistory | null>;

  /**
   * 清理旧的部署历史记录
   * @param days 保留天数
   * @returns 清理的记录数
   */
  cleanOldDeploymentHistory(days: number): Promise<number>;

  /**
   * 保存环境配置
   * @param config 环境配置
   * @returns 保存后的环境配置
   */
  saveEnvironmentConfig(config: DeploymentEnvironmentConfig): Promise<DeploymentEnvironmentConfig>;

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
  getEnvironmentConfigByEnvironment(environment: DeploymentEnvironment): Promise<DeploymentEnvironmentConfig | null>;

  /**
   * 删除环境配置
   * @param environment 环境类型
   * @returns 删除结果
   */
  deleteEnvironmentConfig(environment: DeploymentEnvironment): Promise<boolean>;

  /**
   * 保存部署制品
   * @param artifact 部署制品
   * @returns 保存后的部署制品
   */
  saveDeploymentArtifact(artifact: DeploymentArtifact): Promise<DeploymentArtifact>;

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
  getDeploymentArtifactById(artifactId: string): Promise<DeploymentArtifact | null>;

  /**
   * 删除部署制品
   * @param artifactId 部署制品ID
   * @returns 删除结果
   */
  deleteDeploymentArtifact(artifactId: string): Promise<boolean>;

  /**
   * 保存部署验证结果
   * @param result 部署验证结果
   * @returns 保存后的部署验证结果
   */
  saveDeploymentValidationResult(result: DeploymentValidationResult): Promise<DeploymentValidationResult>;

  /**
   * 获取部署验证结果列表
   * @param configId 部署配置ID
   * @returns 部署验证结果列表
   */
  getDeploymentValidationResults(configId: string): Promise<DeploymentValidationResult[]>;

  /**
   * 根据ID获取部署验证结果
   * @param resultId 部署验证结果ID
   * @returns 部署验证结果
   */
  getDeploymentValidationResultById(resultId: string): Promise<DeploymentValidationResult | null>;
}