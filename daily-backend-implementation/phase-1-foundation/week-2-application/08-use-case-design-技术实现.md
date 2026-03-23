# Day 08: Application层基础设计 - 代码实现文档

## 1. Use Case设计

### 1.1 Use Case核心原则

Use Case代表系统中的一个完整业务流程，是Application层的核心组件。设计Use Case时应遵循以下原则：

- **单一职责**：每个Use Case只负责一个完整的业务流程
- **清晰的输入输出**：使用DTO（数据传输对象）定义输入和输出
- **依赖抽象**：通过接口依赖Domain层和Infrastructure层
- **事务管理**：在Use Case层面管理事务边界
- **可测试性**：设计便于单元测试的Use Case

### 1.2 Use Case接口设计

```typescript
// src/application/usecases/UseCase.ts
/**
 * Use Case基础接口，定义了所有Use Case必须实现的execute方法
 */
export interface UseCase<I, O> {
  /**
   * 执行Use Case
   * @param input 输入数据，类型为I
   * @returns 输出数据，类型为O
   */
  execute(input: I): Promise<O>;
}
```

### 1.3 核心Use Case接口定义

基于项目需求，我们定义以下核心Use Case：

#### 1.3.1 IngestThoughtUseCase

```typescript
// src/application/usecases/IngestThoughtUseCase.ts
import { UseCase } from './UseCase';

/**
 * 输入思维片段用例，用于接收和存储用户的思维片段
 */
export interface IngestThoughtUseCase extends UseCase<ThoughtInputDto, ThoughtOutputDto> {}

/**
 * 思维片段输入DTO
 */
export interface ThoughtInputDto {
  /**
   * 思维片段内容
   */
  content: string;
  /**
   * 元数据，可选
   */
  metadata?: Record<string, any>;
  /**
   * 用户ID
   */
  userId: string;
}

/**
 * 思维片段输出DTO
 */
export interface ThoughtOutputDto {
  /**
   * 思维片段ID
   */
  id: string;
  /**
   * 思维片段内容
   */
  content: string;
  /**
   * 元数据
   */
  metadata?: Record<string, any>;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 创建时间
   */
  createdAt: Date;
}
```

#### 1.3.2 GenerateProposalUseCase

```typescript
// src/application/usecases/GenerateProposalUseCase.ts
import { UseCase } from './UseCase';
import { CognitiveProposal } from '../../domain/entities/CognitiveProposal';

/**
 * 生成认知建议用例，用于从思维片段生成认知建议
 */
export interface GenerateProposalUseCase extends UseCase<string, CognitiveProposal> {
  /**
   * 执行生成认知建议用例
   * @param input 思维片段ID
   * @returns 生成的认知建议
   */
  execute(input: string): Promise<CognitiveProposal>;
}
```

#### 1.3.3 UpdateCognitiveModelUseCase

```typescript
// src/application/usecases/UpdateCognitiveModelUseCase.ts
import { UseCase } from './UseCase';
import { UserCognitiveModel } from '../../domain/entities/UserCognitiveModel';

/**
 * 更新认知模型用例，用于将认知建议应用到用户认知模型
 */
export interface UpdateCognitiveModelUseCase extends UseCase<string, UserCognitiveModel> {
  /**
   * 执行更新认知模型用例
   * @param input 认知建议ID
   * @returns 更新后的用户认知模型
   */
  execute(input: string): Promise<UserCognitiveModel>;
}
```

#### 1.3.4 GenerateInsightUseCase

```typescript
// src/application/usecases/GenerateInsightUseCase.ts
import { UseCase } from './UseCase';
import { CognitiveInsight } from '../../domain/entities/CognitiveInsight';

/**
 * 生成认知洞察用例，用于从认知模型生成认知洞察
 */
export interface GenerateInsightUseCase extends UseCase<string, CognitiveInsight> {
  /**
   * 执行生成认知洞察用例
   * @param input 认知模型ID
   * @returns 生成的认知洞察
   */
  execute(input: string): Promise<CognitiveInsight>;
}
```

## 2. 数据传输对象(DTO)设计

### 2.1 DTO设计原则

- **扁平化结构**：避免嵌套过深，便于序列化和反序列化
- **仅包含必要字段**：只包含API请求和响应所需的字段
- **类型安全**：使用TypeScript接口定义，确保类型安全
- **与Domain模型分离**：DTO是Application层的概念，与Domain模型解耦

### 2.2 核心DTO定义

```typescript
// src/application/dtos/index.ts

/**
 * 用户DTO
 */
export interface UserDto {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

/**
 * 认知概念DTO
 */
export interface CognitiveConceptDto {
  id: string;
  semanticIdentity: string;
  abstractionLevel: number;
  confidenceScore: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 认知关系DTO
 */
export interface CognitiveRelationDto {
  id: string;
  sourceConceptId: string;
  targetConceptId: string;
  relationType: string;
  confidenceScore: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 认知洞察DTO
 */
export interface CognitiveInsightDto {
  id: string;
  modelId: string;
  coreThemes: string[];
  blindSpots: string[];
  conceptGaps: string[];
  structureSummary: string;
  createdAt: Date;
}
```

## 3. 工作流编排框架设计

### 3.1 工作流编排原则

- **松耦合**：工作流步骤之间通过接口通信，便于替换和扩展
- **可视化**：工作流定义清晰，便于理解和维护
- **可监控**：支持工作流执行状态监控
- **可重试**：支持失败步骤的重试机制
- **事务管理**：支持工作流级别的事务管理

### 3.2 工作流编排实现

```typescript
// src/application/workflow/Workflow.ts
/**
 * 工作流接口，定义了工作流的执行方法
 */
export interface Workflow<I, O> {
  /**
   * 执行工作流
   * @param input 工作流输入
   * @returns 工作流输出
   */
  execute(input: I): Promise<O>;
}

/**
 * 工作流步骤接口
 */
export interface WorkflowStep<I, O> {
  /**
   * 执行工作流步骤
   * @param input 步骤输入
   * @returns 步骤输出
   */
  execute(input: I): Promise<O>;
}

/**
 * 工作流上下文接口
 */
export interface WorkflowContext {
  /**
   * 工作流ID
   */
  workflowId: string;
  /**
   * 执行ID
   */
  executionId: string;
  /**
   * 开始时间
   */
  startTime: Date;
  /**
   * 上下文数据
   */
  data: Record<string, any>;
}
```

### 3.3 工作流实现示例

```typescript
// src/application/workflow/ThoughtProcessingWorkflow.ts
import { Workflow, WorkflowContext, WorkflowStep } from './Workflow';
import { ThoughtInputDto } from '../dtos';
import { CognitiveInsight } from '../../domain/entities';

/**
 * 思维处理工作流，包含多个步骤
 */
export class ThoughtProcessingWorkflow implements Workflow<ThoughtInputDto, CognitiveInsight> {
  private steps: WorkflowStep<any, any>[];

  /**
   * 构造函数，注入工作流步骤
   */
  constructor(
    private ingestThoughtStep: WorkflowStep<ThoughtInputDto, string>,
    private generateProposalStep: WorkflowStep<string, string>,
    private updateModelStep: WorkflowStep<string, string>,
    private generateInsightStep: WorkflowStep<string, CognitiveInsight>
  ) {
    this.steps = [
      this.ingestThoughtStep,
      this.generateProposalStep,
      this.updateModelStep,
      this.generateInsightStep
    ];
  }

  /**
   * 执行工作流
   */
  async execute(input: ThoughtInputDto): Promise<CognitiveInsight> {
    const context: WorkflowContext = {
      workflowId: 'thought-processing',
      executionId: `exec-${Date.now()}`,
      startTime: new Date(),
      data: {}
    };

    let result: any = input;
    for (const step of this.steps) {
      result = await step.execute(result);
    }

    return result as CognitiveInsight;
  }
}
```

## 4. 依赖倒置原则实现

### 4.1 依赖倒置原则核心

- 高层模块（Application层）不依赖低层模块（Domain层、Infrastructure层）
- 两者都依赖抽象（接口）
- 抽象不依赖具体实现
- 具体实现依赖抽象

### 4.2 依赖注入实现

```typescript
// src/application/usecases/IngestThoughtUseCaseImpl.ts
import { IngestThoughtUseCase, ThoughtInputDto, ThoughtOutputDto } from './IngestThoughtUseCase';
import { ThoughtRepository } from '../../domain/interfaces/ThoughtRepository';
import { EventBus } from '../../domain/interfaces/EventBus';
import { ThoughtFragment } from '../../domain/entities/ThoughtFragment';

/**
 * 输入思维片段用例的实现
 */
export class IngestThoughtUseCaseImpl implements IngestThoughtUseCase {
  /**
   * 构造函数，通过依赖注入获取所需的服务
   */
  constructor(
    private readonly thoughtRepository: ThoughtRepository,
    private readonly eventBus: EventBus
  ) {}

  /**
   * 执行用例
   */
  async execute(input: ThoughtInputDto): Promise<ThoughtOutputDto> {
    // 创建ThoughtFragment实体
    const thought = new ThoughtFragment(
      crypto.randomUUID(),
      input.content,
      input.metadata || {},
      input.userId
    );

    // 保存到数据库
    const savedThought = await this.thoughtRepository.save(thought);

    // 发布事件
    this.eventBus.publish('ThoughtIngested', {
      thoughtId: savedThought.id,
      content: savedThought.content,
      timestamp: new Date()
    });

    // 转换为DTO返回
    return {
      id: savedThought.id,
      content: savedThought.content,
      metadata: savedThought.metadata,
      userId: savedThought.userId,
      createdAt: savedThought.createdAt
    };
  }
}
```

### 4.3 依赖注入容器

为了更好地管理依赖，我们可以使用依赖注入容器。这里我们选择使用`tsyringe`作为DI容器：

```typescript
// src/application/di/container.ts
import { container } from 'tsyringe';
import { IngestThoughtUseCase, IngestThoughtUseCaseImpl } from '../usecases';
import { ThoughtRepository } from '../../domain/interfaces';
import { EventBus } from '../../domain/interfaces';

// 注册Use Case
container.register<IngestThoughtUseCase>(
  'IngestThoughtUseCase',
  IngestThoughtUseCaseImpl
);

// 注册接口和实现的映射
container.register<ThoughtRepository>(
  'ThoughtRepository',
  ThoughtRepositoryImpl
);

container.register<EventBus>(
  'EventBus',
  EventBusImpl
);
```

## 5. 接口定义原则

### 5.1 接口设计最佳实践

- **命名清晰**：接口名称应清晰表达其功能
- **职责单一**：每个接口只定义一个功能集合
- **最小化**：接口应尽可能小，只包含必要的方法
- **稳定**：接口一旦发布，应保持稳定，避免频繁变更
- **使用名词**：接口名称使用名词，如`ThoughtRepository`而不是`IThoughtRepository`

### 5.2 核心接口定义

```typescript
// src/domain/interfaces/ThoughtRepository.ts
import { ThoughtFragment } from '../entities/ThoughtFragment';

/**
 * 思维片段仓库接口，定义了思维片段的CRUD操作
 */
export interface ThoughtRepository {
  /**
   * 保存思维片段
   * @param thought 思维片段实体
   * @returns 保存后的思维片段实体
   */
  save(thought: ThoughtFragment): Promise<ThoughtFragment>;

  /**
   * 根据ID查找思维片段
   * @param id 思维片段ID
   * @returns 思维片段实体或null
   */
  findById(id: string): Promise<ThoughtFragment | null>;

  /**
   * 根据用户ID查找思维片段
   * @param userId 用户ID
   * @returns 思维片段实体数组
   */
  findByUserId(userId: string): Promise<ThoughtFragment[]>;

  /**
   * 删除思维片段
   * @param id 思维片段ID
   */
  delete(id: string): Promise<void>;
}
```

```typescript
// src/domain/interfaces/EventBus.ts
/**
 * 事件总线接口，定义了事件的发布和订阅
 */
export interface EventBus {
  /**
   * 订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理器
   */
  subscribe<T>(eventType: string, handler: (event: T) => void): void;

  /**
   * 发布事件
   * @param eventType 事件类型
   * @param event 事件数据
   */
  publish<T>(eventType: string, event: T): void;
}
```

## 6. 代码结构规划

### 6.1 Application层目录结构

```
src/application/
├── usecases/          # Use Case实现
│   ├── UseCase.ts     # Use Case基础接口
│   ├── IngestThoughtUseCase.ts
│   ├── GenerateProposalUseCase.ts
│   ├── UpdateCognitiveModelUseCase.ts
│   └── GenerateInsightUseCase.ts
├── dtos/              # 数据传输对象
│   └── index.ts
├── workflow/          # 工作流编排
│   ├── Workflow.ts
│   └── ThoughtProcessingWorkflow.ts
├── di/                # 依赖注入配置
│   └── container.ts
└── interfaces/        # Application层接口
```

### 6.2 核心文件清单

| 文件路径 | 描述 |
|---------|------|
| `src/application/usecases/UseCase.ts` | Use Case基础接口 |
| `src/application/usecases/IngestThoughtUseCase.ts` | 输入思维片段用例 |
| `src/application/usecases/GenerateProposalUseCase.ts` | 生成认知建议用例 |
| `src/application/usecases/UpdateCognitiveModelUseCase.ts` | 更新认知模型用例 |
| `src/application/usecases/GenerateInsightUseCase.ts` | 生成认知洞察用例 |
| `src/application/dtos/index.ts` | 数据传输对象定义 |
| `src/application/workflow/Workflow.ts` | 工作流基础接口 |
| `src/application/workflow/ThoughtProcessingWorkflow.ts` | 思维处理工作流 |
| `src/application/di/container.ts` | 依赖注入配置 |

## 7. 测试策略

### 7.1 Use Case测试

Use Case的测试应模拟其依赖，验证业务逻辑的正确性：

```typescript
// src/application/usecases/__tests__/IngestThoughtUseCase.test.ts
import { IngestThoughtUseCaseImpl } from '../IngestThoughtUseCaseImpl';
import { ThoughtRepository } from '../../../domain/interfaces';
import { EventBus } from '../../../domain/interfaces';

// 模拟依赖
const mockThoughtRepository: jest.Mocked<ThoughtRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  delete: jest.fn()
};

const mockEventBus: jest.Mocked<EventBus> = {
  subscribe: jest.fn(),
  publish: jest.fn()
};

describe('IngestThoughtUseCaseImpl', () => {
  let useCase: IngestThoughtUseCaseImpl;

  beforeEach(() => {
    // 重置模拟
    jest.clearAllMocks();
    // 创建Use Case实例
    useCase = new IngestThoughtUseCaseImpl(mockThoughtRepository, mockEventBus);
  });

  it('should ingest a thought correctly', async () => {
    // 准备测试数据
    const input = {
      content: '测试思维片段',
      userId: 'user-1'
    };

    // 设置模拟返回值
    mockThoughtRepository.save.mockResolvedValue({
      id: 'thought-1',
      content: '测试思维片段',
      metadata: {},
      userId: 'user-1',
      createdAt: new Date()
    });

    // 执行Use Case
    const result = await useCase.execute(input);

    // 验证结果
    expect(result).toBeDefined();
    expect(result.content).toBe(input.content);
    expect(mockThoughtRepository.save).toHaveBeenCalled();
    expect(mockEventBus.publish).toHaveBeenCalledWith('ThoughtIngested', expect.any(Object));
  });
});
```

### 7.2 工作流测试

工作流测试应验证工作流步骤的正确执行顺序：

```typescript
// src/application/workflow/__tests__/ThoughtProcessingWorkflow.test.ts
import { ThoughtProcessingWorkflow } from '../ThoughtProcessingWorkflow';

// 模拟工作流步骤
const mockIngestStep = {
  execute: jest.fn().mockResolvedValue('thought-1')
};

const mockGenerateProposalStep = {
  execute: jest.fn().mockResolvedValue('proposal-1')
};

const mockUpdateModelStep = {
  execute: jest.fn().mockResolvedValue('model-1')
};

const mockGenerateInsightStep = {
  execute: jest.fn().mockResolvedValue({
    id: 'insight-1',
    modelId: 'model-1',
    coreThemes: ['主题1'],
    blindSpots: [],
    conceptGaps: [],
    structureSummary: '测试摘要',
    createdAt: new Date()
  })
};

describe('ThoughtProcessingWorkflow', () => {
  let workflow: ThoughtProcessingWorkflow;

  beforeEach(() => {
    jest.clearAllMocks();
    workflow = new ThoughtProcessingWorkflow(
      mockIngestStep,
      mockGenerateProposalStep,
      mockUpdateModelStep,
      mockGenerateInsightStep
    );
  });

  it('should execute all steps in order', async () => {
    // 准备测试数据
    const input = {
      content: '测试思维片段',
      userId: 'user-1'
    };

    // 执行工作流
    const result = await workflow.execute(input);

    // 验证结果
    expect(result).toBeDefined();
    expect(mockIngestStep.execute).toHaveBeenCalledWith(input);
    expect(mockGenerateProposalStep.execute).toHaveBeenCalledWith('thought-1');
    expect(mockUpdateModelStep.execute).toHaveBeenCalledWith('proposal-1');
    expect(mockGenerateInsightStep.execute).toHaveBeenCalledWith('model-1');
  });
});
```

## 8. 总结

Day 08的核心任务是设计Application层的基础结构，包括Use Case、DTO、工作流编排和接口定义。通过遵循依赖倒置原则和单一职责原则，我们设计了清晰、可测试、可扩展的Application层架构。

在后续的开发中，我们将基于今天设计的接口实现具体的Use Case，并逐步完善工作流编排框架。通过这种分层设计，我们确保了系统的可维护性和可扩展性，便于后续功能的扩展和修改。

### 关键成果

1. 定义了Use Case基础接口和核心Use Case
2. 设计了完整的DTO体系
3. 实现了工作流编排框架
4. 应用了依赖倒置原则
5. 规划了清晰的目录结构
6. 设计了测试策略

这些成果为后续Application层的开发奠定了坚实的基础，确保了系统的架构正确性和可扩展性。