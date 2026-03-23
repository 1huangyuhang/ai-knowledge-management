import { v4 as uuidv4 } from 'uuid';
import { UserCognitiveModel } from '../../../domain/entities/cognitive-model';
import { ModelSnapshotService } from './model-snapshot-service';
import { ModelSnapshot, SnapshotType } from './types/model-snapshot';
import { SnapshotQueryOptions } from './types/snapshot-query-options';
import { ModelSnapshotDiff } from './types/model-snapshot-diff';
import { ModelVersionDiff } from './types/model-version-diff';

// 假设的仓库接口，实际应从infrastructure层导入
interface SnapshotRepository {
  save(snapshot: ModelSnapshot): Promise<void>;
  findById(snapshotId: string, userId: string): Promise<ModelSnapshot | null>;
  findByVersion(versionId: string, userId: string): Promise<ModelSnapshot | null>;
  findByUserId(userId: string, options?: SnapshotQueryOptions): Promise<ModelSnapshot[]>;
  delete(snapshotId: string, userId: string): Promise<boolean>;
  countByUserId(userId: string): Promise<number>;
}

// 假设的压缩服务，实际应从infrastructure层导入
interface CompressionService {
  compress(data: string): Promise<string>;
  decompress(data: string): Promise<string>;
}

// 假设的加密服务，实际应从infrastructure层导入
interface EncryptionService {
  encrypt(data: string): Promise<string>;
  decrypt(data: string): Promise<string>;
}

// 假设的认知模型仓库，实际应从domain层导入
interface CognitiveModelRepository {
  findById(id: string, userId: string): Promise<UserCognitiveModel | null>;
}

/**
 * 模型快照服务实现类
 */
export class ModelSnapshotServiceImpl implements ModelSnapshotService {
  private snapshotRepository: SnapshotRepository;
  private compressionService: CompressionService;
  private encryptionService: EncryptionService;
  private cognitiveModelRepository: CognitiveModelRepository;

  /**
   * 构造函数
   * @param snapshotRepository 快照仓库
   * @param compressionService 压缩服务
   * @param encryptionService 加密服务
   * @param cognitiveModelRepository 认知模型仓库
   */
  constructor(
    snapshotRepository: SnapshotRepository,
    compressionService: CompressionService,
    encryptionService: EncryptionService,
    cognitiveModelRepository: CognitiveModelRepository
  ) {
    this.snapshotRepository = snapshotRepository;
    this.compressionService = compressionService;
    this.encryptionService = encryptionService;
    this.cognitiveModelRepository = cognitiveModelRepository;
  }

  /**
   * 创建模型快照
   * @param userId 用户ID
   * @param model 当前模型
   * @param versionId 版本ID
   * @returns 快照创建结果
   */
  async createSnapshot(userId: string, model: UserCognitiveModel, versionId: string): Promise<ModelSnapshot> {
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
          conceptCount: model.concepts.length,
          relationCount: model.relations.length,
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
      return await this.snapshotRepository.findById(snapshotId, userId);
    } catch (error) {
      console.error('Failed to get model snapshot:', error);
      return null;
    }
  }

  /**
   * 获取模型快照列表
   * @param userId 用户ID
   * @param options 查询选项
   * @returns 快照列表
   */
  async getSnapshots(userId: string, options?: SnapshotQueryOptions): Promise<ModelSnapshot[]> {
    try {
      return await this.snapshotRepository.findByUserId(userId, options);
    } catch (error) {
      console.error('Failed to get model snapshots:', error);
      return [];
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
      return await this.snapshotRepository.delete(snapshotId, userId);
    } catch (error) {
      console.error('Failed to delete model snapshot:', error);
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
      // 解压并恢复模型
      const model1Str = await this.compressionService.decompress(snapshot1.data.compressedModelData);
      const model2Str = await this.compressionService.decompress(snapshot2.data.compressedModelData);
      
      const model1 = JSON.parse(model1Str) as UserCognitiveModel;
      const model2 = JSON.parse(model2Str) as UserCognitiveModel;
      
      // 比较概念差异
      const conceptDiff = this.compareConcepts(model1.concepts, model2.concepts);
      const relationDiff = this.compareRelations(model1.relations, model2.relations);
      
      // 计算统计信息
      const totalChanges = 
        conceptDiff.added.length + conceptDiff.updated.length + conceptDiff.removed.length +
        relationDiff.added.length + relationDiff.updated.length + relationDiff.removed.length;
      
      const totalItems = model1.concepts.length + model1.relations.length;
      const changePercentage = totalItems > 0 ? (totalChanges / totalItems) * 100 : 0;
      
      // 构建版本差异
      const versionDiff: ModelVersionDiff = {
        id: uuidv4(),
        userId: snapshot1.userId,
        fromVersion: snapshot1.version,
        toVersion: snapshot2.version,
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
      
      // 构建快照差异
      const snapshotDiff: ModelSnapshotDiff = {
        id: uuidv4(),
        snapshot1: {
          id: snapshot1.id,
          version: snapshot1.version,
          createdAt: snapshot1.createdAt
        },
        snapshot2: {
          id: snapshot2.id,
          version: snapshot2.version,
          createdAt: snapshot2.createdAt
        },
        versionDiff,
        calculatedAt: new Date()
      };
      
      return snapshotDiff;
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
      return await this.snapshotRepository.findByVersion(versionId, userId);
    } catch (error) {
      console.error('Failed to get model snapshot by version:', error);
      return null;
    }
  }

  /**
   * 计算模型哈希值
   * @param model 模型对象
   * @returns 哈希值
   */
  private calculateModelHash(model: UserCognitiveModel): string {
    // 简单实现，实际应使用更安全的哈希算法
    const modelStr = JSON.stringify(model);
    let hash = 0;
    for (let i = 0; i < modelStr.length; i++) {
      const char = modelStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * 比较概念差异
   * @param concepts1 概念列表1
   * @param concepts2 概念列表2
   * @returns 概念差异
   */
  private compareConcepts(concepts1: any[], concepts2: any[]) {
    const conceptMap1 = new Map(concepts1.map(c => [c.id, c]));
    const conceptMap2 = new Map(concepts2.map(c => [c.id, c]));
    
    // 新增概念
    const added = concepts2.filter(c => !conceptMap1.has(c.id));
    
    // 删除概念
    const removed = [...conceptMap1.keys()].filter(id => !conceptMap2.has(id));
    
    // 更新概念
    const updated = concepts2
      .filter(c => conceptMap1.has(c.id))
      .map(c => {
        const oldConcept = conceptMap1.get(c.id)!;
        const updatedFields = this.findUpdatedFields(oldConcept, c);
        return {
          id: c.id,
          before: oldConcept,
          after: c,
          updatedFields
        };
      })
      .filter(update => update.updatedFields.length > 0);
    
    return { added, updated, removed };
  }

  /**
   * 比较关系差异
   * @param relations1 关系列表1
   * @param relations2 关系列表2
   * @returns 关系差异
   */
  private compareRelations(relations1: any[], relations2: any[]) {
    const relationMap1 = new Map(relations1.map(r => [r.id, r]));
    const relationMap2 = new Map(relations2.map(r => [r.id, r]));
    
    // 新增关系
    const added = relations2.filter(r => !relationMap1.has(r.id));
    
    // 删除关系
    const removed = [...relationMap1.keys()].filter(id => !relationMap2.has(id));
    
    // 更新关系
    const updated = relations2
      .filter(r => relationMap1.has(r.id))
      .map(r => {
        const oldRelation = relationMap1.get(r.id)!;
        const updatedFields = this.findUpdatedFields(oldRelation, r);
        return {
          id: r.id,
          before: oldRelation,
          after: r,
          updatedFields
        };
      })
      .filter(update => update.updatedFields.length > 0);
    
    return { added, updated, removed };
  }

  /**
   * 查找两个对象之间的更新字段
   * @param oldObj 旧对象
   * @param newObj 新对象
   * @returns 更新的字段列表
   */
  private findUpdatedFields(oldObj: any, newObj: any): string[] {
    const updatedFields: string[] = [];
    
    // 遍历新对象的所有字段
    for (const key in newObj) {
      if (newObj.hasOwnProperty(key)) {
        const oldValue = oldObj[key];
        const newValue = newObj[key];
        
        // 如果字段值不同，添加到更新字段列表
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          updatedFields.push(key);
        }
      }
    }
    
    return updatedFields;
  }
}