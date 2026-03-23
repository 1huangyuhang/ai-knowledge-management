// 演化历史相关接口定义
import { 
  ModelEvolutionEvent, 
  EvolutionHistoryQueryOptions, 
  ModelSnapshot, 
  ModelVersionDiff, 
  HistoryRetentionPolicy, 
  HistoryCleanupResult, 
  ExportFormat, 
  ExportOptions, 
  ExportedHistory, 
  TimeRange, 
  EvolutionStatistics, 
  VersionComparisonReport, 
  ConceptDiff, 
  RelationDiff, 
  ModelSnapshotDiff,
  SnapshotQueryOptions
} from '../types/evolution-history.types';

// 演化事件仓库接口
export interface EvolutionEventRepository {
  /**
   * 保存演化事件
   * @param event 演化事件
   */
  save(event: ModelEvolutionEvent): Promise<void>;
  
  /**
   * 根据查询条件查找演化事件
   * @param query 查询条件
   */
  find(query: any): Promise<ModelEvolutionEvent[]>;
  
  /**
   * 根据ID获取演化事件
   * @param id 事件ID
   */
  findById(id: string): Promise<ModelEvolutionEvent | null>;
  
  /**
   * 根据用户ID和版本获取演化事件
   * @param userId 用户ID
   * @param version 版本号
   */
  findByUserIdAndVersion(userId: string, version: string): Promise<ModelEvolutionEvent[]>;
  
  /**
   * 根据时间范围删除演化事件
   * @param startTime 开始时间
   * @param endTime 结束时间
   */
  deleteByTimeRange(startTime: Date, endTime: Date): Promise<number>;
  
  /**
   * 根据用户ID删除演化事件
   * @param userId 用户ID
   */
  deleteByUserId(userId: string): Promise<number>;
}

// 模型快照仓库接口
export interface SnapshotRepository {
  /**
   * 保存模型快照
   * @param snapshot 模型快照
   */
  save(snapshot: ModelSnapshot): Promise<void>;
  
  /**
   * 根据ID获取模型快照
   * @param id 快照ID
   */
  findById(id: string): Promise<ModelSnapshot | null>;
  
  /**
   * 根据用户ID和版本获取模型快照
   * @param userId 用户ID
   * @param version 版本号
   */
  findByUserIdAndVersion(userId: string, version: string): Promise<ModelSnapshot | null>;
  
  /**
   * 根据查询条件查找模型快照
   * @param query 查询条件
   */
  find(query: any): Promise<ModelSnapshot[]>;
  
  /**
   * 根据时间范围删除模型快照
   * @param startTime 开始时间
   * @param endTime 结束时间
   */
  deleteByTimeRange(startTime: Date, endTime: Date): Promise<number>;
  
  /**
   * 根据用户ID删除模型快照
   * @param userId 用户ID
   */
  deleteByUserId(userId: string): Promise<number>;
}

// 压缩服务接口
export interface CompressionService {
  /**
   * 压缩数据
   * @param data 原始数据
   */
  compress(data: string): Promise<string>;
  
  /**
   * 解压缩数据
   * @param compressedData 压缩数据
   */
  decompress(compressedData: string): Promise<string>;
}

// 加密服务接口
export interface EncryptionService {
  /**
   * 加密数据
   * @param data 原始数据
   */
  encrypt(data: string): Promise<string>;
  
  /**
   * 解密数据
   * @param encryptedData 加密数据
   */
  decrypt(encryptedData: string): Promise<string>;
}

// 演化历史记录服务接口
export interface EvolutionHistoryService {
  /**
   * 记录模型演化事件
   * @param event 演化事件
   * @returns 记录结果
   */
  recordEvolutionEvent(event: ModelEvolutionEvent): Promise<boolean>;

  /**
   * 获取模型演化历史
   * @param userId 用户ID
   * @param options 查询选项
   * @returns 演化事件列表
   */
  getEvolutionHistory(userId: string, options?: EvolutionHistoryQueryOptions): Promise<ModelEvolutionEvent[]>;

  /**
   * 获取特定版本的模型快照
   * @param userId 用户ID
   * @param versionId 版本ID
   * @returns 模型快照
   */
  getModelSnapshot(userId: string, versionId: string): Promise<ModelSnapshot | null>;

  /**
   * 获取模型版本之间的差异
   * @param userId 用户ID
   * @param fromVersion 起始版本
   * @param toVersion 结束版本
   * @returns 版本差异
   */
  getVersionDiff(userId: string, fromVersion: string, toVersion: string): Promise<ModelVersionDiff>;

  /**
   * 清理旧的演化历史
   * @param userId 用户ID
   * @param retentionPolicy 保留策略
   * @returns 清理结果
   */
  cleanupOldHistory(userId: string, retentionPolicy: HistoryRetentionPolicy): Promise<HistoryCleanupResult>;

  /**
   * 导出演化历史
   * @param userId 用户ID
   * @param format 导出格式
   * @param options 导出选项
   * @returns 导出数据
   */
  exportEvolutionHistory(userId: string, format: ExportFormat, options?: ExportOptions): Promise<ExportedHistory>;

  /**
   * 获取模型演化统计信息
   * @param userId 用户ID
   * @param timeRange 时间范围
   * @returns 统计信息
   */
  getEvolutionStatistics(userId: string, timeRange: TimeRange): Promise<EvolutionStatistics>;
}

// 模型快照服务接口
export interface ModelSnapshotService {
  /**
   * 创建模型快照
   * @param userId 用户ID
   * @param model 当前模型
   * @param versionId 版本ID
   * @returns 快照创建结果
   */
  createSnapshot(userId: string, model: any, versionId: string): Promise<ModelSnapshot>;

  /**
   * 获取模型快照
   * @param userId 用户ID
   * @param snapshotId 快照ID
   * @returns 模型快照
   */
  getSnapshot(userId: string, snapshotId: string): Promise<ModelSnapshot | null>;

  /**
   * 获取模型快照列表
   * @param userId 用户ID
   * @param options 查询选项
   * @returns 快照列表
   */
  getSnapshots(userId: string, options?: SnapshotQueryOptions): Promise<ModelSnapshot[]>;

  /**
   * 删除模型快照
   * @param userId 用户ID
   * @param snapshotId 快照ID
   * @returns 删除结果
   */
  deleteSnapshot(userId: string, snapshotId: string): Promise<boolean>;

  /**
   * 比较两个模型快照
   * @param snapshot1 快照1
   * @param snapshot2 快照2
   * @returns 快照差异
   */
  compareSnapshots(snapshot1: ModelSnapshot, snapshot2: ModelSnapshot): Promise<ModelSnapshotDiff>;
  
  /**
   * 根据版本ID获取模型快照
   * @param userId 用户ID
   * @param versionId 版本ID
   * @returns 模型快照
   */
  getModelSnapshot(userId: string, versionId: string): Promise<ModelSnapshot | null>;
  
  /**
   * 恢复模型从快照
   * @param snapshot 模型快照
   * @returns 恢复的模型
   */
  restoreModelFromSnapshot(snapshot: ModelSnapshot): Promise<any>;
}

// 版本对比服务接口
export interface VersionComparisonService {
  /**
   * 比较两个版本的模型
   * @param userId 用户ID
   * @param version1 版本1
   * @param version2 版本2
   * @returns 版本差异
   */
  compareVersions(userId: string, version1: string, version2: string): Promise<ModelVersionDiff>;

  /**
   * 获取版本之间的概念差异
   * @param userId 用户ID
   * @param version1 版本1
   * @param version2 版本2
   * @returns 概念差异
   */
  getConceptDiff(userId: string, version1: string, version2: string): Promise<ConceptDiff>;

  /**
   * 获取版本之间的关系差异
   * @param userId 用户ID
   * @param version1 版本1
   * @param version2 版本2
   * @returns 关系差异
   */
  getRelationDiff(userId: string, version1: string, version2: string): Promise<RelationDiff>;

  /**
   * 生成版本对比报告
   * @param userId 用户ID
   * @param version1 版本1
   * @param version2 版本2
   * @returns 对比报告
   */
  generateComparisonReport(userId: string, version1: string, version2: string): Promise<VersionComparisonReport>;
}

// 演化历史服务工厂接口
export interface EvolutionHistoryServiceFactory {
  /**
   * 创建演化历史服务实例
   */
  create(): EvolutionHistoryService;
}

// 模型快照服务工厂接口
export interface ModelSnapshotServiceFactory {
  /**
   * 创建模型快照服务实例
   */
  create(): ModelSnapshotService;
}

// 版本对比服务工厂接口
export interface VersionComparisonServiceFactory {
  /**
   * 创建版本对比服务实例
   */
  create(): VersionComparisonService;
}
