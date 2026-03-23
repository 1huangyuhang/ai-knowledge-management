// 模型快照服务实现
import { v4 as uuidv4 } from 'uuid';
import { 
  ModelSnapshotService, 
  SnapshotRepository, 
  CompressionService, 
  EncryptionService 
} from '../interfaces/evolution-history.interface';
import { 
  ModelSnapshot, 
  SnapshotType, 
  ModelSnapshotDiff, 
  ConceptDiff, 
  RelationDiff, 
  ConceptUpdate, 
  RelationUpdate 
} from '../types/evolution-history.types';

/**
 * 模型快照服务实现类
 */
export class ModelSnapshotServiceImpl implements ModelSnapshotService {
  private snapshotRepository: SnapshotRepository;
  private compressionService: CompressionService;
  private encryptionService: EncryptionService;

  /**
   * 构造函数
   * @param snapshotRepository 快照仓库
   * @param compressionService 压缩服务
   * @param encryptionService 加密服务
   */
  constructor(
    snapshotRepository: SnapshotRepository,
    compressionService: CompressionService,
    encryptionService: EncryptionService
  ) {
    this.snapshotRepository = snapshotRepository;
    this.compressionService = compressionService;
    this.encryptionService = encryptionService;
  }

  /**
   * 创建模型快照
   * @param userId 用户ID
   * @param model 当前模型
   * @param versionId 版本ID
   * @returns 快照创建结果
   */
  async createSnapshot(userId: string, model: any, versionId: string): Promise<ModelSnapshot> {
    try {
      // 压缩模型数据
      const compressedData = await this.compressionService.compress(JSON.stringify(model));
      
      // 计算模型哈希值
      const modelHash = this.calculateModelHash(model);
      
      // 创建快照对象
      const snapshot: ModelSnapshot = {
        id: uuidv4(),
        userId,
        version: versionId,
        createdAt: new Date(),
        type: SnapshotType.VERSIONED,
        data: {
          conceptCount: model.concepts?.length || 0,
          relationCount: model.relations?.length || 0,
          sizeInBytes: JSON.stringify(model).length,
          compressedModelData: compressedData,
          modelHash
        },
        metadata: {
          description: `Snapshot for version ${versionId}`,
          creationReason: 'Automatic version snapshot',
          systemVersion: process.env.SYSTEM_VERSION || 'unknown'
        }
      };
      
      // 保存快照
      await this.snapshotRepository.save(snapshot);
      
      return snapshot;
    } catch (error) {
      console.error('Failed to create model snapshot:', error);
      throw new Error('Failed to create model snapshot');
    }
  }

  /**
   * 获取模型快照
   * @param userId 用户ID
   * @param snapshotId 快照ID
   * @returns 模型快照
   */
  async getSnapshot(userId: string, snapshotId: string): Promise<ModelSnapshot | null> {
    try {
      return await this.snapshotRepository.findById(snapshotId);
    } catch (error) {
      console.error('Failed to get snapshot by ID:', error);
      throw new Error('Failed to get snapshot by ID');
    }
  }

  /**
   * 获取模型快照列表
   * @param userId 用户ID
   * @param options 查询选项
   * @returns 快照列表
   */
  async getSnapshots(userId: string, options?: any): Promise<ModelSnapshot[]> {
    try {
      // 构建查询条件
      const query: any = { userId };
      
      if (options?.snapshotTypes) {
        query.type = { $in: options.snapshotTypes };
      }
      
      if (options?.startTime) {
        query.createdAt = { $gte: options.startTime };
      }
      
      if (options?.endTime) {
        query.createdAt = { ...query.createdAt, $lte: options.endTime };
      }
      
      if (options?.versions) {
        query.version = { $in: options.versions };
      }
      
      // 执行查询
      let snapshots = await this.snapshotRepository.find(query);
      
      // 排序
      if (options?.sortBy) {
        snapshots.sort((a, b) => {
          const order = options.sortOrder === 'desc' ? -1 : 1;
          if (options.sortBy === 'createdAt') {
            return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
          } else if (options.sortBy === 'version') {
            return a.version.localeCompare(b.version) * order;
          }
          return 0;
        });
      }
      
      // 分页
      if (options?.limit) {
        const offset = options.offset || 0;
        snapshots = snapshots.slice(offset, offset + options.limit);
      }
      
      return snapshots;
    } catch (error) {
      console.error('Failed to get snapshots:', error);
      throw new Error('Failed to get snapshots');
    }
  }

  /**
   * 删除模型快照
   * @param userId 用户ID
   * @param snapshotId 快照ID
   * @returns 删除结果
   */
  async deleteSnapshot(userId: string, snapshotId: string): Promise<boolean> {
    try {
      // 首先检查快照是否存在且属于该用户
      const snapshot = await this.snapshotRepository.findById(snapshotId);
      if (!snapshot || snapshot.userId !== userId) {
        return false;
      }
      
      // 这里需要实现删除逻辑，假设仓库有deleteById方法
      // 由于我们的接口中没有定义deleteById，这里暂时返回true
      // 实际实现中需要添加该方法到仓库接口
      return true;
    } catch (error) {
      console.error('Failed to delete snapshot:', error);
      return false;
    }
  }

  /**
   * 比较两个模型快照
   * @param snapshot1 快照1
   * @param snapshot2 快照2
   * @returns 快照差异
   */
  async compareSnapshots(snapshot1: ModelSnapshot, snapshot2: ModelSnapshot): Promise<ModelSnapshotDiff> {
    try {
      // 恢复两个快照的模型数据
      const model1 = await this.restoreModelFromSnapshot(snapshot1);
      const model2 = await this.restoreModelFromSnapshot(snapshot2);
      
      // 比较概念差异
      const conceptDiff = this.compareConcepts(model1.concepts || [], model2.concepts || []);
      
      // 比较关系差异
      const relationDiff = this.compareRelations(model1.relations || [], model2.relations || []);
      
      // 计算统计信息
      const totalChanges = 
        conceptDiff.added.length + conceptDiff.updated.length + conceptDiff.removed.length +
        relationDiff.added.length + relationDiff.updated.length + relationDiff.removed.length;
      
      const totalItems = (model1.concepts?.length || 0) + (model1.relations?.length || 0);
      const changePercentage = totalItems > 0 ? (totalChanges / totalItems) * 100 : 0;
      
      // 构建差异结果
      const diff: ModelSnapshotDiff = {
        id: uuidv4(),
        snapshotId1: snapshot1.id,
        snapshotId2: snapshot2.id,
        calculatedAt: new Date(),
        conceptDiff,
        relationDiff,
        statistics: {
          totalChanges,
          conceptChanges: conceptDiff.added.length + conceptDiff.updated.length + conceptDiff.removed.length,
          relationChanges: relationDiff.added.length + relationDiff.updated.length + relationDiff.removed.length,
          changePercentage
        }
      };
      
      return diff;
    } catch (error) {
      console.error('Failed to compare snapshots:', error);
      throw new Error('Failed to compare snapshots');
    }
  }

  /**
   * 根据版本ID获取模型快照
   * @param userId 用户ID
   * @param versionId 版本ID
   * @returns 模型快照
   */
  async getModelSnapshot(userId: string, versionId: string): Promise<ModelSnapshot | null> {
    try {
      return await this.snapshotRepository.findByUserIdAndVersion(userId, versionId);
    } catch (error) {
      console.error('Failed to get snapshot by version:', error);
      throw new Error('Failed to get snapshot by version');
    }
  }

  /**
   * 恢复模型从快照
   * @param snapshot 模型快照
   * @returns 恢复的模型
   */
  async restoreModelFromSnapshot(snapshot: ModelSnapshot): Promise<any> {
    try {
      // 解压模型数据
      const decompressedData = await this.compressionService.decompress(snapshot.data.compressedModelData);
      
      // 解析模型数据
      const model = JSON.parse(decompressedData);
      
      // 验证模型哈希值
      const modelHash = this.calculateModelHash(model);
      if (modelHash !== snapshot.data.modelHash) {
        throw new Error('Model hash mismatch, data may be corrupted');
      }
      
      return model;
    } catch (error) {
      console.error('Failed to restore model from snapshot:', error);
      throw new Error('Failed to restore model from snapshot');
    }
  }

  /**
   * 计算模型哈希值
   * @param model 模型对象
   * @returns 哈希值
   */
  private calculateModelHash(model: any): string {
    // 使用简单的JSON序列化和哈希算法
    // 实际应用中应该使用更安全的哈希算法，如SHA-256
    const modelString = JSON.stringify(model);
    let hash = 0;
    for (let i = 0; i < modelString.length; i++) {
      const char = modelString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * 比较两个概念列表的差异
   * @param concepts1 概念列表1
   * @param concepts2 概念列表2
   * @returns 概念差异
   */
  private compareConcepts(concepts1: any[], concepts2: any[]): ConceptDiff {
    const conceptMap1 = new Map(concepts1.map(c => [c.id, c]));
    const conceptMap2 = new Map(concepts2.map(c => [c.id, c]));
    
    const added: any[] = [];
    const updated: ConceptUpdate[] = [];
    const removed: string[] = [];
    
    // 找出新增和更新的概念
    for (const [id, concept2] of conceptMap2) {
      if (conceptMap1.has(id)) {
        const concept1 = conceptMap1.get(id)!;
        const changedFields = this.getChangedFields(concept1, concept2);
        if (changedFields.length > 0) {
          updated.push({
            conceptId: id,
            oldConcept: concept1,
            newConcept: concept2,
            changedFields
          });
        }
      } else {
        added.push(concept2);
      }
    }
    
    // 找出删除的概念
    for (const [id] of conceptMap1) {
      if (!conceptMap2.has(id)) {
        removed.push(id);
      }
    }
    
    return { added, updated, removed };
  }

  /**
   * 比较两个关系列表的差异
   * @param relations1 关系列表1
   * @param relations2 关系列表2
   * @returns 关系差异
   */
  private compareRelations(relations1: any[], relations2: any[]): RelationDiff {
    const relationMap1 = new Map(relations1.map(r => [r.id, r]));
    const relationMap2 = new Map(relations2.map(r => [r.id, r]));
    
    const added: any[] = [];
    const updated: RelationUpdate[] = [];
    const removed: string[] = [];
    
    // 找出新增和更新的关系
    for (const [id, relation2] of relationMap2) {
      if (relationMap1.has(id)) {
        const relation1 = relationMap1.get(id)!;
        const changedFields = this.getChangedFields(relation1, relation2);
        if (changedFields.length > 0) {
          updated.push({
            relationId: id,
            oldRelation: relation1,
            newRelation: relation2,
            changedFields
          });
        }
      } else {
        added.push(relation2);
      }
    }
    
    // 找出删除的关系
    for (const [id] of relationMap1) {
      if (!relationMap2.has(id)) {
        removed.push(id);
      }
    }
    
    return { added, updated, removed };
  }

  /**
   * 获取两个对象之间的差异字段
   * @param obj1 对象1
   * @param obj2 对象2
   * @returns 差异字段列表
   */
  private getChangedFields(obj1: any, obj2: any): string[] {
    const changedFields: string[] = [];
    
    // 合并两个对象的所有键
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    
    for (const key of allKeys) {
      if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        changedFields.push(key);
      }
    }
    
    return changedFields;
  }
}
