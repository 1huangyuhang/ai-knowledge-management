// 版本对比服务实现
import { VersionComparisonService } from './interfaces/evolution-history.interface';
import {
  ModelVersionDiff,
  ConceptDiff,
  RelationDiff,
  VersionComparisonReport
} from './types/evolution-history.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * 版本对比服务实现类
 * 负责比较不同版本的模型差异
 */
export class VersionComparisonServiceImpl implements VersionComparisonService {
  private modelSnapshotService: any;
  private evolutionEventRepository: any;

  /**
   * 构造函数
   * @param modelSnapshotService 模型快照服务
   * @param evolutionEventRepository 演化事件仓库
   */
  constructor(
    modelSnapshotService: any,
    evolutionEventRepository: any
  ) {
    this.modelSnapshotService = modelSnapshotService;
    this.evolutionEventRepository = evolutionEventRepository;
  }

  /**
   * 比较两个版本的模型
   * @param userId 用户ID
   * @param version1 版本1
   * @param version2 版本2
   * @returns 版本差异
   */
  async compareVersions(userId: string, version1: string, version2: string): Promise<ModelVersionDiff> {
    // 获取两个版本的模型快照
    const snapshot1 = await this.modelSnapshotService.getModelSnapshot(userId, version1);
    const snapshot2 = await this.modelSnapshotService.getModelSnapshot(userId, version2);

    if (!snapshot1 || !snapshot2) {
      throw new Error('One or both snapshots not found');
    }

    // 比较概念差异
    const conceptDiff = this.compareConcepts(snapshot1.data, snapshot2.data);
    
    // 比较关系差异
    const relationDiff = this.compareRelations(snapshot1.data, snapshot2.data);
    
    // 计算统计信息
    const totalChanges = 
      conceptDiff.added.length + conceptDiff.updated.length + conceptDiff.removed.length +
      relationDiff.added.length + relationDiff.updated.length + relationDiff.removed.length;
    
    const conceptChanges = 
      conceptDiff.added.length + conceptDiff.updated.length + conceptDiff.removed.length;
    
    const relationChanges = 
      relationDiff.added.length + relationDiff.updated.length + relationDiff.removed.length;
    
    // 计算变化百分比（基于概念和关系总数）
    const totalConceptsAndRelations = 
      snapshot1.data.concepts.length + snapshot1.data.relations.length;
    
    const changePercentage = totalConceptsAndRelations > 0 
      ? (totalChanges / totalConceptsAndRelations) * 100 
      : 0;

    return {
      id: uuidv4(),
      userId,
      fromVersion: version1,
      toVersion: version2,
      calculatedAt: new Date(),
      conceptDiff,
      relationDiff,
      statistics: {
        totalChanges,
        conceptChanges,
        relationChanges,
        changePercentage: Math.round(changePercentage * 100) / 100 // 保留两位小数
      }
    };
  }

  /**
   * 获取版本之间的概念差异
   * @param userId 用户ID
   * @param version1 版本1
   * @param version2 版本2
   * @returns 概念差异
   */
  async getConceptDiff(userId: string, version1: string, version2: string): Promise<ConceptDiff> {
    const snapshot1 = await this.modelSnapshotService.getModelSnapshot(userId, version1);
    const snapshot2 = await this.modelSnapshotService.getModelSnapshot(userId, version2);

    if (!snapshot1 || !snapshot2) {
      throw new Error('One or both snapshots not found');
    }

    return this.compareConcepts(snapshot1.data, snapshot2.data);
  }

  /**
   * 获取版本之间的关系差异
   * @param userId 用户ID
   * @param version1 版本1
   * @param version2 版本2
   * @returns 关系差异
   */
  async getRelationDiff(userId: string, version1: string, version2: string): Promise<RelationDiff> {
    const snapshot1 = await this.modelSnapshotService.getModelSnapshot(userId, version1);
    const snapshot2 = await this.modelSnapshotService.getModelSnapshot(userId, version2);

    if (!snapshot1 || !snapshot2) {
      throw new Error('One or both snapshots not found');
    }

    return this.compareRelations(snapshot1.data, snapshot2.data);
  }

  /**
   * 生成版本对比报告
   * @param userId 用户ID
   * @param version1 版本1
   * @param version2 版本2
   * @returns 对比报告
   */
  async generateComparisonReport(userId: string, version1: string, version2: string): Promise<VersionComparisonReport> {
    const versionDiff = await this.compareVersions(userId, version1, version2);
    
    // 获取相关演化事件
    const events = await this.evolutionEventRepository.find({
      userId,
      version: {
        $in: [version1, version2]
      }
    });

    // 生成变化摘要
    const changeSummary = this.generateChangeSummary(versionDiff);
    
    // 生成建议
    const recommendations = this.generateRecommendations(versionDiff);

    return {
      id: uuidv4(),
      userId,
      version1,
      version2,
      generatedAt: new Date(),
      versionDiff,
      changeSummary,
      recommendations,
      relatedEvents: events
    };
  }

  /**
   * 比较两个模型的概念差异
   * @param model1 模型1
   * @param model2 模型2
   * @returns 概念差异
   */
  private compareConcepts(model1: any, model2: any): ConceptDiff {
    const conceptDiff: ConceptDiff = {
      added: [],
      updated: [],
      removed: []
    };

    // 创建概念ID映射
    const conceptMap1 = new Map(model1.concepts.map((c: any) => [c.id, c]));
    const conceptMap2 = new Map(model2.concepts.map((c: any) => [c.id, c]));

    // 检查新增和更新的概念
    for (const [id, concept2] of conceptMap2) {
      const concept1 = conceptMap1.get(id);
      if (!concept1) {
        // 新增概念
        conceptDiff.added.push(concept2);
      } else if (this.areConceptsDifferent(concept1, concept2)) {
        // 更新的概念
        conceptDiff.updated.push({
          old: concept1,
          new: concept2
        });
      }
    }

    // 检查删除的概念
    for (const [id, concept1] of conceptMap1) {
      if (!conceptMap2.has(id)) {
        conceptDiff.removed.push(concept1);
      }
    }

    return conceptDiff;
  }

  /**
   * 比较两个模型的关系差异
   * @param model1 模型1
   * @param model2 模型2
   * @returns 关系差异
   */
  private compareRelations(model1: any, model2: any): RelationDiff {
    const relationDiff: RelationDiff = {
      added: [],
      updated: [],
      removed: []
    };

    // 创建关系ID映射
    const relationMap1 = new Map(model1.relations.map((r: any) => [r.id, r]));
    const relationMap2 = new Map(model2.relations.map((r: any) => [r.id, r]));

    // 检查新增和更新的关系
    for (const [id, relation2] of relationMap2) {
      const relation1 = relationMap1.get(id);
      if (!relation1) {
        // 新增关系
        relationDiff.added.push(relation2);
      } else if (this.areRelationsDifferent(relation1, relation2)) {
        // 更新的关系
        relationDiff.updated.push({
          old: relation1,
          new: relation2
        });
      }
    }

    // 检查删除的关系
    for (const [id, relation1] of relationMap1) {
      if (!relationMap2.has(id)) {
        relationDiff.removed.push(relation1);
      }
    }

    return relationDiff;
  }

  /**
   * 检查两个概念是否不同
   * @param concept1 概念1
   * @param concept2 概念2
   * @returns 是否不同
   */
  private areConceptsDifferent(concept1: any, concept2: any): boolean {
    return JSON.stringify({
      name: concept1.name,
      description: concept1.description,
      weight: concept1.weight,
      confidence: concept1.confidence,
      parentId: concept1.parentId,
      attributes: concept1.attributes
    }) !== JSON.stringify({
      name: concept2.name,
      description: concept2.description,
      weight: concept2.weight,
      confidence: concept2.confidence,
      parentId: concept2.parentId,
      attributes: concept2.attributes
    });
  }

  /**
   * 检查两个关系是否不同
   * @param relation1 关系1
   * @param relation2 关系2
   * @returns 是否不同
   */
  private areRelationsDifferent(relation1: any, relation2: any): boolean {
    return JSON.stringify({
      fromConceptId: relation1.fromConceptId,
      toConceptId: relation1.toConceptId,
      type: relation1.type,
      weight: relation1.weight,
      confidence: relation1.confidence,
      description: relation1.description
    }) !== JSON.stringify({
      fromConceptId: relation2.fromConceptId,
      toConceptId: relation2.toConceptId,
      type: relation2.type,
      weight: relation2.weight,
      confidence: relation2.confidence,
      description: relation2.description
    });
  }

  /**
   * 生成变化摘要
   * @param versionDiff 版本差异
   * @returns 变化摘要
   */
  private generateChangeSummary(versionDiff: ModelVersionDiff): string {
    const summary = [
      `从版本 ${versionDiff.fromVersion} 到 ${versionDiff.toVersion}，模型共发生了 ${versionDiff.statistics.totalChanges} 处变化。`,
      `其中概念变化 ${versionDiff.statistics.conceptChanges} 处（新增 ${versionDiff.conceptDiff.added.length}，更新 ${versionDiff.conceptDiff.updated.length}，删除 ${versionDiff.conceptDiff.removed.length}）。`,
      `关系变化 ${versionDiff.statistics.relationChanges} 处（新增 ${versionDiff.relationDiff.added.length}，更新 ${versionDiff.relationDiff.updated.length}，删除 ${versionDiff.relationDiff.removed.length}）。`,
      `总体变化率为 ${versionDiff.statistics.changePercentage}%。`
    ];

    return summary.join(' ');
  }

  /**
   * 生成建议
   * @param versionDiff 版本差异
   * @returns 建议列表
   */
  private generateRecommendations(versionDiff: ModelVersionDiff): string[] {
    const recommendations: string[] = [];

    if (versionDiff.conceptDiff.added.length > 5) {
      recommendations.push('新增概念较多，建议检查概念之间的层次关系是否合理。');
    }

    if (versionDiff.conceptDiff.removed.length > 5) {
      recommendations.push('删除概念较多，建议确认删除的概念是否真的不再需要。');
    }

    if (versionDiff.relationDiff.added.length > 10) {
      recommendations.push('新增关系较多，建议检查关系类型和权重设置是否合理。');
    }

    if (versionDiff.relationDiff.removed.length > 10) {
      recommendations.push('删除关系较多，建议确认删除的关系是否影响了模型的完整性。');
    }

    if (versionDiff.statistics.changePercentage > 50) {
      recommendations.push('模型变化较大，建议进行全面的一致性验证。');
    }

    if (recommendations.length === 0) {
      recommendations.push('模型变化合理，建议继续观察模型的演化趋势。');
    }

    return recommendations;
  }
}
