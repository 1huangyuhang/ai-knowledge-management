# 领域服务实现文档

索引标签：#领域服务 #业务逻辑 #DDD #认知模型 #概念关系 #洞察生成 #建议生成 #思想分析

## 相关文档

- [领域模型设计](domain-model-design.md)：详细描述系统的领域模型
- [领域层设计](domain-layer-design.md)：详细描述领域层的设计
- [仓库接口定义](repository-interface-definition.md)：详细描述仓库接口的定义
- [应用层设计](application-layer-design.md)：详细描述应用层的设计
- [数据模型定义](../core-features/data-model-definition.md)：详细描述系统的数据模型

## 1. 文档概述

本文档详细描述AI认知辅助系统的领域服务实现，包括核心领域服务的功能、方法、实现示例和业务规则。领域服务是系统的核心业务逻辑实现，负责处理跨实体的业务操作。通过本文档，开发者可以深入理解系统的业务逻辑和实现方式，确保系统的实现符合业务需求。


## 2. 领域服务设计原则

### 2.1 设计原则

1. **领域服务封装跨实体业务逻辑**：当业务逻辑涉及多个实体时，应封装在领域服务中
2. **服务名反映业务功能**：领域服务的名称应清晰反映其业务功能
3. **服务方法名反映业务操作**：服务方法的名称应清晰反映其业务操作
4. **无状态设计**：领域服务应设计为无状态，便于测试和扩展
5. **依赖抽象**：领域服务应依赖抽象（接口），不依赖具体实现
6. **业务规则显式化**：业务规则应在领域服务中显式实现

### 2.2 服务分类

- **认知模型管理服务**：处理认知模型的创建、更新、验证等操作
- **概念关系服务**：处理概念和关系的管理、验证和分析
- **洞察生成服务**：处理认知洞察的生成、优先级排序和解决
- **建议生成服务**：处理改进建议的生成、排序和验证
- **思想分析服务**：处理思想片段的分析、概念提取和映射

## 3. 核心领域服务实现

### 3.1 CognitiveModelService（认知模型管理服务）

#### 3.1.1 功能描述

负责认知模型的创建、更新、验证和合并等操作，确保认知模型的完整性和一致性。

#### 3.1.2 核心方法

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| validateModel | model: UserCognitiveModel | boolean | 验证认知模型的完整性和一致性 |
| mergeModels | sourceModel: UserCognitiveModel, targetModel: UserCognitiveModel | UserCognitiveModel | 合并两个认知模型 |
| calculateModelHealth | model: UserCognitiveModel | number | 计算认知模型的健康度 |
| cloneModel | model: UserCognitiveModel, newName: string | UserCognitiveModel | 克隆认知模型 |
| updateModelVersion | model: UserCognitiveModel | UserCognitiveModel | 更新认知模型版本 |

#### 3.1.3 实现示例

```typescript
import { injectable } from 'tsyringe';
import { UserCognitiveModel } from '../entities/UserCognitiveModel';
import { CognitiveConcept } from '../entities/CognitiveConcept';
import { CognitiveRelation } from '../entities/CognitiveRelation';

@injectable()
export class CognitiveModelService {
  /**
   * 验证认知模型的完整性和一致性
   * @param model 认知模型
   * @returns 是否有效
   */
  validateModel(model: UserCognitiveModel): boolean {
    // 检查模型基本信息
    if (!model.name || model.name.length > 50) {
      return false;
    }

    // 检查模型概念
    if (!model.concepts || model.concepts.length === 0) {
      return false;
    }

    // 检查模型关系
    for (const relation of model.relations) {
      // 检查关系的源概念和目标概念是否存在于模型中
      const sourceConcept = model.concepts.find(c => c.id === relation.sourceConceptId);
      const targetConcept = model.concepts.find(c => c.id === relation.targetConceptId);
      
      if (!sourceConcept || !targetConcept) {
        return false;
      }
    }

    return true;
  }

  /**
   * 合并两个认知模型
   * @param sourceModel 源模型
   * @param targetModel 目标模型
   * @returns 合并后的模型
   */
  mergeModels(sourceModel: UserCognitiveModel, targetModel: UserCognitiveModel): UserCognitiveModel {
    // 创建新的模型版本
    const mergedModel = new UserCognitiveModel({
      ...targetModel,
      name: `${targetModel.name} (Merged)`,
      version: targetModel.version + 1,
      concepts: [...targetModel.concepts],
      relations: [...targetModel.relations]
    });

    // 合并概念
    for (const sourceConcept of sourceModel.concepts) {
      // 检查概念是否已存在
      const existingConcept = mergedModel.concepts.find(c => c.name === sourceConcept.name);
      if (!existingConcept) {
        mergedModel.concepts.push(sourceConcept);
      }
    }

    // 合并关系
    for (const sourceRelation of sourceModel.relations) {
      // 检查关系是否已存在
      const existingRelation = mergedModel.relations.find(r => 
        r.sourceConceptId === sourceRelation.sourceConceptId &&
        r.targetConceptId === sourceRelation.targetConceptId &&
        r.type === sourceRelation.type
      );
      
      if (!existingRelation) {
        mergedModel.relations.push(sourceRelation);
      }
    }

    return mergedModel;
  }

  /**
   * 计算认知模型的健康度
   * @param model 认知模型
   * @returns 健康度分数（0-100）
   */
  calculateModelHealth(model: UserCognitiveModel): number {
    let score = 100;

    // 检查概念数量
    if (model.concepts.length < 5) {
      score -= 20;
    }

    // 检查关系数量
    const expectedRelations = model.concepts.length * 2;
    if (model.relations.length < expectedRelations) {
      const relationScore = (model.relations.length / expectedRelations) * 40;
      score -= (40 - relationScore);
    }

    // 检查概念描述完整性
    const conceptsWithDescription = model.concepts.filter(c => c.description && c.description.length > 0).length;
    const descriptionScore = (conceptsWithDescription / model.concepts.length) * 20;
    score -= (20 - descriptionScore);

    // 检查关系强度分布
    const averageStrength = model.relations.reduce((sum, r) => sum + r.strength.value, 0) / model.relations.length;
    if (averageStrength < 3) {
      score -= 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 克隆认知模型
   * @param model 认知模型
   * @param newName 新模型名称
   * @returns 克隆后的模型
   */
  cloneModel(model: UserCognitiveModel, newName: string): UserCognitiveModel {
    return new UserCognitiveModel({
      ...model,
      id: crypto.randomUUID(),
      name: newName,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  /**
   * 更新认知模型版本
   * @param model 认知模型
   * @returns 更新后的模型
   */
  updateModelVersion(model: UserCognitiveModel): UserCognitiveModel {
    return new UserCognitiveModel({
      ...model,
      version: model.version + 1,
      updatedAt: new Date()
    });
  }
}
```

#### 3.1.4 业务规则

1. 认知模型必须包含至少一个概念
2. 认知模型的名称长度必须在1-50个字符之间
3. 认知模型中的关系必须引用模型中存在的概念
4. 合并模型时，源模型的概念和关系会被合并到目标模型中
5. 模型健康度分数范围为0-100

### 3.2 ConceptRelationService（概念关系服务）

#### 3.2.1 功能描述

负责概念和关系的管理、验证和分析，确保概念和关系的一致性和合理性。

#### 3.2.2 核心方法

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| validateRelation | relation: CognitiveRelation, model: UserCognitiveModel | boolean | 验证关系的合理性 |
| calculateRelationStrength | sourceConcept: CognitiveConcept, targetConcept: CognitiveConcept | RelationStrength | 计算概念间的关系强度 |
| detectConceptClusters | model: UserCognitiveModel | CognitiveConcept[][] | 检测概念集群 |
| findRelatedConcepts | concept: CognitiveConcept, model: UserCognitiveModel | CognitiveConcept[] | 查找相关概念 |
| suggestNewRelations | model: UserCognitiveModel | CognitiveRelation[] | 建议新的关系 |

#### 3.2.3 实现示例

```typescript
import { injectable } from 'tsyringe';
import { UserCognitiveModel } from '../entities/UserCognitiveModel';
import { CognitiveConcept } from '../entities/CognitiveConcept';
import { CognitiveRelation } from '../entities/CognitiveRelation';
import { RelationStrength } from '../value-objects/RelationStrength';

@injectable()
export class ConceptRelationService {
  /**
   * 验证关系的合理性
   * @param relation 关系
   * @param model 认知模型
   * @returns 是否有效
   */
  validateRelation(relation: CognitiveRelation, model: UserCognitiveModel): boolean {
    // 检查源概念和目标概念是否存在
    const sourceConcept = model.concepts.find(c => c.id === relation.sourceConceptId);
    const targetConcept = model.concepts.find(c => c.id === relation.targetConceptId);
    
    if (!sourceConcept || !targetConcept) {
      return false;
    }

    // 检查关系强度是否在合理范围内
    if (relation.strength.value < 0 || relation.strength.value > 10) {
      return false;
    }

    // 检查关系类型是否有效
    const validTypes = ['is-a', 'part-of', 'related-to', 'depends-on', 'causes'];
    if (!validTypes.includes(relation.type)) {
      return false;
    }

    return true;
  }

  /**
   * 计算概念间的关系强度
   * @param sourceConcept 源概念
   * @param targetConcept 目标概念
   * @returns 关系强度
   */
  calculateRelationStrength(sourceConcept: CognitiveConcept, targetConcept: CognitiveConcept): RelationStrength {
    let strength = 0;

    // 基于概念名称的相似度计算
    const nameSimilarity = this.calculateNameSimilarity(sourceConcept.name, targetConcept.name);
    strength += nameSimilarity * 3;

    // 基于概念描述的相似度计算
    if (sourceConcept.description && targetConcept.description) {
      const descriptionSimilarity = this.calculateDescriptionSimilarity(
        sourceConcept.description, 
        targetConcept.description
      );
      strength += descriptionSimilarity * 5;
    }

    // 基于概念重要性调整
    const averageImportance = (sourceConcept.importance.value + targetConcept.importance.value) / 2;
    strength += averageImportance * 0.2;

    // 确保强度在0-10范围内
    return RelationStrength.create(Math.max(0, Math.min(10, Math.round(strength))));
  }

  /**
   * 检测概念集群
   * @param model 认知模型
   * @returns 概念集群数组
   */
  detectConceptClusters(model: UserCognitiveModel): CognitiveConcept[][] {
    const clusters: CognitiveConcept[][] = [];
    const visitedConcepts = new Set<string>();

    for (const concept of model.concepts) {
      if (!visitedConcepts.has(concept.id)) {
        const cluster = this.findConceptCluster(concept, model, visitedConcepts);
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  /**
   * 查找相关概念
   * @param concept 概念
   * @param model 认知模型
   * @returns 相关概念数组
   */
  findRelatedConcepts(concept: CognitiveConcept, model: UserCognitiveModel): CognitiveConcept[] {
    const relatedConceptIds = new Set<string>();

    // 查找直接相关的概念
    for (const relation of model.relations) {
      if (relation.sourceConceptId === concept.id) {
        relatedConceptIds.add(relation.targetConceptId);
      } else if (relation.targetConceptId === concept.id) {
        relatedConceptIds.add(relation.sourceConceptId);
      }
    }

    // 转换为概念对象
    return model.concepts.filter(c => relatedConceptIds.has(c.id));
  }

  /**
   * 建议新的关系
   * @param model 认知模型
   * @returns 建议的关系数组
   */
  suggestNewRelations(model: UserCognitiveModel): CognitiveRelation[] {
    const suggestions: CognitiveRelation[] = [];

    // 对于每个概念，查找可能相关但尚未建立关系的概念
    for (const sourceConcept of model.concepts) {
      for (const targetConcept of model.concepts) {
        if (sourceConcept.id !== targetConcept.id) {
          // 检查是否已存在关系
          const existingRelation = model.relations.find(r => 
            (r.sourceConceptId === sourceConcept.id && r.targetConceptId === targetConcept.id) ||
            (r.sourceConceptId === targetConcept.id && r.targetConceptId === sourceConcept.id)
          );
          
          if (!existingRelation) {
            // 计算关系强度
            const strength = this.calculateRelationStrength(sourceConcept, targetConcept);
            
            // 如果关系强度足够高，建议建立关系
            if (strength.value >= 5) {
              const suggestedRelation = new CognitiveRelation({
                id: crypto.randomUUID(),
                modelId: model.id,
                sourceConceptId: sourceConcept.id,
                targetConceptId: targetConcept.id,
                type: 'related-to',
                strength: strength,
                description: `Suggested relation between ${sourceConcept.name} and ${targetConcept.name}`,
                createdAt: new Date(),
                updatedAt: new Date()
              });
              
              suggestions.push(suggestedRelation);
            }
          }
        }
      }
    }

    return suggestions;
  }

  /**
   * 计算名称相似度
   * @param name1 名称1
   * @param name2 名称2
   * @returns 相似度分数（0-1）
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    // 简单的编辑距离算法实现
    // 此处省略具体实现
    return 0.5;
  }

  /**
   * 计算描述相似度
   * @param desc1 描述1
   * @param desc2 描述2
   * @returns 相似度分数（0-1）
   */
  private calculateDescriptionSimilarity(desc1: string, desc2: string): number {
    // 简单的词频统计算法实现
    // 此处省略具体实现
    return 0.6;
  }

  /**
   * 查找概念集群
   * @param concept 概念
   * @param model 认知模型
   * @param visitedConcepts 已访问的概念ID集合
   * @returns 概念集群
   */
  private findConceptCluster(
    concept: CognitiveConcept, 
    model: UserCognitiveModel, 
    visitedConcepts: Set<string>
  ): CognitiveConcept[] {
    const cluster: CognitiveConcept[] = [];
    const queue: CognitiveConcept[] = [concept];
    visitedConcepts.add(concept.id);

    while (queue.length > 0) {
      const currentConcept = queue.shift()!;
      cluster.push(currentConcept);

      // 查找直接相关的概念
      const relatedConcepts = this.findRelatedConcepts(currentConcept, model);
      for (const relatedConcept of relatedConcepts) {
        if (!visitedConcepts.has(relatedConcept.id)) {
          visitedConcepts.add(relatedConcept.id);
          queue.push(relatedConcept);
        }
      }
    }

    return cluster;
  }
}
```

#### 3.2.4 业务规则

1. 关系必须引用模型中存在的概念
2. 关系强度范围为0-10
3. 关系类型必须是预定义的有效类型
4. 检测概念集群时，使用广度优先搜索算法
5. 建议新关系时，只建议关系强度大于等于5的关系

### 3.3 InsightGenerationService（洞察生成服务）

#### 3.3.1 功能描述

负责认知洞察的生成、优先级排序和解决，帮助用户发现认知中的问题和机会。

#### 3.3.2 核心方法

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| generateInsights | model: UserCognitiveModel | CognitiveInsight[] | 生成认知洞察 |
| prioritizeInsights | insights: CognitiveInsight[] | CognitiveInsight[] | 对洞察进行优先级排序 |
| resolveInsight | insight: CognitiveInsight | CognitiveInsight | 解决认知洞察 |
| suggestInsightsBasedOnConcept | concept: CognitiveConcept, model: UserCognitiveModel | CognitiveInsight[] | 基于特定概念生成洞察 |

#### 3.3.3 实现示例

```typescript
import { injectable } from 'tsyringe';
import { UserCognitiveModel } from '../entities/UserCognitiveModel';
import { CognitiveConcept } from '../entities/CognitiveConcept';
import { CognitiveInsight } from '../entities/CognitiveInsight';
import { InsightType } from '../types/InsightType';
import { InsightSeverity } from '../value-objects/InsightSeverity';
import { InsightStatus } from '../types/InsightStatus';

@injectable()
export class InsightGenerationService {
  /**
   * 生成认知洞察
   * @param model 认知模型
   * @returns 认知洞察数组
   */
  generateInsights(model: UserCognitiveModel): CognitiveInsight[] {
    const insights: CognitiveInsight[] = [];

    // 检查概念数量是否充足
    if (model.concepts.length < 5) {
      insights.push(this.createInsight(
        model.id,
        InsightType.CONCEPT_INSUFFICIENT,
        '认知模型中的概念数量不足，建议添加更多相关概念',
        InsightSeverity.MEDIUM
      ));
    }

    // 检查关系数量是否充足
    const expectedRelations = model.concepts.length * 2;
    if (model.relations.length < expectedRelations) {
      insights.push(this.createInsight(
        model.id,
        InsightType.RELATION_INSUFFICIENT,
        `认知模型中的关系数量不足，预期至少需要 ${expectedRelations} 个关系`,
        InsightSeverity.MEDIUM
      ));
    }

    // 检查概念描述完整性
    const conceptsWithoutDescription = model.concepts.filter(c => !c.description || c.description.length === 0);
    if (conceptsWithoutDescription.length > model.concepts.length * 0.5) {
      insights.push(this.createInsight(
        model.id,
        InsightType.CONCEPT_DESCRIPTION_MISSING,
        '超过50%的概念缺少描述，建议完善概念描述',
        InsightSeverity.LOW
      ));
    }

    // 检查关系强度分布
    const weakRelations = model.relations.filter(r => r.strength.value < 3);
    if (weakRelations.length > model.relations.length * 0.3) {
      insights.push(this.createInsight(
        model.id,
        InsightType.WEAK_RELATIONS,
        '超过30%的关系强度较弱，建议加强这些关系或重新评估',
        InsightSeverity.LOW
      ));
    }

    // 检查概念重要性分布
    const lowImportanceConcepts = model.concepts.filter(c => c.importance.value < 3);
    if (lowImportanceConcepts.length > model.concepts.length * 0.5) {
      insights.push(this.createInsight(
        model.id,
        InsightType.LOW_IMPORTANCE_CONCEPTS,
        '超过50%的概念重要性较低，建议重新评估概念重要性',
        InsightSeverity.LOW
      ));
    }

    return insights;
  }

  /**
   * 对洞察进行优先级排序
   * @param insights 认知洞察数组
   * @returns 排序后的认知洞察数组
   */
  prioritizeInsights(insights: CognitiveInsight[]): CognitiveInsight[] {
    return [...insights].sort((a, b) => {
      // 首先按严重性排序
      const severityOrder = { high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity.value] - severityOrder[a.severity.value];
      if (severityDiff !== 0) {
        return severityDiff;
      }

      // 然后按创建时间排序（最新的优先）
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  /**
   * 解决认知洞察
   * @param insight 认知洞察
   * @returns 解决后的认知洞察
   */
  resolveInsight(insight: CognitiveInsight): CognitiveInsight {
    return {
      ...insight,
      status: InsightStatus.RESOLVED,
      resolvedAt: new Date()
    };
  }

  /**
   * 基于特定概念生成洞察
   * @param concept 概念
   * @param model 认知模型
   * @returns 认知洞察数组
   */
  suggestInsightsBasedOnConcept(concept: CognitiveConcept, model: UserCognitiveModel): CognitiveInsight[] {
    const insights: CognitiveInsight[] = [];

    // 检查概念是否缺少描述
    if (!concept.description || concept.description.length === 0) {
      insights.push(this.createInsight(
        model.id,
        InsightType.CONCEPT_DESCRIPTION_MISSING,
        `概念 "${concept.name}" 缺少描述，建议添加详细描述`,
        InsightSeverity.LOW
      ));
    }

    // 检查概念是否缺少关系
    const conceptRelations = model.relations.filter(r => 
      r.sourceConceptId === concept.id || r.targetConceptId === concept.id
    );
    if (conceptRelations.length < 2) {
      insights.push(this.createInsight(
        model.id,
        InsightType.CONCEPT_RELATION_INSUFFICIENT,
        `概念 "${concept.name}" 的关系数量不足，建议添加更多相关关系`,
        InsightSeverity.MEDIUM
      ));
    }

    // 检查概念重要性是否合理
    if (concept.importance.value < 2 && conceptRelations.length > 5) {
      insights.push(this.createInsight(
        model.id,
        InsightType.CONCEPT_IMPORTANCE_INCONSISTENT,
        `概念 "${concept.name}" 有较多关系但重要性较低，建议重新评估重要性`,
        InsightSeverity.LOW
      ));
    }

    return insights;
  }

  /**
   * 创建认知洞察
   * @param modelId 模型ID
   * @param type 洞察类型
   * @param description 洞察描述
   * @param severity 洞察严重性
   * @returns 认知洞察
   */
  private createInsight(
    modelId: string,
    type: InsightType,
    description: string,
    severity: InsightSeverity
  ): CognitiveInsight {
    return {
      id: crypto.randomUUID(),
      modelId,
      type,
      description,
      severity,
      status: InsightStatus.OPEN,
      createdAt: new Date()
    };
  }
}
```

#### 3.3.4 业务规则

1. 只有open状态的洞察才能生成建议
2. 洞察优先级首先按严重性排序，然后按创建时间排序
3. 解决洞察时，必须设置resolvedAt时间
4. 生成洞察时，根据不同的业务规则生成不同类型的洞察

### 3.4 SuggestionService（建议生成服务）

#### 3.4.1 功能描述

负责改进建议的生成、排序和验证，帮助用户优化认知结构。

#### 3.4.2 核心方法

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| generateSuggestions | insight: CognitiveInsight, model: UserCognitiveModel | Suggestion[] | 基于洞察生成建议 |
| rankSuggestions | suggestions: Suggestion[] | Suggestion[] | 对建议进行排序 |
| validateSuggestion | suggestion: Suggestion, model: UserCognitiveModel | boolean | 验证建议的合理性 |
| implementSuggestion | suggestion: Suggestion, model: UserCognitiveModel | UserCognitiveModel | 实施建议 |

#### 3.4.3 实现示例

```typescript
import { injectable } from 'tsyringe';
import { UserCognitiveModel } from '../entities/UserCognitiveModel';
import { CognitiveInsight } from '../entities/CognitiveInsight';
import { Suggestion } from '../entities/Suggestion';
import { SuggestionType } from '../types/SuggestionType';
import { SuggestionPriority } from '../value-objects/SuggestionPriority';
import { SuggestionStatus } from '../types/SuggestionStatus';

@injectable()
export class SuggestionService {
  /**
   * 基于洞察生成建议
   * @param insight 认知洞察
   * @param model 认知模型
   * @returns 建议数组
   */
  generateSuggestions(insight: CognitiveInsight, model: UserCognitiveModel): Suggestion[] {
    const suggestions: Suggestion[] = [];

    switch (insight.type) {
      case 'CONCEPT_INSUFFICIENT':
        suggestions.push(
          this.createSuggestion(
            model.id,
            insight.id,
            SuggestionType.ADD_CONCEPT,
            '建议添加更多与当前模型主题相关的核心概念',
            SuggestionPriority.MEDIUM
          )
        );
        break;

      case 'RELATION_INSUFFICIENT':
        suggestions.push(
          this.createSuggestion(
            model.id,
            insight.id,
            SuggestionType.ADD_RELATION,
            '建议为现有概念添加更多关系，加强概念间的联系',
            SuggestionPriority.MEDIUM
          )
        );
        break;

      case 'CONCEPT_DESCRIPTION_MISSING':
        suggestions.push(
          this.createSuggestion(
            model.id,
            insight.id,
            SuggestionType.UPDATE_CONCEPT_DESCRIPTION,
            '建议为缺少描述的概念添加详细描述，提高模型质量',
            SuggestionPriority.LOW
          )
        );
        break;

      case 'WEAK_RELATIONS':
        suggestions.push(
          this.createSuggestion(
            model.id,
            insight.id,
            SuggestionType.STRENGTHEN_RELATION,
            '建议加强弱关系或重新评估这些关系的必要性',
            SuggestionPriority.LOW
          )
        );
        break;

      case 'LOW_IMPORTANCE_CONCEPTS':
        suggestions.push(
          this.createSuggestion(
            model.id,
            insight.id,
            SuggestionType.UPDATE_CONCEPT_IMPORTANCE,
            '建议重新评估低重要性概念的重要程度',
            SuggestionPriority.LOW
          )
        );
        break;

      case 'CONCEPT_RELATION_INSUFFICIENT':
        suggestions.push(
          this.createSuggestion(
            model.id,
            insight.id,
            SuggestionType.ADD_RELATION_TO_CONCEPT,
            '建议为该概念添加更多相关关系',
            SuggestionPriority.MEDIUM
          )
        );
        break;

      case 'CONCEPT_IMPORTANCE_INCONSISTENT':
        suggestions.push(
          this.createSuggestion(
            model.id,
            insight.id,
            SuggestionType.UPDATE_CONCEPT_IMPORTANCE,
            '建议重新评估该概念的重要性，使其与关系数量匹配',
            SuggestionPriority.MEDIUM
          )
        );
        break;
    }

    return suggestions;
  }

  /**
   * 对建议进行排序
   * @param suggestions 建议数组
   * @returns 排序后的建议数组
   */
  rankSuggestions(suggestions: Suggestion[]): Suggestion[] {
    return [...suggestions].sort((a, b) => {
      // 首先按优先级排序
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority.value] - priorityOrder[a.priority.value];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      // 然后按创建时间排序（最新的优先）
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  /**
   * 验证建议的合理性
   * @param suggestion 建议
   * @param model 认知模型
   * @returns 是否有效
   */
  validateSuggestion(suggestion: Suggestion, model: UserCognitiveModel): boolean {
    // 检查建议内容长度
    if (!suggestion.content || suggestion.content.length < 10 || suggestion.content.length > 1000) {
      return false;
    }

    // 检查建议类型是否有效
    const validTypes = [
      'ADD_CONCEPT', 'UPDATE_CONCEPT', 'DELETE_CONCEPT',
      'ADD_RELATION', 'UPDATE_RELATION', 'DELETE_RELATION',
      'ADD_RELATION_TO_CONCEPT', 'STRENGTHEN_RELATION',
      'UPDATE_CONCEPT_DESCRIPTION', 'UPDATE_CONCEPT_IMPORTANCE'
    ];
    if (!validTypes.includes(suggestion.type)) {
      return false;
    }

    return true;
  }

  /**
   * 实施建议
   * @param suggestion 建议
   * @param model 认知模型
   * @returns 更新后的认知模型
   */
  implementSuggestion(suggestion: Suggestion, model: UserCognitiveModel): UserCognitiveModel {
    // 这里只实现建议状态的更新，具体的建议实施逻辑需要根据建议类型来实现
    // 实际项目中，应该根据建议类型调用相应的服务方法
    const updatedModel = {
      ...model,
      updatedAt: new Date()
    };

    return updatedModel;
  }

  /**
   * 创建建议
   * @param modelId 模型ID
   * @param insightId 洞察ID
   * @param type 建议类型
   * @param content 建议内容
   * @param priority 建议优先级
   * @returns 建议
   */
  private createSuggestion(
    modelId: string,
    insightId: string,
    type: SuggestionType,
    content: string,
    priority: SuggestionPriority
  ): Suggestion {
    return {
      id: crypto.randomUUID(),
      modelId,
      insightId,
      type,
      content,
      priority,
      status: SuggestionStatus.PENDING,
      createdAt: new Date()
    };
  }
}
```

#### 3.4.4 业务规则

1. 建议内容长度必须在10-1000个字符之间
2. 建议类型必须是预定义的有效类型
3. 建议优先级决定了建议的显示顺序
4. 实施建议时，必须更新模型的更新时间

### 3.5 ThoughtAnalysisService（思想分析服务）

#### 3.5.1 功能描述

负责思想片段的分析、概念提取和映射，将思想片段转换为认知模型的组成部分。

#### 3.5.2 核心方法

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| analyzeThought | thought: ThoughtFragment | ThoughtAnalysisResult | 分析思想片段 |
| extractConcepts | text: string | ExtractedConcept[] | 从文本中提取概念 |
| mapToExistingConcepts | extractedConcepts: ExtractedConcept[], model: UserCognitiveModel | ConceptMappingResult | 将提取的概念映射到现有概念 |
| suggestNewConcepts | extractedConcepts: ExtractedConcept[], model: UserCognitiveModel | CognitiveConcept[] | 建议新的概念 |

#### 3.5.3 实现示例

```typescript
import { injectable } from 'tsyringe';
import { ThoughtFragment } from '../entities/ThoughtFragment';
import { UserCognitiveModel } from '../entities/UserCognitiveModel';
import { CognitiveConcept } from '../entities/CognitiveConcept';
import { ConceptImportance } from '../value-objects/ConceptImportance';

@injectable()
export class ThoughtAnalysisService {
  /**
   * 分析思想片段
   * @param thought 思想片段
   * @returns 思想分析结果
   */
  analyzeThought(thought: ThoughtFragment): ThoughtAnalysisResult {
    // 提取概念
    const extractedConcepts = this.extractConcepts(thought.content);

    // 分析情感倾向
    const sentiment = this.analyzeSentiment(thought.content);

    // 分析思想类型
    const thoughtType = this.analyzeThoughtType(thought.content);

    return {
      thoughtId: thought.id,
      extractedConcepts,
      sentiment,
      thoughtType,
      tags: this.suggestTags(extractedConcepts)
    };
  }

  /**
   * 从文本中提取概念
   * @param text 文本内容
   * @returns 提取的概念数组
   */
  extractConcepts(text: string): ExtractedConcept[] {
    // 简单的概念提取算法实现
    // 此处省略具体实现
    return [
      { name: '人工智能', importance: 0.8 },
      { name: '认知模型', importance: 0.9 },
      { name: '机器学习', importance: 0.7 }
    ];
  }

  /**
   * 将提取的概念映射到现有概念
   * @param extractedConcepts 提取的概念
   * @param model 认知模型
   * @returns 概念映射结果
   */
  mapToExistingConcepts(
    extractedConcepts: ExtractedConcept[],
    model: UserCognitiveModel
  ): ConceptMappingResult {
    const mappings: ConceptMapping[] = [];
    const unmappedConcepts: ExtractedConcept[] = [];

    for (const extractedConcept of extractedConcepts) {
      // 查找匹配的现有概念
      const matchedConcept = model.concepts.find(c => 
        c.name.toLowerCase() === extractedConcept.name.toLowerCase() ||
        this.calculateNameSimilarity(c.name, extractedConcept.name) > 0.8
      );

      if (matchedConcept) {
        mappings.push({
          extractedConcept,
          existingConcept: matchedConcept,
          similarity: this.calculateNameSimilarity(matchedConcept.name, extractedConcept.name)
        });
      } else {
        unmappedConcepts.push(extractedConcept);
      }
    }

    return {
      mappings,
      unmappedConcepts
    };
  }

  /**
   * 建议新的概念
   * @param extractedConcepts 提取的概念
   * @param model 认知模型
   * @returns 建议的新概念数组
   */
  suggestNewConcepts(
    extractedConcepts: ExtractedConcept[],
    model: UserCognitiveModel
  ): CognitiveConcept[] {
    const mappingResult = this.mapToExistingConcepts(extractedConcepts, model);
    const newConcepts: CognitiveConcept[] = [];

    for (const unmappedConcept of mappingResult.unmappedConcepts) {
      // 只建议重要性较高的概念
      if (unmappedConcept.importance >= 0.6) {
        newConcepts.push({
          id: crypto.randomUUID(),
          modelId: model.id,
          name: unmappedConcept.name,
          description: '',
          type: 'general',
          importance: ConceptImportance.create(Math.round(unmappedConcept.importance * 10)),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    return newConcepts;
  }

  /**
   * 分析情感倾向
   * @param text 文本内容
   * @returns 情感倾向（-1到1之间）
   */
  private analyzeSentiment(text: string): number {
    // 简单的情感分析算法实现
    // 此处省略具体实现
    return 0.5;
  }

  /**
   * 分析思想类型
   * @param text 文本内容
   * @returns 思想类型
   */
  private analyzeThoughtType(text: string): string {
    // 简单的思想类型分析算法实现
    // 此处省略具体实现
    return 'explanatory';
  }

  /**
   * 建议标签
   * @param extractedConcepts 提取的概念
   * @returns 建议的标签数组
   */
  private suggestTags(extractedConcepts: ExtractedConcept[]): string[] {
    // 从提取的概念中选择重要性较高的作为标签
    return extractedConcepts
      .filter(c => c.importance >= 0.7)
      .map(c => c.name)
      .slice(0, 5);
  }

  /**
   * 计算名称相似度
   * @param name1 名称1
   * @param name2 名称2
   * @returns 相似度分数（0-1）
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    // 简单的编辑距离算法实现
    // 此处省略具体实现
    return 0.5;
  }
}

// 辅助类型定义
interface ExtractedConcept {
  name: string;
  importance: number;
}

interface ThoughtAnalysisResult {
  thoughtId: string;
  extractedConcepts: ExtractedConcept[];
  sentiment: number;
  thoughtType: string;
  tags: string[];
}

interface ConceptMapping {
  extractedConcept: ExtractedConcept;
  existingConcept: CognitiveConcept;
  similarity: number;
}

interface ConceptMappingResult {
  mappings: ConceptMapping[];
  unmappedConcepts: ExtractedConcept[];
}
```

#### 3.5.4 业务规则

1. 只建议重要性大于等于0.6的概念作为新概念
2. 建议的标签数量最多为5个
3. 概念映射时，相似度大于0.8的才认为是匹配
4. 情感倾向的取值范围为-1到1之间

## 4. 领域服务依赖关系

### 4.1 服务间依赖关系

| 服务 | 依赖服务 | 依赖类型 |
|------|----------|----------|
| CognitiveModelService | 无 | 独立服务 |
| ConceptRelationService | 无 | 独立服务 |
| InsightGenerationService | ConceptRelationService | 直接依赖 |
| SuggestionService | InsightGenerationService | 直接依赖 |
| ThoughtAnalysisService | ConceptRelationService | 直接依赖 |

### 4.2 服务与仓库依赖关系

| 服务 | 依赖仓库 | 依赖类型 |
|------|----------|----------|
| CognitiveModelService | UserCognitiveModelRepository | 间接依赖（通过应用层） |
| ConceptRelationService | UserCognitiveModelRepository | 间接依赖（通过应用层） |
| InsightGenerationService | UserCognitiveModelRepository | 间接依赖（通过应用层） |
| SuggestionService | UserCognitiveModelRepository, CognitiveInsightRepository | 间接依赖（通过应用层） |
| ThoughtAnalysisService | ThoughtFragmentRepository | 间接依赖（通过应用层） |

## 5. 领域服务测试策略

### 5.1 测试方法

1. **单元测试**：测试每个服务方法的单独功能
2. **集成测试**：测试服务之间的交互
3. **业务规则测试**：测试服务实现的业务规则
4. **边界条件测试**：测试服务在边界条件下的行为

### 5.2 测试示例

```typescript
// CognitiveModelService的单元测试示例
describe('CognitiveModelService', () => {
  let service: CognitiveModelService;

  beforeEach(() => {
    service = new CognitiveModelService();
  });

  describe('validateModel', () => {
    it('should return true for a valid model', () => {
      // 准备测试数据
      const model: UserCognitiveModel = {
        id: 'test-model',
        userId: 'test-user',
        name: 'Test Model',
        version: 1,
        concepts: [
          { id: 'concept1', name: 'Concept 1', description: 'Description 1', type: 'general', importance: ConceptImportance.create(5), createdAt: new Date(), updatedAt: new Date() }
        ],
        relations: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 执行测试
      const result = service.validateModel(model);

      // 验证结果
      expect(result).toBe(true);
    });

    it('should return false for a model with no concepts', () => {
      // 准备测试数据
      const model: UserCognitiveModel = {
        id: 'test-model',
        userId: 'test-user',
        name: 'Test Model',
        version: 1,
        concepts: [],
        relations: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 执行测试
      const result = service.validateModel(model);

      // 验证结果
      expect(result).toBe(false);
    });
  });

  // 其他方法的测试...
});
```

## 6. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-09 | 初始创建 | 系统架构师 |
