// 演化历史类型定义

// 模型演化事件类型
export enum ModelEvolutionEventType {
  // 模型创建
  MODEL_CREATED = 'MODEL_CREATED',
  // 模型更新
  MODEL_UPDATED = 'MODEL_UPDATED',
  // 概念添加
  CONCEPT_ADDED = 'CONCEPT_ADDED',
  // 概念更新
  CONCEPT_UPDATED = 'CONCEPT_UPDATED',
  // 概念删除
  CONCEPT_REMOVED = 'CONCEPT_REMOVED',
  // 关系添加
  RELATION_ADDED = 'RELATION_ADDED',
  // 关系更新
  RELATION_UPDATED = 'RELATION_UPDATED',
  // 关系删除
  RELATION_REMOVED = 'RELATION_REMOVED',
  // 模型重构
  MODEL_RESTRUCTURED = 'MODEL_RESTRUCTURED',
  // 模型版本化
  MODEL_VERSIONED = 'MODEL_VERSIONED'
}

// 快照类型
export enum SnapshotType {
  // 自动创建的快照
  AUTO = 'AUTO',
  // 用户手动创建的快照
  MANUAL = 'MANUAL',
  // 版本化快照
  VERSIONED = 'VERSIONED',
  // 备份快照
  BACKUP = 'BACKUP'
}

// 演化历史服务错误类型
export enum EvolutionHistoryErrorType {
  // 事件数据无效
  INVALID_EVENT_DATA = 'INVALID_EVENT_DATA',
  // 快照创建失败
  SNAPSHOT_CREATION_FAILED = 'SNAPSHOT_CREATION_FAILED',
  // 快照恢复失败
  SNAPSHOT_RECOVERY_FAILED = 'SNAPSHOT_RECOVERY_FAILED',
  // 版本对比失败
  VERSION_COMPARISON_FAILED = 'VERSION_COMPARISON_FAILED',
  // 历史数据查询失败
  HISTORY_QUERY_FAILED = 'HISTORY_QUERY_FAILED',
  // 数据清理失败
  DATA_CLEANUP_FAILED = 'DATA_CLEANUP_FAILED',
  // 数据导出失败
  DATA_EXPORT_FAILED = 'DATA_EXPORT_FAILED'
}

// 演化事件查询选项
export interface EvolutionHistoryQueryOptions {
  // 事件类型过滤
  eventTypes?: ModelEvolutionEventType[];
  // 开始时间
  startTime?: Date;
  // 结束时间
  endTime?: Date;
  // 版本过滤
  versions?: string[];
  // 分页大小
  limit?: number;
  // 分页偏移
  offset?: number;
  // 排序字段
  sortBy?: 'timestamp' | 'version';
  // 排序方向
  sortOrder?: 'asc' | 'desc';
}

// 快照查询选项
export interface SnapshotQueryOptions {
  // 快照类型过滤
  snapshotTypes?: SnapshotType[];
  // 开始时间
  startTime?: Date;
  // 结束时间
  endTime?: Date;
  // 版本过滤
  versions?: string[];
  // 分页大小
  limit?: number;
  // 分页偏移
  offset?: number;
  // 排序字段
  sortBy?: 'createdAt' | 'version';
  // 排序方向
  sortOrder?: 'asc' | 'desc';
}

// 历史保留策略
export interface HistoryRetentionPolicy {
  // 保留天数
  retentionDays: number;
  // 是否归档旧数据
  archiveOldData: boolean;
  // 归档路径
  archivePath?: string;
}

// 历史清理结果
export interface HistoryCleanupResult {
  // 清理的事件数量
  eventsCleaned: number;
  // 清理的快照数量
  snapshotsCleaned: number;
  // 归档的事件数量
  eventsArchived: number;
  // 归档的快照数量
  snapshotsArchived: number;
  // 清理时间
  cleanupTime: Date;
}

// 导出格式
export enum ExportFormat {
  JSON = 'JSON',
  CSV = 'CSV',
  XML = 'XML'
}

// 导出选项
export interface ExportOptions {
  // 是否包含快照数据
  includeSnapshots?: boolean;
  // 开始时间
  startTime?: Date;
  // 结束时间
  endTime?: Date;
  // 事件类型过滤
  eventTypes?: ModelEvolutionEventType[];
}

// 导出历史数据
export interface ExportedHistory {
  // 导出ID
  id: string;
  // 导出时间
  exportTime: Date;
  // 导出格式
  format: ExportFormat;
  // 导出数据
  data: string;
  // 元数据
  metadata: {
    // 事件数量
    eventCount: number;
    // 快照数量
    snapshotCount: number;
    // 数据大小（字节）
    sizeInBytes: number;
  };
}

// 时间范围
export interface TimeRange {
  // 开始时间
  startTime: Date;
  // 结束时间
  endTime: Date;
}

// 演化统计信息
export interface EvolutionStatistics {
  // 统计ID
  id: string;
  // 用户ID
  userId: string;
  // 统计时间范围
  timeRange: TimeRange;
  // 事件统计
  eventStats: {
    // 总事件数
    totalEvents: number;
    // 事件类型分布
    eventTypeDistribution: Record<ModelEvolutionEventType, number>;
    // 日均事件数
    dailyAverage: number;
  };
  // 快照统计
  snapshotStats: {
    // 总快照数
    totalSnapshots: number;
    // 快照类型分布
    snapshotTypeDistribution: Record<SnapshotType, number>;
    // 模型大小变化
    modelSizeChange: {
      // 起始大小
      startSize: number;
      // 结束大小
      endSize: number;
      // 变化量
      change: number;
      // 变化百分比
      changePercentage: number;
    };
  };
  // 概念和关系统计
  structureStats: {
    // 概念数量变化
    conceptCountChange: {
      // 起始数量
      startCount: number;
      // 结束数量
      endCount: number;
      // 变化量
      change: number;
      // 变化百分比
      changePercentage: number;
    };
    // 关系数量变化
    relationCountChange: {
      // 起始数量
      startCount: number;
      // 结束数量
      endCount: number;
      // 变化量
      change: number;
      // 变化百分比
      changePercentage: number;
    };
  };
}

// 概念更新
export interface ConceptUpdate {
  // 概念ID
  conceptId: string;
  // 旧概念数据
  oldConcept: any;
  // 新概念数据
  newConcept: any;
  // 变更字段
  changedFields: string[];
}

// 关系更新
export interface RelationUpdate {
  // 关系ID
  relationId: string;
  // 旧关系数据
  oldRelation: any;
  // 新关系数据
  newRelation: any;
  // 变更字段
  changedFields: string[];
}

// 概念差异
export interface ConceptDiff {
  // 新增概念
  added: any[];
  // 更新的概念
  updated: ConceptUpdate[];
  // 删除的概念ID
  removed: string[];
}

// 关系差异
export interface RelationDiff {
  // 新增关系
  added: any[];
  // 更新的关系
  updated: RelationUpdate[];
  // 删除的关系ID
  removed: string[];
}

// 模型版本差异
export interface ModelVersionDiff {
  // 差异ID
  id: string;
  // 用户ID
  userId: string;
  // 起始版本
  fromVersion: string;
  // 结束版本
  toVersion: string;
  // 差异计算时间
  calculatedAt: Date;
  // 概念差异
  conceptDiff: ConceptDiff;
  // 关系差异
  relationDiff: RelationDiff;
  // 统计信息
  statistics: {
    // 总变化数
    totalChanges: number;
    // 概念变化数
    conceptChanges: number;
    // 关系变化数
    relationChanges: number;
    // 变化百分比
    changePercentage: number;
  };
}

// 版本对比报告
export interface VersionComparisonReport {
  // 报告ID
  id: string;
  // 用户ID
  userId: string;
  // 比较的版本
  comparedVersions: {
    // 版本1
    version1: string;
    // 版本2
    version2: string;
  };
  // 报告生成时间
  generatedAt: Date;
  // 版本差异
  versionDiff: ModelVersionDiff;
  // 总结
  summary: {
    // 主要变化
    keyChanges: string[];
    // 变化影响
    changeImpact: string;
    // 建议
    recommendations: string[];
  };
}

// 模型快照
export interface ModelSnapshot {
  // 快照ID
  id: string;
  // 用户ID
  userId: string;
  // 模型版本
  version: string;
  // 快照创建时间
  createdAt: Date;
  // 快照类型
  type: SnapshotType;
  // 快照数据
  data: {
    // 概念数量
    conceptCount: number;
    // 关系数量
    relationCount: number;
    // 模型大小（字节）
    sizeInBytes: number;
    // 压缩后的模型数据
    compressedModelData: string;
    // 模型哈希值（用于完整性校验）
    modelHash: string;
  };
  // 快照元数据
  metadata: {
    // 快照描述
    description?: string;
    // 创建原因
    creationReason?: string;
    // 系统版本
    systemVersion: string;
  };
}

// 模型快照差异
export interface ModelSnapshotDiff {
  // 差异ID
  id: string;
  // 快照1 ID
  snapshotId1: string;
  // 快照2 ID
  snapshotId2: string;
  // 差异计算时间
  calculatedAt: Date;
  // 概念差异
  conceptDiff: ConceptDiff;
  // 关系差异
  relationDiff: RelationDiff;
  // 统计信息
  statistics: {
    // 总变化数
    totalChanges: number;
    // 概念变化数
    conceptChanges: number;
    // 关系变化数
    relationChanges: number;
    // 变化百分比
    changePercentage: number;
  };
}

// 模型演化事件
export interface ModelEvolutionEvent {
  // 事件ID
  id: string;
  // 用户ID
  userId: string;
  // 事件类型
  type: ModelEvolutionEventType;
  // 当前模型版本
  version: string;
  // 事件发生时间
  timestamp: Date;
  // 事件详细数据
  data: {
    // 相关概念ID（如果有）
    conceptIds?: string[];
    // 相关关系ID（如果有）
    relationIds?: string[];
    // 更新前版本（如果是更新事件）
    fromVersion?: string;
    // 更新后版本（如果是更新事件）
    toVersion?: string;
    // 更新来源
    source?: string;
    // 更新置信度
    confidenceScore?: number;
    // 相关思维片段ID
    relatedThoughtIds?: string[];
    // 事件描述
    description?: string;
  };
  // 事件元数据
  metadata: {
    // 系统版本
    systemVersion: string;
    // 处理节点ID
    nodeId: string;
    // 是否为系统事件
    isSystemEvent: boolean;
  };
}

// 演化历史服务配置
export interface EvolutionHistoryServiceConfig {
  // 演化事件保留天数
  eventRetentionDays: number;
  // 模型快照保留天数
  snapshotRetentionDays: number;
  // 是否启用事件压缩
  enableEventCompression: boolean;
  // 是否启用快照压缩
  enableSnapshotCompression: boolean;
  // 是否启用数据加密
  enableEncryption: boolean;
  // 查询结果缓存过期时间（秒）
  queryCacheExpirationSeconds: number;
  // 最大查询结果数量
  maxQueryResults: number;
  // 清理任务执行间隔（小时）
  cleanupIntervalHours: number;
  // 自动快照创建条件
  autoSnapshotConditions: {
    // 版本变化阈值
    versionChangeThreshold: number;
    // 时间间隔（小时）
    timeIntervalHours: number;
  };
}
