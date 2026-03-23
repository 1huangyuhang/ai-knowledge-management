/**
 * 版本管理服务实现类
 */
import { v4 as uuidv4 } from 'uuid';
import { 
  VersionManagementService, 
  ModelVersion, 
  VersionQueryOptions, 
  VersionCreateOptions, 
  VersionComparisonResult,
  VersionStatus
} from './version-management-service';
import { VersionRepository } from '../interfaces/version-repository.interface';
import { ModelSnapshotService } from '../interfaces/evolution-history.interface';

/**
 * 版本管理服务实现类
 */
export class VersionManagementServiceImpl implements VersionManagementService {
  private versionRepository: VersionRepository;
  private modelSnapshotService: ModelSnapshotService;

  /**
   * 构造函数
   * @param versionRepository 版本仓库
   * @param modelSnapshotService 模型快照服务
   */
  constructor(
    versionRepository: VersionRepository,
    modelSnapshotService: ModelSnapshotService
  ) {
    this.versionRepository = versionRepository;
    this.modelSnapshotService = modelSnapshotService;
  }

  /**
   * 获取用户的所有模型版本
   * @param userId 用户ID
   * @param options 查询选项
   * @returns 版本列表
   */
  async getVersions(userId: string, options?: VersionQueryOptions): Promise<ModelVersion[]> {
    return this.versionRepository.find(userId, options || {});
  }

  /**
   * 根据版本ID获取版本信息
   * @param userId 用户ID
   * @param versionId 版本ID
   * @returns 版本信息
   */
  async getVersionById(userId: string, versionId: string): Promise<ModelVersion | null> {
    return this.versionRepository.findById(userId, versionId);
  }

  /**
   * 创建模型版本
   * @param userId 用户ID
   * @param model 模型数据
   * @param options 版本创建选项
   * @returns 创建的版本
   */
  async createVersion(userId: string, model: any, options?: VersionCreateOptions): Promise<ModelVersion> {
    // 生成版本号
    const versionNumber = this.generateVersionNumber();
    
    // 创建版本记录
    const version: ModelVersion = {
      id: uuidv4(),
      name: options?.name || `Version ${versionNumber}`,
      version: versionNumber,
      userId,
      modelId: model.id,
      description: options?.description,
      tags: options?.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isMajor: options?.isMajor || false,
      status: VersionStatus.PUBLISHED,
      statistics: {
        conceptCount: model.concepts?.length || 0,
        relationCount: model.relations?.length || 0,
        modelSize: this.calculateModelSize(model),
        creationTime: Date.now()
      }
    };
    
    // 保存版本
    return this.versionRepository.save(version);
  }

  /**
   * 更新版本信息
   * @param userId 用户ID
   * @param versionId 版本ID
   * @param updates 更新内容
   * @returns 更新后的版本
   */
  async updateVersion(userId: string, versionId: string, updates: Partial<ModelVersion>): Promise<ModelVersion | null> {
    const version = await this.versionRepository.findById(userId, versionId);
    if (!version) {
      return null;
    }
    
    // 更新版本
    const updatedVersion = {
      ...version,
      ...updates,
      updatedAt: new Date()
    };
    
    return this.versionRepository.save(updatedVersion);
  }

  /**
   * 删除模型版本
   * @param userId 用户ID
   * @param versionId 版本ID
   * @returns 是否删除成功
   */
  async deleteVersion(userId: string, versionId: string): Promise<boolean> {
    return this.versionRepository.delete(userId, versionId);
  }

  /**
   * 比较两个版本
   * @param userId 用户ID
   * @param version1 版本1 ID
   * @param version2 版本2 ID
   * @returns 版本比较结果
   */
  async compareVersions(userId: string, version1: string, version2: string): Promise<VersionComparisonResult> {
    // 获取两个版本的快照
    const snapshot1 = await this.modelSnapshotService.getModelSnapshot(userId, version1);
    const snapshot2 = await this.modelSnapshotService.getModelSnapshot(userId, version2);
    
    if (!snapshot1 || !snapshot2) {
      throw new Error('One or both versions not found');
    }
    
    // 比较概念
    const conceptDiff = this.compareConcepts(snapshot1.data, snapshot2.data);
    
    // 比较关系
    const relationDiff = this.compareRelations(snapshot1.data, snapshot2.data);
    
    // 计算统计信息
    const totalChanges = 
      conceptDiff.added.length + conceptDiff.updated.length + conceptDiff.removed.length +
      relationDiff.added.length + relationDiff.updated.length + relationDiff.removed.length;
    
    const conceptChanges = 
      conceptDiff.added.length + conceptDiff.updated.length + conceptDiff.removed.length;
    
    const relationChanges = 
      relationDiff.added.length + relationDiff.updated.length + relationDiff.removed.length;
    
    // 计算变更百分比
    const totalConceptsAndRelations = 
      snapshot1.data.concepts.length + snapshot1.data.relations.length;
    
    const changePercentage = totalConceptsAndRelations > 0 
      ? (totalChanges / totalConceptsAndRelations) * 100 
      : 0;
    
    // 生成变更摘要
    const changeSummary = this.generateChangeSummary(conceptDiff, relationDiff);
    
    // 构建比较结果
    return {
      id: uuidv4(),
      version1,
      version2,
      comparedAt: new Date(),
      conceptDiff,
      relationDiff,
      statistics: {
        totalChanges,
        conceptChanges,
        relationChanges,
        changePercentage
      },
      changeSummary
    };
  }

  /**
   * 获取最新版本
   * @param userId 用户ID
   * @returns 最新版本
   */
  async getLatestVersion(userId: string): Promise<ModelVersion | null> {
    const options: VersionQueryOptions = {
      pagination: {
        page: 1,
        limit: 1
      }
    };
    
    const versions = await this.versionRepository.find(userId, options);
    return versions.length > 0 ? versions[0] : null;
  }

  /**
   * 获取版本历史
   * @param userId 用户ID
   * @param timeRange 时间范围
   * @returns 版本历史
   */
  async getVersionHistory(userId: string, timeRange?: { start: Date; end: Date }): Promise<ModelVersion[]> {
    const options: VersionQueryOptions = {};
    if (timeRange) {
      options.createdAtRange = timeRange;
    }
    
    return this.versionRepository.find(userId, options);
  }

  /**
   * 生成版本号
   * @returns 版本号
   */
  private generateVersionNumber(): string {
    // 简单实现：使用时间戳
    return `v${Date.now()}`;
  }

  /**
   * 计算模型大小
   * @param model 模型数据
   * @returns 模型大小（字节）
   */
  private calculateModelSize(model: any): number {
    try {
      const modelString = JSON.stringify(model);
      return Buffer.byteLength(modelString, 'utf8');
    } catch (error) {
      return 0;
    }
  }

  /**
   * 比较概念差异
   * @param model1 模型1
   * @param model2 模型2
   * @returns 概念差异
   */
  private compareConcepts(model1: any, model2: any): any {
    const concepts1 = new Map(model1.concepts.map((c: any) => [c.id, c]));
    const concepts2 = new Map(model2.concepts.map((c: any) => [c.id, c]));
    
    const added: string[] = [];
    const updated: string[] = [];
    const removed: string[] = [];
    const renamed: Array<{ oldName: string; newName: string }> = [];
    
    // 检查新增和更新的概念
    for (const [id, concept2] of concepts2) {
      if (!concepts1.has(id)) {
        added.push(id);
      } else {
        const concept1 = concepts1.get(id);
        if (JSON.stringify(concept1) !== JSON.stringify(concept2)) {
          updated.push(id);
          if (concept1.name !== concept2.name) {
            renamed.push({ oldName: concept1.name, newName: concept2.name });
          }
        }
      }
    }
    
    // 检查删除的概念
    for (const [id] of concepts1) {
      if (!concepts2.has(id)) {
        removed.push(id);
      }
    }
    
    return { added, updated, removed, renamed };
  }

  /**
   * 比较关系差异
   * @param model1 模型1
   * @param model2 模型2
   * @returns 关系差异
   */
  private compareRelations(model1: any, model2: any): any {
    const relations1 = new Map(model1.relations.map((r: any) => [this.getRelationKey(r), r]));
    const relations2 = new Map(model2.relations.map((r: any) => [this.getRelationKey(r), r]));
    
    const added: string[] = [];
    const updated: string[] = [];
    const removed: string[] = [];
    
    // 检查新增和更新的关系
    for (const [key, relation2] of relations2) {
      if (!relations1.has(key)) {
        added.push(key);
      } else {
        const relation1 = relations1.get(key);
        if (JSON.stringify(relation1) !== JSON.stringify(relation2)) {
          updated.push(key);
        }
      }
    }
    
    // 检查删除的关系
    for (const [key] of relations1) {
      if (!relations2.has(key)) {
        removed.push(key);
      }
    }
    
    return { added, updated, removed };
  }

  /**
   * 获取关系的唯一键
   * @param relation 关系
   * @returns 关系的唯一键
   */
  private getRelationKey(relation: any): string {
    return `${relation.sourceConceptId}_${relation.targetConceptId}_${relation.type}`;
  }

  /**
   * 生成变更摘要
   * @param conceptDiff 概念差异
   * @param relationDiff 关系差异
   * @returns 变更摘要
   */
  private generateChangeSummary(conceptDiff: any, relationDiff: any): string {
    const summary = [];
    
    if (conceptDiff.added.length > 0) {
      summary.push(`新增了 ${conceptDiff.added.length} 个概念`);
    }
    
    if (conceptDiff.updated.length > 0) {
      summary.push(`更新了 ${conceptDiff.updated.length} 个概念`);
    }
    
    if (conceptDiff.removed.length > 0) {
      summary.push(`删除了 ${conceptDiff.removed.length} 个概念`);
    }
    
    if (conceptDiff.renamed.length > 0) {
      summary.push(`重命名了 ${conceptDiff.renamed.length} 个概念`);
    }
    
    if (relationDiff.added.length > 0) {
      summary.push(`新增了 ${relationDiff.added.length} 个关系`);
    }
    
    if (relationDiff.updated.length > 0) {
      summary.push(`更新了 ${relationDiff.updated.length} 个关系`);
    }
    
    if (relationDiff.removed.length > 0) {
      summary.push(`删除了 ${relationDiff.removed.length} 个关系`);
    }
    
    return summary.join('，');
  }
}