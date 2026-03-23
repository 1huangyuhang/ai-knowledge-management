/**
 * 部署配置实体
 * 表示系统的部署配置信息
 */

export enum DeploymentEnvironment {
  /** 开发环境 */
  DEVELOPMENT = 'DEVELOPMENT',
  /** 测试环境 */
  TESTING = 'TESTING',
  /** 预生产环境 */
  STAGING = 'STAGING',
  /** 生产环境 */
  PRODUCTION = 'PRODUCTION'
}

export enum DeploymentStatus {
  /** 待部署 */
  PENDING = 'PENDING',
  /** 部署中 */
  IN_PROGRESS = 'IN_PROGRESS',
  /** 部署成功 */
  SUCCESS = 'SUCCESS',
  /** 部署失败 */
  FAILURE = 'FAILURE',
  /** 已回滚 */
  ROLLED_BACK = 'ROLLED_BACK'
}

export enum DeploymentStrategy {
  /** 蓝绿部署 */
  BLUE_GREEN = 'BLUE_GREEN',
  /** 滚动部署 */
  ROLLING = 'ROLLING',
  /** 金丝雀部署 */
  CANARY = 'CANARY',
  /** 全量部署 */
  FULL = 'FULL'
}

export interface DeploymentConfig {
  /** 部署配置ID */
  id: string;
  /** 环境类型 */
  environment: DeploymentEnvironment;
  /** 部署策略 */
  strategy: DeploymentStrategy;
  /** 部署配置名称 */
  name: string;
  /** 部署配置描述 */
  description?: string;
  /** 部署目标主机列表 */
  targetHosts: string[];
  /** 部署目标端口 */
  targetPort: number;
  /** 部署版本 */
  version: string;
  /** 部署脚本路径 */
  deployScriptPath?: string;
  /** 部署前检查脚本路径 */
  preDeployScriptPath?: string;
  /** 部署后检查脚本路径 */
  postDeployScriptPath?: string;
  /** 回滚脚本路径 */
  rollbackScriptPath?: string;
  /** 是否启用自动回滚 */
  autoRollback: boolean;
  /** 自动回滚超时时间（秒） */
  autoRollbackTimeout: number;
  /** 部署超时时间（秒） */
  deployTimeout: number;
  /** 是否启用健康检查 */
  healthCheckEnabled: boolean;
  /** 健康检查URL */
  healthCheckUrl?: string;
  /** 健康检查间隔（秒） */
  healthCheckInterval: number;
  /** 健康检查超时时间（秒） */
  healthCheckTimeout: number;
  /** 健康检查重试次数 */
  healthCheckRetries: number;
  /** 部署并行度 */
  parallelism: number;
  /** 滚动更新批次大小 */
  batchSize?: number;
  /** 金丝雀部署百分比 */
  canaryPercentage?: number;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 是否启用 */
  enabled: boolean;
  /** 部署配置参数 */
  configParams?: Record<string, any>;
}

export interface DeploymentTask {
  /** 部署任务ID */
  id: string;
  /** 部署配置ID */
  configId: string;
  /** 部署环境 */
  environment: DeploymentEnvironment;
  /** 部署版本 */
  version: string;
  /** 部署状态 */
  status: DeploymentStatus;
  /** 部署策略 */
  strategy: DeploymentStrategy;
  /** 部署目标主机列表 */
  targetHosts: string[];
  /** 开始时间 */
  startTime?: Date;
  /** 结束时间 */
  endTime?: Date;
  /** 部署日志URL或路径 */
  logsUrl?: string;
  /** 部署错误信息 */
  errorMessage?: string;
  /** 部署执行结果 */
  result?: Record<string, any>;
  /** 部署者 */
  deployedBy: string;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 部署任务参数 */
  taskParams?: Record<string, any>;
}

export interface DeploymentHistory {
  /** 部署历史ID */
  id: string;
  /** 部署任务ID */
  taskId: string;
  /** 部署环境 */
  environment: DeploymentEnvironment;
  /** 部署版本 */
  version: string;
  /** 部署状态 */
  status: DeploymentStatus;
  /** 部署者 */
  deployedBy: string;
  /** 部署开始时间 */
  startTime: Date;
  /** 部署结束时间 */
  endTime: Date;
  /** 部署耗时（秒） */
  duration: number;
  /** 部署结果摘要 */
  resultSummary: string;
  /** 部署日志URL */
  logsUrl?: string;
  /** 创建时间 */
  createdAt: Date;
}

export interface DeploymentEnvironmentConfig {
  /** 环境配置ID */
  id: string;
  /** 环境类型 */
  environment: DeploymentEnvironment;
  /** 环境名称 */
  name: string;
  /** 环境描述 */
  description?: string;
  /** 环境URL */
  url?: string;
  /** 环境状态 */
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  /** 环境配置参数 */
  configParams: Record<string, any>;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

export interface DeploymentArtifact {
  /** 部署制品ID */
  id: string;
  /** 制品名称 */
  name: string;
  /** 制品类型 */
  type: 'DOCKER_IMAGE' | 'JAR' | 'ZIP' | 'TAR' | 'OTHER';
  /** 制品版本 */
  version: string;
  /** 制品URL */
  url: string;
  /** 制品校验和 */
  checksum?: string;
  /** 制品大小（字节） */
  size?: number;
  /** 创建时间 */
  createdAt: Date;
  /** 构建ID */
  buildId?: string;
  /** 构建版本 */
  buildVersion?: string;
}

export interface DeploymentValidationResult {
  /** 验证结果ID */
  id: string;
  /** 部署配置ID */
  configId: string;
  /** 验证状态 */
  status: 'PASSED' | 'FAILED' | 'WARNING';
  /** 验证项目 */
  validationItems: {
    /** 验证项名称 */
    name: string;
    /** 验证项状态 */
    status: 'PASSED' | 'FAILED' | 'WARNING';
    /** 验证项消息 */
    message: string;
    /** 验证项详情 */
    details?: any;
  }[];
  /** 验证时间 */
  validatedAt: Date;
  /** 验证者 */
  validatedBy?: string;
}
