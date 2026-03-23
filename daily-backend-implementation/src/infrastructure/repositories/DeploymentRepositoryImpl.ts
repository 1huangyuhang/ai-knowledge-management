/**
 * 部署仓库实现
 * 基于内存的部署仓库，用于存储部署相关数据
 */
import { DeploymentRepository } from '../../domain/repositories/DeploymentRepository';
import {
  DeploymentConfig,
  DeploymentTask,
  DeploymentHistory,
  DeploymentEnvironmentConfig,
  DeploymentArtifact,
  DeploymentValidationResult,
  DeploymentEnvironment,
  DeploymentStatus
} from '../../domain/entities/DeploymentConfig';

/**
 * 部署仓库实现类
 */
export class DeploymentRepositoryImpl implements DeploymentRepository {
  // 内存存储
  private deploymentConfigs: Map<string, DeploymentConfig> = new Map();
  private deploymentTasks: Map<string, DeploymentTask> = new Map();
  private deploymentHistory: Map<string, DeploymentHistory> = new Map();
  private environmentConfigs: Map<string, DeploymentEnvironmentConfig> = new Map();
  private deploymentArtifacts: Map<string, DeploymentArtifact> = new Map();
  private deploymentValidationResults: Map<string, DeploymentValidationResult> = new Map();

  /**
   * 保存部署配置
   * @param config 部署配置
   * @returns 保存后的部署配置
   */
  async saveDeploymentConfig(config: DeploymentConfig): Promise<DeploymentConfig> {
    this.deploymentConfigs.set(config.id, config);
    return config;
  }

  /**
   * 获取部署配置列表
   * @param environment 环境类型（可选）
   * @returns 部署配置列表
   */
  async getDeploymentConfigs(environment?: DeploymentEnvironment): Promise<DeploymentConfig[]> {
    let configs = Array.from(this.deploymentConfigs.values());
    
    if (environment) {
      configs = configs.filter(config => config.environment === environment);
    }
    
    return configs;
  }

  /**
   * 根据ID获取部署配置
   * @param configId 部署配置ID
   * @returns 部署配置
   */
  async getDeploymentConfigById(configId: string): Promise<DeploymentConfig | null> {
    return this.deploymentConfigs.get(configId) || null;
  }

  /**
   * 删除部署配置
   * @param configId 部署配置ID
   * @returns 删除结果
   */
  async deleteDeploymentConfig(configId: string): Promise<boolean> {
    return this.deploymentConfigs.delete(configId);
  }

  /**
   * 保存部署任务
   * @param task 部署任务
   * @returns 保存后的部署任务
   */
  async saveDeploymentTask(task: DeploymentTask): Promise<DeploymentTask> {
    this.deploymentTasks.set(task.id, task);
    return task;
  }

  /**
   * 获取部署任务列表
   * @param environment 环境类型（可选）
   * @param status 部署状态（可选）
   * @returns 部署任务列表
   */
  async getDeploymentTasks(environment?: DeploymentEnvironment, status?: DeploymentStatus): Promise<DeploymentTask[]> {
    let tasks = Array.from(this.deploymentTasks.values());
    
    if (environment) {
      tasks = tasks.filter(task => task.environment === environment);
    }
    
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }
    
    return tasks;
  }

  /**
   * 根据ID获取部署任务
   * @param taskId 部署任务ID
   * @returns 部署任务
   */
  async getDeploymentTaskById(taskId: string): Promise<DeploymentTask | null> {
    return this.deploymentTasks.get(taskId) || null;
  }

  /**
   * 更新部署任务状态
   * @param taskId 部署任务ID
   * @param status 部署状态
   * @param result 部署结果（可选）
   * @param errorMessage 错误信息（可选）
   * @returns 更新后的部署任务
   */
  async updateDeploymentTaskStatus(
    taskId: string,
    status: DeploymentStatus,
    result?: Record<string, any>,
    errorMessage?: string
  ): Promise<DeploymentTask> {
    const task = this.deploymentTasks.get(taskId);
    if (!task) {
      throw new Error(`Deployment task with id ${taskId} not found`);
    }
    
    const updatedTask: DeploymentTask = {
      ...task,
      status,
      result: result || task.result,
      errorMessage: errorMessage || task.errorMessage,
      updatedAt: new Date(),
      endTime: status !== DeploymentStatus.IN_PROGRESS ? new Date() : task.endTime,
      startTime: status === DeploymentStatus.IN_PROGRESS && !task.startTime ? new Date() : task.startTime
    };
    
    this.deploymentTasks.set(taskId, updatedTask);
    return updatedTask;
  }

  /**
   * 保存部署历史记录
   * @param history 部署历史记录
   * @returns 保存后的部署历史记录
   */
  async saveDeploymentHistory(history: DeploymentHistory): Promise<DeploymentHistory> {
    this.deploymentHistory.set(history.id, history);
    return history;
  }

  /**
   * 获取部署历史记录列表
   * @param environment 环境类型（可选）
   * @param limit 限制数量（可选）
   * @returns 部署历史记录列表
   */
  async getDeploymentHistory(environment?: DeploymentEnvironment, limit?: number): Promise<DeploymentHistory[]> {
    let history = Array.from(this.deploymentHistory.values());
    
    if (environment) {
      history = history.filter(h => h.environment === environment);
    }
    
    // 按时间倒序排序
    history.sort((a, b) => b.endTime.getTime() - a.endTime.getTime());
    
    if (limit) {
      history = history.slice(0, limit);
    }
    
    return history;
  }

  /**
   * 根据ID获取部署历史记录
   * @param historyId 部署历史记录ID
   * @returns 部署历史记录
   */
  async getDeploymentHistoryById(historyId: string): Promise<DeploymentHistory | null> {
    return this.deploymentHistory.get(historyId) || null;
  }

  /**
   * 清理旧的部署历史记录
   * @param days 保留天数
   * @returns 清理的记录数
   */
  async cleanOldDeploymentHistory(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    let deletedCount = 0;
    for (const [id, history] of this.deploymentHistory.entries()) {
      if (history.endTime < cutoffDate) {
        this.deploymentHistory.delete(id);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  /**
   * 保存环境配置
   * @param config 环境配置
   * @returns 保存后的环境配置
   */
  async saveEnvironmentConfig(config: DeploymentEnvironmentConfig): Promise<DeploymentEnvironmentConfig> {
    this.environmentConfigs.set(config.environment, config);
    return config;
  }

  /**
   * 获取环境配置列表
   * @returns 环境配置列表
   */
  async getEnvironmentConfigs(): Promise<DeploymentEnvironmentConfig[]> {
    return Array.from(this.environmentConfigs.values());
  }

  /**
   * 根据环境类型获取环境配置
   * @param environment 环境类型
   * @returns 环境配置
   */
  async getEnvironmentConfigByEnvironment(environment: DeploymentEnvironment): Promise<DeploymentEnvironmentConfig | null> {
    return this.environmentConfigs.get(environment) || null;
  }

  /**
   * 删除环境配置
   * @param environment 环境类型
   * @returns 删除结果
   */
  async deleteEnvironmentConfig(environment: DeploymentEnvironment): Promise<boolean> {
    return this.environmentConfigs.delete(environment);
  }

  /**
   * 保存部署制品
   * @param artifact 部署制品
   * @returns 保存后的部署制品
   */
  async saveDeploymentArtifact(artifact: DeploymentArtifact): Promise<DeploymentArtifact> {
    this.deploymentArtifacts.set(artifact.id, artifact);
    return artifact;
  }

  /**
   * 获取部署制品列表
   * @param name 制品名称（可选）
   * @param version 制品版本（可选）
   * @returns 部署制品列表
   */
  async getDeploymentArtifacts(name?: string, version?: string): Promise<DeploymentArtifact[]> {
    let artifacts = Array.from(this.deploymentArtifacts.values());
    
    if (name) {
      artifacts = artifacts.filter(artifact => artifact.name === name);
    }
    
    if (version) {
      artifacts = artifacts.filter(artifact => artifact.version === version);
    }
    
    return artifacts;
  }

  /**
   * 根据ID获取部署制品
   * @param artifactId 部署制品ID
   * @returns 部署制品
   */
  async getDeploymentArtifactById(artifactId: string): Promise<DeploymentArtifact | null> {
    return this.deploymentArtifacts.get(artifactId) || null;
  }

  /**
   * 删除部署制品
   * @param artifactId 部署制品ID
   * @returns 删除结果
   */
  async deleteDeploymentArtifact(artifactId: string): Promise<boolean> {
    return this.deploymentArtifacts.delete(artifactId);
  }

  /**
   * 保存部署验证结果
   * @param result 部署验证结果
   * @returns 保存后的部署验证结果
   */
  async saveDeploymentValidationResult(result: DeploymentValidationResult): Promise<DeploymentValidationResult> {
    this.deploymentValidationResults.set(result.id, result);
    return result;
  }

  /**
   * 获取部署验证结果列表
   * @param configId 部署配置ID
   * @returns 部署验证结果列表
   */
  async getDeploymentValidationResults(configId: string): Promise<DeploymentValidationResult[]> {
    return Array.from(this.deploymentValidationResults.values())
      .filter(result => result.configId === configId);
  }

  /**
   * 根据ID获取部署验证结果
   * @param resultId 部署验证结果ID
   * @returns 部署验证结果
   */
  async getDeploymentValidationResultById(resultId: string): Promise<DeploymentValidationResult | null> {
    return this.deploymentValidationResults.get(resultId) || null;
  }
}
