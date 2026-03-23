/**
 * 灾难恢复配置实体
 * 定义灾难恢复相关的领域模型
 */

/**
 * 灾难恢复模式枚举
 */
export enum DisasterRecoveryMode {
  /** 主备模式：一个主节点，一个或多个备用节点 */
  ACTIVE_STANDBY = 'ACTIVE_STANDBY',
  /** 多活模式：多个活动节点同时提供服务 */
  MULTI_ACTIVE = 'MULTI_ACTIVE',
  /** 混合模式：结合主备和多活的特点 */
  HYBRID = 'HYBRID'
}

/**
 * 恢复优先级枚举
 */
export enum RecoveryPriority {
  /** 最高优先级：立即恢复关键业务 */
  CRITICAL = 'CRITICAL',
  /** 高优先级：在关键业务恢复后立即恢复 */
  HIGH = 'HIGH',
  /** 中等优先级：按计划恢复 */
  MEDIUM = 'MEDIUM',
  /** 低优先级：最后恢复 */
  LOW = 'LOW'
}

/**
 * 灾难恢复状态枚举
 */
export enum DisasterRecoveryStatus {
  /** 正常状态 */
  NORMAL = 'NORMAL',
  /** 灾难发生中 */
  DISASTER_OCCURRING = 'DISASTER_OCCURRING',
  /** 正在恢复中 */
  RECOVERING = 'RECOVERING',
  /** 恢复完成 */
  RECOVERED = 'RECOVERED',
  /** 恢复失败 */
  RECOVERY_FAILED = 'RECOVERY_FAILED'
}

/**
 * 灾难类型枚举
 */
export enum DisasterType {
  /** 系统故障 */
  SYSTEM_FAILURE = 'SYSTEM_FAILURE',
  /** 网络故障 */
  NETWORK_FAILURE = 'NETWORK_FAILURE',
  /** 硬件故障 */
  HARDWARE_FAILURE = 'HARDWARE_FAILURE',
  /** 软件故障 */
  SOFTWARE_FAILURE = 'SOFTWARE_FAILURE',
  /** 数据损坏 */
  DATA_CORRUPTION = 'DATA_CORRUPTION',
  /** 自然灾害 */
  NATURAL_DISASTER = 'NATURAL_DISASTER',
  /** 人为错误 */
  HUMAN_ERROR = 'HUMAN_ERROR',
  /** 安全事件 */
  SECURITY_INCIDENT = 'SECURITY_INCIDENT'
}

/**
 * 灾难恢复配置实体
 */
export class DisasterRecoveryConfig {
  /** 配置ID */
  id: string;
  /** 灾难恢复模式 */
  mode: DisasterRecoveryMode;
  /** 恢复目标时间（分钟） */
  recoveryTimeObjective: number;
  /** 恢复点目标（分钟） */
  recoveryPointObjective: number;
  /** 最大允许数据丢失（MB） */
  maxDataLoss: number;
  /** 是否启用自动恢复 */
  autoRecoveryEnabled: boolean;
  /** 恢复优先级映射（组件ID -> 恢复优先级） */
  componentPriorities: Record<string, RecoveryPriority>;
  /** 监控节点列表 */
  monitorNodes: string[];
  /** 故障检测阈值（连续失败次数） */
  failureDetectionThreshold: number;
  /** 故障切换延迟（秒） */
  failoverDelay: number;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;

  /**
   * 构造函数
   * @param params 构造参数
   */
  constructor(params: {
    id: string;
    mode: DisasterRecoveryMode;
    recoveryTimeObjective: number;
    recoveryPointObjective: number;
    maxDataLoss: number;
    autoRecoveryEnabled: boolean;
    componentPriorities: Record<string, RecoveryPriority>;
    monitorNodes: string[];
    failureDetectionThreshold: number;
    failoverDelay: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.mode = params.mode;
    this.recoveryTimeObjective = params.recoveryTimeObjective;
    this.recoveryPointObjective = params.recoveryPointObjective;
    this.maxDataLoss = params.maxDataLoss;
    this.autoRecoveryEnabled = params.autoRecoveryEnabled;
    this.componentPriorities = params.componentPriorities;
    this.monitorNodes = params.monitorNodes;
    this.failureDetectionThreshold = params.failureDetectionThreshold;
    this.failoverDelay = params.failoverDelay;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  /**
   * 更新配置
   * @param updates 更新字段
   */
  update(updates: Partial<Omit<DisasterRecoveryConfig, 'id' | 'createdAt'>>): void {
    Object.assign(this, updates);
    this.updatedAt = new Date();
  }
}

/**
 * 灾难恢复事件实体
 */
export class DisasterRecoveryEvent {
  /** 事件ID */
  id: string;
  /** 事件类型 */
  type: DisasterType;
  /** 发生时间 */
  occurredAt: Date;
  /** 影响范围（组件列表） */
  affectedComponents: string[];
  /** 事件描述 */
  description: string;
  /** 严重程度（1-5，5为最严重） */
  severity: number;
  /** 状态 */
  status: DisasterRecoveryStatus;
  /** 处理人 */
  handledBy?: string;
  /** 处理时间 */
  handledAt?: Date;
  /** 处理结果 */
  resolution?: string;

  /**
   * 构造函数
   * @param params 构造参数
   */
  constructor(params: {
    id: string;
    type: DisasterType;
    occurredAt: Date;
    affectedComponents: string[];
    description: string;
    severity: number;
    status: DisasterRecoveryStatus;
    handledBy?: string;
    handledAt?: Date;
    resolution?: string;
  }) {
    this.id = params.id;
    this.type = params.type;
    this.occurredAt = params.occurredAt;
    this.affectedComponents = params.affectedComponents;
    this.description = params.description;
    this.severity = params.severity;
    this.status = params.status;
    this.handledBy = params.handledBy;
    this.handledAt = params.handledAt;
    this.resolution = params.resolution;
  }

  /**
   * 更新事件状态
   * @param status 新状态
   * @param handledBy 处理人
   * @param resolution 处理结果
   */
  updateStatus(
    status: DisasterRecoveryStatus,
    handledBy?: string,
    resolution?: string
  ): void {
    this.status = status;
    if (handledBy) {
      this.handledBy = handledBy;
      this.handledAt = new Date();
    }
    if (resolution) {
      this.resolution = resolution;
    }
  }
}

/**
 * 灾难恢复演练计划实体
 */
export class RecoveryDrillPlan {
  /** 计划ID */
  id: string;
  /** 演练名称 */
  name: string;
  /** 演练描述 */
  description: string;
  /** 计划开始时间 */
  scheduledStartTime: Date;
  /** 计划结束时间 */
  scheduledEndTime: Date;
  /** 演练范围（组件列表） */
  scope: string[];
  /** 演练类型（全量/增量） */
  drillType: 'FULL' | 'INCREMENTAL';
  /** 预期结果 */
  expectedOutcome: string;
  /** 负责人 */
  responsiblePerson: string;
  /** 是否启用 */
  enabled: boolean;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;

  /**
   * 构造函数
   * @param params 构造参数
   */
  constructor(params: {
    id: string;
    name: string;
    description: string;
    scheduledStartTime: Date;
    scheduledEndTime: Date;
    scope: string[];
    drillType: 'FULL' | 'INCREMENTAL';
    expectedOutcome: string;
    responsiblePerson: string;
    enabled: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.scheduledStartTime = params.scheduledStartTime;
    this.scheduledEndTime = params.scheduledEndTime;
    this.scope = params.scope;
    this.drillType = params.drillType;
    this.expectedOutcome = params.expectedOutcome;
    this.responsiblePerson = params.responsiblePerson;
    this.enabled = params.enabled;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  /**
   * 更新计划
   * @param updates 更新字段
   */
  update(updates: Partial<Omit<RecoveryDrillPlan, 'id' | 'createdAt'>>): void {
    Object.assign(this, updates);
    this.updatedAt = new Date();
  }
}

/**
 * 灾难恢复演练结果实体
 */
export class RecoveryDrillResult {
  /** 结果ID */
  id: string;
  /** 演练计划ID */
  drillPlanId: string;
  /** 实际开始时间 */
  actualStartTime: Date;
  /** 实际结束时间 */
  actualEndTime: Date;
  /** 演练结果状态 */
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE';
  /** 恢复时间（秒） */
  recoveryTime: number;
  /** 数据丢失量（MB） */
  dataLoss: number;
  /** 演练发现的问题 */
  issues: string[];
  /** 改进建议 */
  recommendations: string[];
  /** 执行报告 */
  executionReport: string;
  /** 创建时间 */
  createdAt: Date;

  /**
   * 构造函数
   * @param params 构造参数
   */
  constructor(params: {
    id: string;
    drillPlanId: string;
    actualStartTime: Date;
    actualEndTime: Date;
    status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE';
    recoveryTime: number;
    dataLoss: number;
    issues: string[];
    recommendations: string[];
    executionReport: string;
    createdAt?: Date;
  }) {
    this.id = params.id;
    this.drillPlanId = params.drillPlanId;
    this.actualStartTime = params.actualStartTime;
    this.actualEndTime = params.actualEndTime;
    this.status = params.status;
    this.recoveryTime = params.recoveryTime;
    this.dataLoss = params.dataLoss;
    this.issues = params.issues;
    this.recommendations = params.recommendations;
    this.executionReport = params.executionReport;
    this.createdAt = params.createdAt || new Date();
  }
}

/**
 * 灾难恢复节点实体
 */
export class RecoveryNode {
  /** 节点ID */
  id: string;
  /** 节点名称 */
  name: string;
  /** 节点类型（主节点/备用节点） */
  type: 'PRIMARY' | 'STANDBY';
  /** 节点状态 */
  status: 'HEALTHY' | 'UNHEALTHY' | 'MAINTENANCE' | 'FAILED';
  /** 节点角色（当前正在执行的角色） */
  currentRole: 'ACTIVE' | 'PASSIVE';
  /** 节点IP地址 */
  ipAddress: string;
  /** 节点端口 */
  port: number;
  /** 最后心跳时间 */
  lastHeartbeat: Date;
  /** 数据同步状态 */
  syncStatus: 'SYNCHRONIZED' | 'SYNCHRONIZING' | 'OUT_OF_SYNC';
  /** 同步延迟（毫秒） */
  syncDelay: number;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;

  /**
   * 构造函数
   * @param params 构造参数
   */
  constructor(params: {
    id: string;
    name: string;
    type: 'PRIMARY' | 'STANDBY';
    status: 'HEALTHY' | 'UNHEALTHY' | 'MAINTENANCE' | 'FAILED';
    currentRole: 'ACTIVE' | 'PASSIVE';
    ipAddress: string;
    port: number;
    lastHeartbeat: Date;
    syncStatus: 'SYNCHRONIZED' | 'SYNCHRONIZING' | 'OUT_OF_SYNC';
    syncDelay: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.type = params.type;
    this.status = params.status;
    this.currentRole = params.currentRole;
    this.ipAddress = params.ipAddress;
    this.port = params.port;
    this.lastHeartbeat = params.lastHeartbeat;
    this.syncStatus = params.syncStatus;
    this.syncDelay = params.syncDelay;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  /**
   * 更新节点状态
   * @param updates 更新字段
   */
  update(updates: Partial<Omit<RecoveryNode, 'id' | 'createdAt'>>): void {
    Object.assign(this, updates);
    this.updatedAt = new Date();
  }

  /**
   * 更新心跳时间
   */
  updateHeartbeat(): void {
    this.lastHeartbeat = new Date();
    this.updatedAt = new Date();
  }
}