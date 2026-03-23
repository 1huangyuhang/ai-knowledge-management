# 领域层设计文档

索引标签：#领域层 #实体设计 #值对象 #领域服务 #仓库接口 #业务规则

## 相关文档

- [领域模型设计](domain-model-design.md)：详细描述领域模型的设计
- [领域服务实现](domain-service-implementation.md)：详细描述领域服务的实现
- [仓库接口定义](repository-interface-definition.md)：详细描述仓库接口的定义
- [数据模型定义](../core-features/data-model-definition.md)：详细描述系统数据模型设计
- [API设计](../core-features/api-design.md)：详细描述系统API设计，包括领域层相关API
- [安全策略](../core-features/security-strategy.md)：详细描述系统安全策略，包括领域层安全考虑
- [架构对齐](../architecture-design/architecture-alignment.md)：描述领域层在系统架构中的位置和作用
- [第一阶段：系统地基期 - 领域层实现](../../phase-1-foundation/week-1-understanding/06-domain-layer-technical-implementation.md)：详细描述领域层的技术实现
- [第一阶段：系统地基期 - 领域层实现2](../../phase-1-foundation/week-1-understanding/06-domain-layer-technical-implementation-2.md)：进一步完善领域层的实现
- [第一阶段：系统地基期 - 领域对象实现](../../phase-1-foundation/week-1-understanding/03-domain-objects-technical-implementation.md)：详细描述领域对象的实现
- [第一阶段：系统地基期 - 对象关系实现](../../phase-1-foundation/week-1-understanding/04-object-relationships-technical-implementation.md)：详细描述对象关系的实现
- [第三阶段：认知辅助成型期 - 建议生成设计](../../phase-3-cognitive-assistant/suggestion-generation/suggestion-generation-design.md)：详细描述建议生成模块的设计，包含领域层相关逻辑
- [第三阶段：认知辅助成型期 - 数据库优化设计](../../phase-3-cognitive-assistant/database/database-design.md)：详细描述数据库优化模块的设计，包含领域层相关逻辑

## 1. 文档概述

本文档详细描述了认知辅助系统领域层的设计和实现，包括实体、值对象、领域服务、仓库接口等核心组件。领域层是系统的核心，包含了业务规则和业务逻辑，不依赖于任何外部服务或基础设施，确保了系统的稳定性和可测试性。

领域层设计遵循Clean Architecture原则，是系统的Single Source of Truth，所有业务规则都在领域层定义和执行。

## 2. 设计原则

### 2.1 核心原则

- **纯领域模型**：领域层不依赖于任何外部服务、AI、ORM或HTTP，只包含业务规则
- **封装不变量**：通过实体和值对象封装业务规则，确保数据一致性
- **高内聚**：相关的业务规则和实体放在一起，形成紧密的领域模型
- **低耦合**：领域层与其他层通过接口通信，减少耦合度
- **显式业务规则**：所有业务规则都明确表达在代码中，便于理解和测试

### 2.2 设计目标

1. **业务规则明确**：所有业务规则都在领域层中明确表达
2. **可测试性**：领域层可以独立于其他层进行测试
3. **稳定性**：领域层相对稳定，不会因为外部技术变化而频繁修改
4. **可扩展性**：便于添加新的业务规则和实体
5. **表达性**：代码能够清晰表达业务概念和规则

## 3. 核心领域实体

### 3.1 实体定义

实体是具有唯一标识符的领域对象，其身份标识比属性更重要。

### 3.2 实体关系图

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     User        │1    1│UserCognitiveModel│1    N│CognitiveConcept│
├─────────────────┤──────┤                 ├──────┤                 │
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email           │       │ userId (FK)     │       │ modelId (FK)    │
│ passwordHash    │       │ version         │       │ name            │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                 ▲                           ▲
                                 │                           │
                                 │1                         N│
                                 │                           │
                                 ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Suggestion     │       │CognitiveRelation│       │ThoughtFragment  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ modelId (FK)    │       │ modelId (FK)    │       │ userId (FK)     │
│ type            │       │ sourceConceptId │       │ content         │
└─────────────────┘       │ targetConceptId │       └─────────────────┘
                          └─────────────────┘
                                 ▲
                                 │
                                 │
                                 ▼
┌─────────────────┐       ┌─────────────────┐
│CognitiveInsight │       │   User          │
├─────────────────┤       └─────────────────┘
│ id (PK)         │
│ modelId (FK)    │
│ type            │
└─────────────────┘
```

### 3.3 实体详细定义

#### 3.3.1 核心实体

| 实体名称 | 描述 | 关键属性 | 业务规则 |
|----------|------|----------|----------|
| `UserCognitiveModel` | 用户认知模型 | `id`, `userId`, `name`, `version`, `createdAt`, `updatedAt` | 每个用户可以有多个认知模型，模型版本递增 |
| `CognitiveConcept` | 认知概念 | `id`, `modelId`, `name`, `description`, `type`, `importance` | 概念名称在模型内唯一，重要性取值范围0-10 |
| `CognitiveRelation` | 认知关系 | `id`, `modelId`, `sourceConceptId`, `targetConceptId`, `type`, `strength` | 关系强度取值范围0-10，同一对概念间只能有一个关系 |
| `ThoughtFragment` | 思想片段 | `id`, `userId`, `content`, `type`, `tags`, `createdAt` | 内容不能为空，类型必须是预定义值 |
| `CognitiveInsight` | 认知洞察 | `id`, `modelId`, `type`, `description`, `severity`, `status` | 状态只能是"new"、"resolved"或"dismissed" |
| `Suggestion` | 建议 | `id`, `modelId`, `type`, `content`, `priority`, `status` | 优先级只能是"high"、"medium"或"low" |
| `User` | 用户 | `id`, `username`, `email`, `passwordHash`, `createdAt` | 用户名和邮箱唯一，密码必须哈希存储 |
| `AppleAuth` | 苹果认证信息 | `id`, `userId`, `appleUserId`, `email`, `fullName`, `identityToken`, `refreshToken`, `expiresAt` | 每个用户只能有一个苹果认证信息，苹果用户ID唯一 |
| `DeviceToken` | 设备令牌 | `id`, `userId`, `deviceToken`, `deviceType`, `deviceModel`, `osVersion`, `isActive`, `createdAt`, `updatedAt` | 设备令牌唯一，每个用户可以有多个设备令牌 |

#### 3.3.2 实体实现示例

**UserCognitiveModel实体**：

```typescript
export class UserCognitiveModel {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public name: string,
    public version: number,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  // 工厂方法
  static create(userId: string, name: string): UserCognitiveModel {
    const id = `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    return new UserCognitiveModel(id, userId, name, 1, now, now);
  }

  // 业务方法
  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('模型名称不能为空');
    }
    this.name = newName;
    this.updatedAt = new Date();
  }

  incrementVersion(): void {
    this.version++;
    this.updatedAt = new Date();
  }
}
```

**CognitiveConcept实体**：

```typescript
export class CognitiveConcept {
  private constructor(
    public readonly id: string,
    public readonly modelId: string,
    public name: string,
    public description: string,
    public type: string,
    public importance: number,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {
    // 验证不变量
    this.validateImportance(importance);
  }

  // 工厂方法
  static create(modelId: string, name: string, type: string, description: string, importance: number): CognitiveConcept {
    const id = `concept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    return new CognitiveConcept(id, modelId, name, description, type, importance, now, now);
  }

  // 业务方法
  updateImportance(newImportance: number): void {
    this.validateImportance(newImportance);
    this.importance = newImportance;
    this.updatedAt = new Date();
  }

  // 业务规则验证
  private validateImportance(importance: number): void {
    if (importance < 0 || importance > 1) {
      throw new Error('概念重要性必须在0-1之间');
    }
  }
}
```

### 3.2 值对象

值对象是没有唯一标识符的领域对象，其相等性基于属性值。

#### 3.2.1 核心值对象

| 值对象名称 | 描述 | 关键属性 | 业务规则 |
|------------|------|----------|----------|
| `ConceptImportance` | 概念重要性 | `value` | 取值范围0-1 |
| `RelationStrength` | 关系强度 | `value` | 取值范围0-1 |
| `InsightSeverity` | 洞察严重性 | `value` | 只能是"low"、"medium"或"high" |
| `SuggestionPriority` | 建议优先级 | `value` | 只能是"low"、"medium"或"high" |
| `ThoughtType` | 思想类型 | `value` | 只能是预定义值，如"text"、"file"、"audio" |

#### 3.2.2 值对象实现示例

**ConceptImportance值对象**：

```typescript
export class ConceptImportance {
  private constructor(public readonly value: number) {}

  static create(value: number): ConceptImportance {
    if (value < 0 || value > 1) {
      throw new Error('概念重要性必须在0-1之间');
    }
    return new ConceptImportance(value);
  }

  // 值对象相等性比较
  equals(other: ConceptImportance): boolean {
    return this.value === other.value;
  }
}
```

## 4. 实体关系

### 4.1 关系定义

| 关系类型 | 源实体 | 目标实体 | 描述 |
|----------|--------|----------|------|
| 一对多 | `User` | `UserCognitiveModel` | 一个用户可以有多个认知模型 |
| 一对多 | `UserCognitiveModel` | `CognitiveConcept` | 一个认知模型包含多个认知概念 |
| 一对多 | `UserCognitiveModel` | `CognitiveRelation` | 一个认知模型包含多个认知关系 |
| 一对多 | `UserCognitiveModel` | `CognitiveInsight` | 一个认知模型生成多个认知洞察 |
| 一对多 | `UserCognitiveModel` | `Suggestion` | 一个认知模型生成多个建议 |
| 一对多 | `User` | `ThoughtFragment` | 一个用户有多个思想片段 |
| 多对多 | `ThoughtFragment` | `CognitiveConcept` | 一个思想片段涉及多个认知概念，一个认知概念出现在多个思想片段中 |
| 一对一 | `CognitiveRelation` | `CognitiveConcept` | 关系有一个源概念和一个目标概念 |

### 4.2 关系图

```
User ──┬──> UserCognitiveModel ──┬──> CognitiveConcept
       │                        ├──> CognitiveRelation
       │                        ├──> CognitiveInsight
       │                        └──> Suggestion
       └──> ThoughtFragment ────> CognitiveConcept
```

## 5. 领域服务

领域服务是实现跨实体业务逻辑的组件，当业务规则涉及多个实体时，使用领域服务。

### 5.1 核心领域服务

| 服务名称 | 功能描述 | 主要方法 |
|----------|----------|----------|
| `CognitiveModelService` | 认知模型管理 | `validateModel`, `mergeModels`, `calculateModelHealth` |
| `ConceptRelationService` | 概念关系管理 | `validateRelation`, `calculateRelationStrength`, `detectConceptClusters` |
| `InsightGenerationService` | 洞察生成 | `generateInsights`, `prioritizeInsights`, `resolveInsight` |
| `SuggestionService` | 建议生成 | `generateSuggestions`, `rankSuggestions`, `validateSuggestion` |
| `ThoughtAnalysisService` | 思想分析 | `analyzeThought`, `extractConcepts`, `mapToExistingConcepts` |

### 5.2 领域服务实现示例

**ConceptRelationService示例**：

```typescript
export class ConceptRelationService {
  validateRelation(
    sourceConcept: CognitiveConcept,
    targetConcept: CognitiveConcept,
    relationType: string,
    strength: number
  ): void {
    // 验证关系类型
    const validRelationTypes = ['hierarchical', 'associative', 'causal', 'contrastive'];
    if (!validRelationTypes.includes(relationType)) {
      throw new Error(`无效的关系类型: ${relationType}`);
    }

    // 验证强度范围
    if (strength < 0 || strength > 10) {
      throw new Error('关系强度必须在0-10之间');
    }

    // 验证概念属于同一模型
    if (sourceConcept.modelId !== targetConcept.modelId) {
      throw new Error('源概念和目标概念必须属于同一认知模型');
    }

    // 验证不能与自身建立关系
    if (sourceConcept.id === targetConcept.id) {
      throw new Error('概念不能与自身建立关系');
    }
  }

  calculateRelationStrength(
    sourceConcept: CognitiveConcept,
    targetConcept: CognitiveConcept,
    thoughtFragments: ThoughtFragment[]
  ): number {
    // 基于共同出现的思想片段计算关系强度
    const sourceThoughts = thoughtFragments.filter(tf => 
      tf.tags.includes(sourceConcept.name)
    );
    
    const targetThoughts = thoughtFragments.filter(tf => 
      tf.tags.includes(targetConcept.name)
    );
    
    // 计算共同出现的思想片段数量
    const commonThoughts = sourceThoughts.filter(st => 
      targetThoughts.some(tt => tt.id === st.id)
    );
    
    // 计算强度（简化版）
    const maxPossible = Math.max(sourceThoughts.length, targetThoughts.length);
    if (maxPossible === 0) return 0;
    
    return Math.min(10, Math.round((commonThoughts.length / maxPossible) * 10));
  }
}
```

## 6. 仓库接口

仓库接口定义了领域层与基础设施层之间的数据访问契约，领域层通过仓库接口访问数据，而不依赖于具体的数据库实现。

### 6.1 核心仓库接口

| 仓库接口名称 | 功能描述 | 主要方法 |
|--------------|----------|----------|
| `UserRepository` | 用户数据访问 | `findById`, `findByUsername`, `findByEmail`, `save`, `delete` |
| `UserCognitiveModelRepository` | 认知模型数据访问 | `findById`, `findByUserId`, `save`, `delete`, `findLatestByUserId` |
| `CognitiveConceptRepository` | 认知概念数据访问 | `findById`, `findByModelId`, `findByNameAndModelId`, `save`, `delete`, `findByModelIdAndTags` |
| `CognitiveRelationRepository` | 认知关系数据访问 | `findById`, `findByModelId`, `findBySourceConceptId`, `findByTargetConceptId`, `save`, `delete`, `findBySourceAndTarget` |
| `ThoughtFragmentRepository` | 思想片段数据访问 | `findById`, `findByUserId`, `save`, `delete`, `findByTags`, `findByDateRange` |
| `CognitiveInsightRepository` | 认知洞察数据访问 | `findById`, `findByModelId`, `save`, `delete`, `findByStatus`, `findBySeverity` |
| `SuggestionRepository` | 建议数据访问 | `findById`, `findByModelId`, `save`, `delete`, `findByStatus`, `findByPriority` |
| `AppleAuthRepository` | 苹果认证数据访问 | `findById`, `findByUserId`, `findByAppleUserId`, `save`, `delete`, `updateToken` |
| `DeviceTokenRepository` | 设备令牌数据访问 | `findById`, `findByUserId`, `findByDeviceToken`, `save`, `delete`, `updateStatus`, `findActiveByUserId` |

### 6.2 仓库接口实现示例

**UserCognitiveModelRepository接口**：

```typescript
export interface UserCognitiveModelRepository {
  findById(id: string): Promise<UserCognitiveModel | null>;
  findByUserId(userId: string): Promise<UserCognitiveModel[]>;
  findLatestByUserId(userId: string): Promise<UserCognitiveModel | null>;
  save(model: UserCognitiveModel): Promise<UserCognitiveModel>;
  delete(id: string): Promise<void>;
  findByVersion(userId: string, version: number): Promise<UserCognitiveModel | null>;
}
```

## 7. 工厂模式

工厂模式用于创建复杂的领域对象，封装对象创建的复杂性，确保对象创建符合业务规则。

### 7.1 核心工厂

| 工厂名称 | 功能描述 | 主要方法 |
|----------|----------|----------|
| `UserCognitiveModelFactory` | 认知模型工厂 | `createModel`, `createFromExisting` |
| `CognitiveConceptFactory` | 认知概念工厂 | `createConcept`, `createFromThought` |
| `CognitiveRelationFactory` | 认知关系工厂 | `createRelation`, `createFromAnalysis` |
| `ThoughtFragmentFactory` | 思想片段工厂 | `createThought`, `createFromFile`, `createFromAudio` |
| `CognitiveInsightFactory` | 认知洞察工厂 | `createInsight`, `createFromAnalysis` |
| `SuggestionFactory` | 建议工厂 | `createSuggestion`, `createFromInsight` |

### 7.2 工厂实现示例

**CognitiveConceptFactory示例**：

```typescript
export class CognitiveConceptFactory {
  createConcept(
    modelId: string,
    name: string,
    type: string,
    description: string,
    importance: number
  ): CognitiveConcept {
    // 验证参数
    if (!name || name.trim().length === 0) {
      throw new Error('概念名称不能为空');
    }
    
    if (importance < 0 || importance > 10) {
      throw new Error('概念重要性必须在0-10之间');
    }
    
    // 创建概念
    return CognitiveConcept.create(modelId, name, type, description, importance);
  }
  
  createFromThought(
    modelId: string,
    thought: ThoughtFragment,
    extractedName: string,
    extractedType: string
  ): CognitiveConcept {
    // 从思想片段创建概念
    const description = `从思想片段 ${thought.id} 提取`;
    const importance = 5; // 默认重要性
    
    return this.createConcept(modelId, extractedName, extractedType, description, importance);
  }
}
```

## 8. 领域事件

领域事件是领域层中发生的重要业务事件，用于通知其他组件或系统。

### 8.1 核心领域事件

| 事件名称 | 事件类型 | 描述 |
|----------|----------|------|
| `CognitiveModelCreatedEvent` | 模型事件 | 认知模型创建 |
| `CognitiveModelUpdatedEvent` | 模型事件 | 认知模型更新 |
| `ConceptAddedEvent` | 概念事件 | 认知概念添加 |
| `ConceptUpdatedEvent` | 概念事件 | 认知概念更新 |
| `RelationAddedEvent` | 关系事件 | 认知关系添加 |
| `RelationUpdatedEvent` | 关系事件 | 认知关系更新 |
| `ThoughtIngestedEvent` | 思想事件 | 思想片段摄入 |
| `InsightGeneratedEvent` | 洞察事件 | 认知洞察生成 |
| `SuggestionGeneratedEvent` | 建议事件 | 建议生成 |
| `InsightResolvedEvent` | 洞察事件 | 认知洞察解决 |
| `SuggestionAcceptedEvent` | 建议事件 | 建议被接受 |
| `SuggestionRejectedEvent` | 建议事件 | 建议被拒绝 |

### 8.2 领域事件实现示例

**ConceptAddedEvent示例**：

```typescript
export class ConceptAddedEvent {
  constructor(
    public readonly concept: CognitiveConcept,
    public readonly timestamp: Date = new Date()
  ) {}
}
```

## 9. 业务规则

### 9.1 核心业务规则

| 规则名称 | 规则描述 | 实现方式 |
|----------|----------|----------|
| `模型完整性规则` | 每个认知模型必须至少包含一个概念 | 在UserCognitiveModel实体中验证 |
| `概念唯一性规则` | 同一模型内概念名称必须唯一 | 在CognitiveConcept实体中验证 |
| `关系有效性规则` | 关系强度必须在0-10之间，不能与自身建立关系 | 在ConceptRelationService中验证 |
| `洞察优先级规则` | 高严重性洞察优先级高于低严重性 | 在InsightGenerationService中实现 |
| `建议相关性规则` | 建议必须与用户的认知模型相关 | 在SuggestionService中验证 |
| `思想片段规则` | 思想片段内容不能为空，必须关联到用户 | 在ThoughtFragment实体中验证 |
| `用户唯一性规则` | 用户名和邮箱必须唯一 | 在User实体中验证 |
| `模型版本规则` | 模型版本必须递增，不能回退 | 在UserCognitiveModel实体中实现 |

### 9.2 业务规则实现示例

**模型完整性规则示例**：

```typescript
export class UserCognitiveModel {
  // ... 现有代码 ...
  
  validateModelIntegrity(concepts: CognitiveConcept[]): void {
    if (concepts.length === 0) {
      throw new Error('认知模型必须至少包含一个概念');
    }
  }
  
  // ... 现有代码 ...
}
```

## 10. 测试策略

### 10.1 测试原则

- **纯单元测试**：领域层测试不依赖于任何外部服务或基础设施
- **业务规则覆盖**：确保所有业务规则都有对应的测试用例
- **边界条件测试**：测试业务规则的边界条件
- **状态转换测试**：测试实体状态转换的正确性
- **事件测试**：测试领域事件的触发和处理

### 10.2 测试示例

**CognitiveConcept测试示例**：

```typescript
import { CognitiveConcept } from '../entities/CognitiveConcept';

describe('CognitiveConcept', () => {
  describe('create', () => {
    it('should create a valid cognitive concept', () => {
      const modelId = 'model-123';
      const name = '测试概念';
      const type = 'abstract';
      const description = '这是一个测试概念';
      const importance = 5;
      
      const concept = CognitiveConcept.create(modelId, name, type, description, importance);
      
      expect(concept).toBeInstanceOf(CognitiveConcept);
      expect(concept.id).toBeDefined();
      expect(concept.name).toBe(name);
      expect(concept.importance).toBe(importance);
    });
    
    it('should throw error when importance is out of range', () => {
      const modelId = 'model-123';
      const name = '测试概念';
      const type = 'abstract';
      const description = '这是一个测试概念';
      
      // 测试重要性小于0
      expect(() => {
        CognitiveConcept.create(modelId, name, type, description, -1);
      }).toThrow('概念重要性必须在0-10之间');
      
      // 测试重要性大于10
      expect(() => {
        CognitiveConcept.create(modelId, name, type, description, 11);
      }).toThrow('概念重要性必须在0-10之间');
    });
  });
  
  describe('updateImportance', () => {
    it('should update importance correctly', () => {
      const modelId = 'model-123';
      const name = '测试概念';
      const type = 'abstract';
      const description = '这是一个测试概念';
      const importance = 5;
      
      const concept = CognitiveConcept.create(modelId, name, type, description, importance);
      const newImportance = 8;
      
      concept.updateImportance(newImportance);
      
      expect(concept.importance).toBe(newImportance);
    });
  });
});
```

## 11. 实现步骤

### 11.1 阶段1：基础实体实现

1. **实现核心实体**：
   - User
   - UserCognitiveModel
   - CognitiveConcept
   - CognitiveRelation
   - ThoughtFragment
   - CognitiveInsight
   - Suggestion

2. **实现基础值对象**：
   - ConceptImportance
   - RelationStrength
   - InsightSeverity
   - SuggestionPriority

3. **实现工厂类**：
   - UserCognitiveModelFactory
   - CognitiveConceptFactory
   - CognitiveRelationFactory

### 11.2 阶段2：领域服务和仓库接口

1. **实现领域服务**：
   - CognitiveModelService
   - ConceptRelationService
   - ThoughtAnalysisService

2. **实现仓库接口**：
   - UserRepository
   - UserCognitiveModelRepository
   - CognitiveConceptRepository
   - CognitiveRelationRepository
   - ThoughtFragmentRepository

3. **实现领域事件**：
   - ConceptAddedEvent
   - RelationAddedEvent
   - ThoughtIngestedEvent

### 11.3 阶段3：高级业务规则和服务

1. **实现高级领域服务**：
   - InsightGenerationService
   - SuggestionService

2. **实现高级业务规则**：
   - 模型完整性规则
   - 概念唯一性规则
   - 关系有效性规则

3. **实现事件处理机制**：
   - 事件发布和订阅机制
   - 事件处理器接口

### 11.4 阶段4：测试和优化

1. **编写单元测试**：
   - 为所有实体编写单元测试
   - 为所有领域服务编写单元测试
   - 为所有业务规则编写测试用例

2. **优化领域模型**：
   - 重构实体和服务，提高内聚性
   - 简化业务规则实现
   - 优化实体关系设计

3. **文档完善**：
   - 更新实体关系图
   - 完善业务规则文档
   - 编写领域模型使用指南

## 12. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2026-01-09 | 1. 增强了与核心文档和阶段文档的交叉引用<br>2. 添加了详细的领域服务实现示例<br>3. 完善了业务规则描述<br>4. 优化了文档结构和格式 | 系统架构师 |
| 2024-01-08 | 初始创建 | 系统架构师 |
