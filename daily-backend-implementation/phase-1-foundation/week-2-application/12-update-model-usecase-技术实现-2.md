# Day 12: UpdateCognitiveModelUseCase实现 - 代码实现文档 (Part 2)

## 4. 数据持久化实现

### 4.1 CognitiveModelRepository实现

```typescript
// src/infrastructure/persistence/repositories/SQLiteCognitiveModelRepository.ts
import { BaseRepositoryImpl } from './BaseRepositoryImpl';
import { CognitiveModelRepository } from '../../../domain/interfaces/CognitiveModelRepository';
import { UserCognitiveModel } from '../../../domain/entities/UserCognitiveModel';
import { SQLiteConnection } from '../SQLiteConnection';
import { CognitiveConcept } from '../../../domain/entities/CognitiveConcept';
import { CognitiveRelation } from '../../../domain/entities/CognitiveRelation';
import { EvolutionHistory } from '../../../domain/value-objects/EvolutionHistory';

/**
 * SQLite认知模型仓库实现，继承自基础仓库实现
 */
export class SQLiteCognitiveModelRepository extends BaseRepositoryImpl<UserCognitiveModel, string> implements CognitiveModelRepository {
  /**
   * 构造函数
   * @param connection SQLite连接
   */
  constructor(connection: SQLiteConnection) {
    super(connection, 'cognitive_models');
  }

  /**
   * 根据用户ID查找认知模型
   */
  async findByUserId(userId: string): Promise<UserCognitiveModel | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE user_id = ?`;
    const rows = await this.connection.query(sql, [userId]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return this.mapRowToEntity(rows[0]);
  }

  /**
   * 根据用户ID查找最新的认知模型
   */
  async findLatestByUserId(userId: string): Promise<UserCognitiveModel | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`;
    const rows = await this.connection.query(sql, [userId]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return this.mapRowToEntity(rows[0]);
  }

  /**
   * 创建认知模型
   */
  protected async create(entity: UserCognitiveModel): Promise<UserCognitiveModel> {
    const sql = `
      INSERT INTO ${this.tableName} (id, user_id, concepts, relations, evolution_history, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.connection.execute(sql, [
      entity.id,
      entity.userId,
      JSON.stringify(entity.concepts),
      JSON.stringify(entity.relations),
      JSON.stringify(entity.evolutionHistory),
      entity.createdAt.toISOString(),
      entity.updatedAt.toISOString()
    ]);
    
    return entity;
  }

  /**
   * 更新认知模型
   */
  protected async update(entity: UserCognitiveModel): Promise<UserCognitiveModel> {
    const sql = `
      UPDATE ${this.tableName} 
      SET concepts = ?, relations = ?, evolution_history = ?, updated_at = ? 
      WHERE id = ?
    `;
    
    await this.connection.execute(sql, [
      JSON.stringify(entity.concepts),
      JSON.stringify(entity.relations),
      JSON.stringify(entity.evolutionHistory),
      new Date().toISOString(),
      entity.id
    ]);
    
    return entity;
  }

  /**
   * 将数据库行映射为认知模型实体
   */
  protected mapRowToEntity(row: any): UserCognitiveModel {
    // 解析概念
    const concepts: CognitiveConcept[] = JSON.parse(row.concepts).map((c: any) => new CognitiveConcept(
      c.id,
      c.semanticIdentity,
      c.abstractionLevel,
      c.confidenceScore,
      c.description,
      new Date(c.createdAt),
      new Date(c.updatedAt)
    ));
    
    // 解析关系
    const relations: CognitiveRelation[] = JSON.parse(row.relations).map((r: any) => new CognitiveRelation(
      r.id,
      r.sourceConceptId,
      r.targetConceptId,
      r.relationType,
      r.confidenceScore,
      new Date(r.createdAt),
      new Date(r.updatedAt)
    ));
    
    // 解析演化历史
    const evolutionHistory: EvolutionHistory[] = JSON.parse(row.evolution_history);
    
    // 创建认知模型
    const model = new UserCognitiveModel(
      row.id,
      row.user_id,
      concepts,
      relations,
      evolutionHistory,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
    
    return model;
  }
}
```

## 5. 事件触发机制

### 5.1 事件监听器实现

```typescript
// src/infrastructure/event-listeners/CognitiveModelUpdatedListener.ts
import { EventBus } from '../../domain/interfaces/EventBus';
import { GenerateInsightUseCase } from '../../application/usecases/GenerateInsightUseCase';

/**
 * 认知模型更新事件监听器，用于在认知模型更新后生成认知洞察
 */
export class CognitiveModelUpdatedListener {
  /**
   * 构造函数
   * @param eventBus 事件总线
   * @param generateInsightUseCase 生成认知洞察用例
   */
  constructor(
    eventBus: EventBus,
    private readonly generateInsightUseCase: GenerateInsightUseCase
  ) {
    // 订阅CognitiveModelUpdated事件
    eventBus.subscribe('CognitiveModelUpdated', this.handle.bind(this));
  }

  /**
   * 处理CognitiveModelUpdated事件
   * @param event 事件数据
   */
  private async handle(event: { modelId: string }): Promise<void> {
    try {
      // 调用生成认知洞察用例
      await this.generateInsightUseCase.execute(event.modelId);
    } catch (error) {
      console.error(`Error generating insight for model ${event.modelId}:`, error);
    }
  }
}
```

## 6. 单元测试设计

### 6.1 UpdateCognitiveModelUseCase测试

```typescript
// src/application/usecases/__tests__/UpdateCognitiveModelUseCaseImpl.test.ts
import { UpdateCognitiveModelUseCaseImpl } from '../UpdateCognitiveModelUseCaseImpl';
import { CognitiveModelService } from '../../../domain/interfaces/CognitiveModelService';
import { NotFoundError, ValidationError } from '../../../shared/errors';

// 模拟依赖
const mockCognitiveProposalRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findByThoughtId: jest.fn()
};

const mockCognitiveModelRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findLatestByUserId: jest.fn()
};

const mockCognitiveModelService: jest.Mocked<CognitiveModelService> = {
  validateProposal: jest.fn(() => true),
  maintainConsistency: jest.fn(),
  generateInsight: jest.fn()
};

const mockEventBus = {
  subscribe: jest.fn(),
  publish: jest.fn()
};

const mockInputValidator = {
  validateThoughtInput: jest.fn(input => input)
};

describe('UpdateCognitiveModelUseCaseImpl', () => {
  let useCase: UpdateCognitiveModelUseCaseImpl;

  beforeEach(() => {
    // 重置模拟
    jest.clearAllMocks();
    // 创建Use Case实例
    useCase = new UpdateCognitiveModelUseCaseImpl(
      mockCognitiveProposalRepository,
      mockCognitiveModelRepository,
      mockCognitiveModelService,
      mockEventBus,
      mockInputValidator as any
    );
  });

  it('should update cognitive model correctly', async () => {
    // 准备测试数据
    const proposalId = 'proposal-1';
    const mockProposal = {
      id: proposalId,
      thoughtId: 'thought-1',
      concepts: [
        {
          semanticIdentity: 'test-concept',
          abstractionLevel: 3,
          confidenceScore: 0.8,
          description: 'Test concept'
        }
      ],
      relations: [],
      confidence: 0.9,
      reasoningTrace: ['reasoning'],
      createdAt: new Date()
    };

    const mockModel = {
      id: 'model-1',
      userId: 'user-1',
      concepts: [],
      relations: [],
      evolutionHistory: [],
      addConcept: jest.fn(),
      addRelation: jest.fn(),
      updateConcept: jest.fn(),
      updateRelation: jest.fn(),
      removeConcept: jest.fn(),
      removeRelation: jest.fn()
    };

    // 设置模拟返回值
    mockCognitiveProposalRepository.findById.mockResolvedValue(mockProposal as any);
    mockCognitiveModelRepository.findByUserId.mockResolvedValue(mockModel as any);
    mockCognitiveModelRepository.save.mockResolvedValue(mockModel as any);

    // 执行Use Case
    const result = await useCase.execute(proposalId);

    // 验证结果
    expect(result).toBeDefined();
    expect(mockCognitiveProposalRepository.findById).toHaveBeenCalledWith(proposalId);
    expect(mockCognitiveModelRepository.findByUserId).toHaveBeenCalled();
    expect(mockModel.addConcept).toHaveBeenCalled();
    expect(mockCognitiveModelService.maintainConsistency).toHaveBeenCalledWith(mockModel);
    expect(mockCognitiveModelRepository.save).toHaveBeenCalled();
    expect(mockEventBus.publish).toHaveBeenCalledWith('CognitiveModelUpdated', expect.any(Object));
  });

  it('should throw ValidationError for empty proposalId', async () => {
    // 执行Use Case并验证是否抛出错误
    await expect(useCase.execute('')).rejects.toThrow(ValidationError);
  });

  it('should throw NotFoundError for non-existent proposal', async () => {
    // 设置模拟返回null
    mockCognitiveProposalRepository.findById.mockResolvedValue(null);

    // 执行Use Case并验证是否抛出错误
    await expect(useCase.execute('non-existent-id')).rejects.toThrow(NotFoundError);
  });

  it('should create new model if not exists', async () => {
    // 准备测试数据
    const proposalId = 'proposal-1';
    const mockProposal = {
      id: proposalId,
      thoughtId: 'thought-1',
      concepts: [],
      relations: [],
      confidence: 0.9,
      reasoningTrace: ['reasoning'],
      createdAt: new Date()
    };

    // 设置模拟返回值
    mockCognitiveProposalRepository.findById.mockResolvedValue(mockProposal as any);
    mockCognitiveModelRepository.findByUserId.mockResolvedValue(null);
    mockCognitiveModelRepository.save.mockResolvedValue({} as any);

    // 执行Use Case
    await useCase.execute(proposalId);

    // 验证结果
    expect(mockCognitiveModelRepository.save).toHaveBeenCalled();
  });
});
```

## 7. API接口实现

### 7.1 控制器实现

```typescript
// src/presentation/controllers/CognitiveModelController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { UpdateCognitiveModelUseCase } from '../../application/usecases/UpdateCognitiveModelUseCase';

/**
 * 认知模型控制器，处理与认知模型相关的HTTP请求
 */
export class CognitiveModelController {
  /**
   * 构造函数
   * @param updateCognitiveModelUseCase 更新认知模型用例
   */
  constructor(private readonly updateCognitiveModelUseCase: UpdateCognitiveModelUseCase) {}

  /**
   * 处理POST /api/v1/models/update请求，用于更新认知模型
   * @param request Fastify请求对象
   * @param reply Fastify响应对象
   */
  async updateModel(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // 获取认知建议ID
      const { proposalId } = request.body as { proposalId: string };
      // 调用更新认知模型用例
      const result = await this.updateCognitiveModelUseCase.execute(proposalId);
      // 返回200 OK响应
      reply.status(200).send(result);
    } catch (error) {
      // 错误会被全局错误处理中间件捕获
      throw error;
    }
  }
}
```

### 7.2 路由配置

```typescript
// src/presentation/routes/cognitiveModelRoutes.ts
import { FastifyInstance } from 'fastify';
import { CognitiveModelController } from '../controllers/CognitiveModelController';

/**
 * 认知模型路由配置
 * @param app Fastify实例
 * @param cognitiveModelController 认知模型控制器
 */
export const cognitiveModelRoutes = (
  app: FastifyInstance,
  cognitiveModelController: CognitiveModelController
): void => {
  // 更新认知模型
  app.post('/api/v1/models/update', (request, reply) => 
    cognitiveModelController.updateModel(request, reply)
  );
};
```

### 7.3 应用初始化

```typescript
// src/presentation/app.ts
// 扩展createApp函数，添加认知模型相关的依赖和路由

export async function createApp(): Promise<ReturnType<typeof fastify>> {
  // ... 现有代码 ...

  // 创建认知模型服务
  const cognitiveModelService = new CognitiveModelServiceImpl();

  // 创建认知模型仓库
  const cognitiveModelRepository = new SQLiteCognitiveModelRepository(sqliteConnection);

  // 创建Use Case实例
  const updateCognitiveModelUseCase = new UpdateCognitiveModelUseCaseImpl(
    cognitiveProposalRepository,
    cognitiveModelRepository,
    cognitiveModelService,
    eventBus,
    inputValidator
  );

  // 创建控制器实例
  const cognitiveModelController = new CognitiveModelController(updateCognitiveModelUseCase);

  // 注册路由
  thoughtRoutes(app, thoughtController);
  cognitiveProposalRoutes(app, cognitiveProposalController);
  cognitiveModelRoutes(app, cognitiveModelController);

  return app;
}
```

## 8. 总结

Day 12的核心任务是实现UpdateCognitiveModelUseCase，这是系统中将AI生成的认知建议应用到用户认知模型的关键用例。通过今天的开发，我们完成了以下工作：

1. 设计了UpdateCognitiveModelUseCase的核心逻辑
2. 实现了认知模型更新流程，包括概念和关系的添加
3. 实现了认知模型服务，用于维护模型的一致性
4. 实现了认知模型的持久化
5. 添加了事件触发机制，在模型更新后通知其他模块
6. 编写了单元测试，验证Use Case的正确性
7. 实现了API接口

今天的实现遵循了Clean Architecture和DDD原则，确保了代码的可维护性、可扩展性和可测试性。我们使用了依赖注入模式，将Use Case与具体的实现细节解耦，使得系统更容易测试和扩展。

在后续的开发中，我们将继续实现GenerateInsightUseCase，用于从认知模型生成认知洞察，以及其他剩余的Use Case。