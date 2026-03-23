/**
 * 版本管理服务接口
 * 负责管理模型版本，包括版本创建、查询、比较和管理
 */
export interface VersionManagementService {
  /**
   * 获取用户的所有模型版本
   * @param userId 用户ID
   * @param options 查询选项
   * @returns 版本列表
   */
  getVersions(userId: string, options?: VersionQueryOptions): Promise<ModelVersion[]>;

  /**
   * 根据版本ID获取版本信息
   * @param userId 用户ID
   * @param versionId 版本ID
   * @returns 版本信息
   */
  getVersionById(userId: string, versionId: string): Promise<ModelVersion | null>;

  /**
   * 创建模型版本
   * @param userId 用户ID
   * @param model 模型数据
   * @param options 版本创建选项
   * @returns 创建的版本
   */
  createVersion(userId: string, model: any, options?: VersionCreateOptions): Promise<ModelVersion>;

  /**
   * 更新版本信息
   * @param userId 用户ID
   * @param versionId 版本ID
   * @param updates 更新内容
   * @returns 更新后的版本
   */
  updateVersion(userId: string, versionId: string, updates: Partial<ModelVersion>): Promise<ModelVersion | null>;

  /**
   * 删除模型版本
   * @param userId 用户ID
   * @param versionId 版本ID
   * @returns 是否删除成功
   */
  deleteVersion(userId: string, versionId: string): Promise<boolean>;

  /**
   * 比较两个版本
   * @param userId 用户ID
   * @param version1 版本1 ID
   * @param version2 版本2 ID
   * @returns 版本比较结果
   */
  compareVersions(userId: string, version1: string, version2: string): Promise<VersionComparisonResult>;

  /**
   * 获取最新版本
   * @param userId 用户ID
   * @returns 最新版本
   */
  getLatestVersion(userId: string): Promise<ModelVersion | null>;

  /**
   * 获取版本历史
   * @param userId 用户ID
   * @param timeRange 时间范围
   * @returns 版本历史
   */
  getVersionHistory(userId: string, timeRange?: TimeRange): Promise<ModelVersion[]>;
}

/**
 * 版本查询选项
 */
export interface VersionQueryOptions {
  /**
   * 创建时间范围
   */
  createdAtRange?: {
    start: Date;
    end: Date;
  };
  /**
   * 版本名称过滤
   */
  name?: string;
  /**
   * 版本标签过滤
   */
  tags?: string[];
  /**
   * 分页选项
   */
  pagination?: {
    page: number;
    limit: number;
  };
}

/**
 * 版本创建选项
 */
export interface VersionCreateOptions {
  /**
   * 版本名称
   */
  name?: string;
  /**
   * 版本标签
   */
  tags?: string[];
  /**
   * 版本描述
   */
  description?: string;
  /**
   * 是否标记为主要版本
   */
  isMajor?: boolean;
}

/**
 * 模型版本
 */
export interface ModelVersion {
  /**
   * 版本ID
   */
  id: string;
  /**
   * 版本名称
   */
  name: string;
  /**
   * 版本号
   */
  version: string;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 模型ID
   */
  modelId: string;
  /**
   * 版本描述
   */
  description?: string;
  /**
   * 版本标签
   */
  tags?: string[];
  /**
   * 创建时间
   */
  createdAt: Date;
  /**
   * 更新时间
   */
  updatedAt: Date;
  /**
   * 是否为主要版本
   */
  isMajor: boolean;
  /**
   * 版本状态
   */
  status: VersionStatus;
  /**
   * 版本统计信息
   */
  statistics?: VersionStatistics;
}

/**
 * 版本状态
 */
export enum VersionStatus {
  /**
   * 草稿状态
   */
  DRAFT = 'DRAFT',
  /**
   * 已发布状态
   */
  PUBLISHED = 'PUBLISHED',
  /**
   * 已归档状态
   */
  ARCHIVED = 'ARCHIVED',
  /**
   * 已废弃状态
   */
  DEPRECATED = 'DEPRECATED'
}

/**
 * 版本统计信息
 */
export interface VersionStatistics {
  /**
   * 概念数量
   */
  conceptCount: number;
  /**
   * 关系数量
   */
  relationCount: number;
  /**
   * 模型大小
   */
  modelSize: number;
  /**
   * 版本创建耗时
   */
  creationTime: number;
}

/**
 * 版本比较结果
 */
export interface VersionComparisonResult {
  /**
   * 比较ID
   */
  id: string;
  /**
   * 版本1 ID
   */
  version1: string;
  /**
   * 版本2 ID
   */
  version2: string;
  /**
   * 比较时间
   */
  comparedAt: Date;
  /**
   * 概念差异
   */
  conceptDiff: ConceptDifference;
  /**
   * 关系差异
   */
  relationDiff: RelationDifference;
  /**
   * 统计信息
   */
  statistics: ComparisonStatistics;
  /**
   * 变更摘要
   */
  changeSummary: string;
}

/**
 * 概念差异
 */
export interface ConceptDifference {
  /**
   * 新增概念
   */
  added: string[];
  /**
   * 更新概念
   */
  updated: string[];
  /**
   * 删除概念
   */
  removed: string[];
  /**
   * 重命名概念
   */
  renamed: Array<{ oldName: string; newName: string }>;
}

/**
 * 关系差异
 */
export interface RelationDifference {
  /**
   * 新增关系
   */
  added: string[];
  /**
   * 更新关系
   */
  updated: string[];
  /**
   * 删除关系
   */
  removed: string[];
}

/**
 * 比较统计信息
 */
export interface ComparisonStatistics {
  /**
   * 总变更数量
   */
  totalChanges: number;
  /**
   * 概念变更数量
   */
  conceptChanges: number;
  /**
   * 关系变更数量
   */
  relationChanges: number;
  /**
   * 变更百分比
   */
  changePercentage: number;
}

/**
 * 时间范围
 */
export interface TimeRange {
  /**
   * 开始时间
   */
  start: Date;
  /**
   * 结束时间
   */
  end: Date;
}