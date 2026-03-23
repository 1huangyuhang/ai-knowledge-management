# Day 13: 工作流编排 - 代码实现文档

## 1. 当日主题概述

### 1.1 核心开发目标
- 设计并实现工作流框架，用于协调和管理多个用例的执行
- 定义工作流接口和步骤接口
- 实现工作流执行引擎
- 编写单元测试验证工作流功能

### 1.2 技术要点
- 工作流设计模式
- 接口定义与实现
- 数据传输对象
- 错误处理机制
- 单元测试

## 2. 工作流框架设计

### 2.1 工作流核心概念

#### 2.1.1 工作流接口（Workflow）
- 定义工作流的基本操作
- 负责协调多个工作流步骤的执行
- 管理工作流状态和上下文

#### 2.1.2 工作流步骤接口（WorkflowStep）
- 定义单个工作流步骤的执行逻辑
- 封装具体的业务操作
- 支持输入输出数据传递

#### 2.1.3 工作流上下文（WorkflowContext）
- 存储工作流执行过程中的数据
- 支持步骤间的数据共享
- 管理工作流执行状态

### 2.2 工作流架构图

```
┌─────────────────────────────────────┐
│ Workflow Engine                      │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐ │
│  │ Workflow1                       │ │
│  ├─────────┬─────────┬─────────────┤ │
│  │ Step1   │ Step2   │ Step3       │ │
│  └─────────┴─────────┴─────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │ Workflow2                       │ │
│  ├─────────┬─────────┬─────────────┤ │
│  │ Step1   │ Step2   │ Step3       │ │
│  └─────────┴─────────┴─────────────┘ │
└─────────────────────────────────────┘
        ▲              ▲              ▲
        │              │              │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ UseCase1    │ │ UseCase2    │ │ UseCase3    │
└─────────────┘ └─────────────┘ └─────────────┘
```

## 3. 接口定义

### 3.1 工作流相关接口

```typescript
// src/application/interfaces/workflow/Workflow.ts

export interface Workflow<TInput, TOutput> {
  /**
   * 执行工作流
   * @param input 工作流输入数据
   * @returns 工作流输出结果
   */
  execute(input: TInput): Promise<TOutput>;
  
  /**
   * 获取工作流名称
   * @returns 工作流名称
   */
  getName(): string;
  
  /**
   * 添加工作流步骤
   * @param step 工作流步骤
   */
  addStep(step: WorkflowStep<any, any>): void;
}

// src/application/interfaces/workflow/WorkflowStep.ts
export interface WorkflowStep<TInput, TOutput> {
  /**
   * 执行工作流步骤
   * @param input 步骤输入数据
   * @param context 工作流上下文
   * @returns 步骤输出结果
   */
  execute(input: TInput, context: WorkflowContext): Promise<TOutput>;
  
  /**
   * 获取步骤名称
   * @returns 步骤名称
   */
  getName(): string;
}

// src/application/interfaces/workflow/WorkflowContext.ts
export interface WorkflowContext {
  /**
   * 设置上下文数据
   * @param key 键名
   * @param value 键值
   */
  set<T>(key: string, value: T): void;
  
  /**
   * 获取上下文数据
   * @param key 键名
   * @returns 上下文数据
   */
  get<T>(key: string): T | undefined;
  
  /**
   * 获取工作流执行状态
   * @returns 执行状态
   */
  getStatus(): WorkflowStatus;
  
  /**
   * 设置工作流执行状态
   * @param status 执行状态
   */
  setStatus(status: WorkflowStatus): void;
}

// src/application/interfaces/workflow/WorkflowStatus.ts
export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}
```

### 3.2 数据传输对象

```typescript
// src/application/dtos/workflow/WorkflowExecutionDto.ts
export interface WorkflowExecutionDto {
  workflowId: string;
  input: any;
  status: WorkflowStatus;
  result?: any;
  error?: string;
  startTime: Date;
  endTime?: Date;
}

// src/application/dtos/workflow/WorkflowStepExecutionDto.ts
export interface WorkflowStepExecutionDto {
  stepName: string;
  input: any;
  output?: any;
  error?: string;
  startTime: Date;
  endTime: Date;
}
```

## 4. 核心功能实现

### 4.1 工作流上下文实现

```typescript
// src/application/workflow/WorkflowContextImpl.ts

import { WorkflowContext, WorkflowStatus } from '../interfaces/workflow/WorkflowContext';

export class WorkflowContextImpl implements WorkflowContext {
  private readonly data: Map<string, any> = new Map();
  private status: WorkflowStatus = WorkflowStatus.PENDING;
  
  /**
   * 设置上下文数据
   * @param key 键名
   * @param value 键值
   */
  public set<T>(key: string, value: T): void {
    this.data.set(key, value);
  }
  
  /**
   * 获取上下文数据
   * @param key 键名
   * @returns 上下文数据
   */
  public get<T>(key: string): T | undefined {
    return this.data.get(key) as T;
  }
  
  /**
   * 获取工作流执行状态
   * @returns 执行状态
   */
  public getStatus(): WorkflowStatus {
    return this.status;
  }
  
  /**
   * 设置工作流执行状态
   * @param status 执行状态
   */
  public setStatus(status: WorkflowStatus): void {
    this.status = status;
  }
}
```

### 4.2 工作流实现

```typescript
// src/application/workflow/WorkflowImpl.ts

import { Workflow, WorkflowContext, WorkflowStep } from '../interfaces/workflow/Workflow';
import { WorkflowContextImpl } from './WorkflowContextImpl';
import { WorkflowStatus } from '../interfaces/workflow/WorkflowStatus';

export class WorkflowImpl<TInput, TOutput> implements Workflow<TInput, TOutput> {
  private readonly steps: WorkflowStep<any, any>[] = [];
  private readonly name: string;
  
  /**
   * 创建工作流实例
   * @param name 工作流名称
   */
  constructor(name: string) {
    this.name = name;
  }
  
  /**
   * 执行工作流
   * @param input 工作流输入数据
   * @returns 工作流输出结果
   */
  public async execute(input: TInput): Promise<TOutput> {
    const context = new WorkflowContextImpl();
    context.setStatus(WorkflowStatus.RUNNING);
    
    try {
      let result: any = input;
      
      // 依次执行每个步骤
      for (const step of this.steps) {
        result = await step.execute(result, context);
      }
      
      context.setStatus(WorkflowStatus.COMPLETED);
      return result as TOutput;
    } catch (error) {
      context.setStatus(WorkflowStatus.FAILED);
      throw error;
    }
  }
  
  /**
   * 获取工作流名称
   * @returns 工作流名称
   */
  public getName(): string {
    return this.name;
  }
  
  /**
   * 添加工作流步骤
   * @param step 工作流步骤
   */
  public addStep(step: WorkflowStep<any, any>): void {
    this.steps.push(step);
  }
}
```

### 4.3 工作流步骤实现示例

```typescript
// src/application/workflow/steps/IngestThoughtStep.ts

import { WorkflowStep } from '../../interfaces/workflow/WorkflowStep';
import { WorkflowContext } from '../../interfaces/workflow/WorkflowContext';
import { IngestThoughtUseCase } from '../../usecases/IngestThoughtUseCase';
import { ThoughtInputDto } from '../../dtos/ThoughtInputDto';
import { ThoughtOutputDto } from '../../dtos/ThoughtOutputDto';

export class IngestThoughtStep implements WorkflowStep<ThoughtInputDto, ThoughtOutputDto> {
  private readonly ingestThoughtUseCase: IngestThoughtUseCase;
  
  /**
   * 创建思维片段输入步骤
   * @param ingestThoughtUseCase 输入思维片段用例
   */
  constructor(ingestThoughtUseCase: IngestThoughtUseCase) {
    this.ingestThoughtUseCase = ingestThoughtUseCase;
  }
  
  /**
   * 执行思维片段输入步骤
   * @param input 思维片段输入数据
   * @param context 工作流上下文
   * @returns 思维片段输出结果
   */
  public async execute(input: ThoughtInputDto, context: WorkflowContext): Promise<ThoughtOutputDto> {
    const result = await this.ingestThoughtUseCase.execute(input);
    context.set('thoughtId', result.id);
    return result;
  }
  
  /**
   * 获取步骤名称
   * @returns 步骤名称
   */
  public getName(): string {
    return 'IngestThoughtStep';
  }
}

// src/application/workflow/steps/GenerateProposalStep.ts

import { WorkflowStep } from '../../interfaces/workflow/WorkflowStep';
import { WorkflowContext } from '../../interfaces/workflow/WorkflowContext';
import { GenerateProposalUseCase } from '../../usecases/GenerateProposalUseCase';
import { CognitiveProposal } from '../../../domain/entities/CognitiveProposal';

export class GenerateProposalStep implements WorkflowStep<void, CognitiveProposal> {
  private readonly generateProposalUseCase: GenerateProposalUseCase;
  
  /**
   * 创建生成建议步骤
   * @param generateProposalUseCase 生成建议用例
   */
  constructor(generateProposalUseCase: GenerateProposalUseCase) {
    this.generateProposalUseCase = generateProposalUseCase;
  }
  
  /**
   * 执行生成建议步骤
   * @param _ 输入数据（未使用）
   * @param context 工作流上下文
   * @returns 认知建议
   */
  public async execute(_: void, context: WorkflowContext): Promise<CognitiveProposal> {
    const thoughtId = context.get<string>('thoughtId');
    if (!thoughtId) {
      throw new Error('Thought ID not found in context');
    }
    
    const proposal = await this.generateProposalUseCase.execute(thoughtId);
    context.set('proposalId', proposal.id);
    return proposal;
  }
  
  /**
   * 获取步骤名称
   * @returns 步骤名称
   */
  public getName(): string {
    return 'GenerateProposalStep';
  }
}

// src/application/workflow/steps/UpdateCognitiveModelStep.ts

import { WorkflowStep } from '../../interfaces/workflow/WorkflowStep';
import { WorkflowContext } from '../../interfaces/workflow/WorkflowContext';
import { UpdateCognitiveModelUseCase } from '../../usecases/UpdateCognitiveModelUseCase';
import { UserCognitiveModel } from '../../../domain/entities/UserCognitiveModel';

export class UpdateCognitiveModelStep implements WorkflowStep<void, UserCognitiveModel> {
  private readonly updateCognitiveModelUseCase: UpdateCognitiveModelUseCase;
  
  /**
   * 创建更新认知模型步骤
   * @param updateCognitiveModelUseCase 更新认知模型用例
   */
  constructor(updateCognitiveModelUseCase: UpdateCognitiveModelUseCase) {
    this.updateCognitiveModelUseCase = updateCognitiveModelUseCase;
  }
  
  /**
   * 执行更新认知模型步骤
   * @param _ 输入数据（未使用）
   * @param context 工作流上下文
   * @returns 更新后的认知模型
   */
  public async execute(_: void, context: WorkflowContext): Promise<UserCognitiveModel> {
    const proposalId = context.get<string>('proposalId');
    if (!proposalId) {
      throw new Error('Proposal ID not found in context');
    }
    
    const model = await this.updateCognitiveModelUseCase.execute(proposalId);
    context.set('modelId', model.id);
    return model;
  }
  
  /**
   * 获取步骤名称
   * @returns 步骤名称
   */
  public getName(): string {
    return 'UpdateCognitiveModelStep';
  }
}
```

### 4.4 工作流工厂

```typescript
// src/application/workflow/WorkflowFactory.ts

import { Workflow } from '../interfaces/workflow/Workflow';
import { WorkflowImpl } from './WorkflowImpl';
import { IngestThoughtUseCase } from '../usecases/IngestThoughtUseCase';
import { GenerateProposalUseCase } from '../usecases/GenerateProposalUseCase';
import { UpdateCognitiveModelUseCase } from '../usecases/UpdateCognitiveModelUseCase';
import { IngestThoughtStep } from './steps/IngestThoughtStep';
import { GenerateProposalStep } from './steps/GenerateProposalStep';
import { UpdateCognitiveModelStep } from './steps/UpdateCognitiveModelStep';
import { ThoughtInputDto } from '../dtos/ThoughtInputDto';
import { UserCognitiveModel } from '../../domain/entities/UserCognitiveModel';

export class WorkflowFactory {
  private readonly ingestThoughtUseCase: IngestThoughtUseCase;
  private readonly generateProposalUseCase: GenerateProposalUseCase;
  private readonly updateCognitiveModelUseCase: UpdateCognitiveModelUseCase;
  
  /**
   * 创建工作流工厂
   * @param ingestThoughtUseCase 输入思维片段用例
   * @param generateProposalUseCase 生成建议用例
   * @param updateCognitiveModelUseCase 更新认知模型用例
   */
  constructor(
    ingestThoughtUseCase: IngestThoughtUseCase,
    generateProposalUseCase: GenerateProposalUseCase,
    updateCognitiveModelUseCase: UpdateCognitiveModelUseCase
  ) {
    this.ingestThoughtUseCase = ingestThoughtUseCase;
    this.generateProposalUseCase = generateProposalUseCase;
    this.updateCognitiveModelUseCase = updateCognitiveModelUseCase;
  }
  
  /**
   * 创建完整的认知处理工作流
   * @returns 认知处理工作流
   */
  public createCognitiveProcessingWorkflow(): Workflow<ThoughtInputDto, UserCognitiveModel> {
    const workflow = new WorkflowImpl<ThoughtInputDto, UserCognitiveModel>('CognitiveProcessingWorkflow');
    
    // 添加工作流步骤
    workflow.addStep(new IngestThoughtStep(this.ingestThoughtUseCase));
    workflow.addStep(new GenerateProposalStep(this.generateProposalUseCase));
    workflow.addStep(new UpdateCognitiveModelStep(this.updateCognitiveModelUseCase));
    
    return workflow;
  }
}
```

## 5. 错误处理机制

### 5.1 工作流特定错误类型

```typescript
// src/application/errors/WorkflowError.ts

export class WorkflowError extends Error {
  private readonly stepName: string;
  private readonly workflowName: string;
  
  /**
   * 创建工作流错误
   * @param message 错误信息
   * @param workflowName 工作流名称
   * @param stepName 步骤名称
   */
  constructor(message: string, workflowName: string, stepName: string) {
    super(message);
    this.name = 'WorkflowError';
    this.workflowName = workflowName;
    this.stepName = stepName;
  }
  
  /**
   * 获取错误的步骤名称
   * @returns 步骤名称
   */
  public getStepName(): string {
    return this.stepName;
  }
  
  /**
   * 获取错误的工作流名称
   * @returns 工作流名称
   */
  public getWorkflowName(): string {
    return this.workflowName;
  }
}
```

### 5.2 工作流错误处理

```typescript
// src/application/workflow/WorkflowImpl.ts
// 在execute方法中添加错误处理

public async execute(input: TInput): Promise<TOutput> {
  const context = new WorkflowContextImpl();
  context.setStatus(WorkflowStatus.RUNNING);
  
  try {
    let result: any = input;
    
    // 依次执行每个步骤
    for (const step of this.steps) {
      try {
        result = await step.execute(result, context);
      } catch (error) {
        const stepName = step.getName();
        throw new WorkflowError(
          `Step execution failed: ${error instanceof Error ? error.message : String(error)}`,
          this.name,
          stepName
        );
      }
    }
    
    context.setStatus(WorkflowStatus.COMPLETED);
    return result as TOutput;
  } catch (error) {
    context.setStatus(WorkflowStatus.FAILED);
    throw error;
  }
}
```

## 6. 单元测试设计

### 6.1 工作流核心组件测试

```typescript
// src/application/workflow/__tests__/WorkflowContextImpl.test.ts

import { WorkflowContextImpl } from '../WorkflowContextImpl';
import { WorkflowStatus } from '../../interfaces/workflow/WorkflowStatus';

describe('WorkflowContextImpl', () => {
  it('should set and get context data correctly', () => {
    const context = new WorkflowContextImpl();
    context.set('testKey', 'testValue');
    
    const result = context.get<string>('testKey');
    expect(result).toBe('testValue');
  });
  
  it('should set and get workflow status correctly', () => {
    const context = new WorkflowContextImpl();
    expect(context.getStatus()).toBe(WorkflowStatus.PENDING);
    
    context.setStatus(WorkflowStatus.RUNNING);
    expect(context.getStatus()).toBe(WorkflowStatus.RUNNING);
    
    context.setStatus(WorkflowStatus.COMPLETED);
    expect(context.getStatus()).toBe(WorkflowStatus.COMPLETED);
  });
});

// src/application/workflow/__tests__/WorkflowImpl.test.ts

import { WorkflowImpl } from '../WorkflowImpl';
import { WorkflowStep } from '../../interfaces/workflow/WorkflowStep';
import { WorkflowStatus } from '../../interfaces/workflow/WorkflowStatus';

describe('WorkflowImpl', () => {
  it('should execute workflow with multiple steps correctly', async () => {
    // 创建测试步骤
    const step1: WorkflowStep<number, number> = {
      execute: jest.fn(input => Promise.resolve(input + 1)),
      getName: jest.fn(() => 'Step1')
    };
    
    const step2: WorkflowStep<number, number> = {
      execute: jest.fn(input => Promise.resolve(input * 2)),
      getName: jest.fn(() => 'Step2')
    };
    
    // 创建工作流并添加步骤
    const workflow = new WorkflowImpl<number, number>('TestWorkflow');
    workflow.addStep(step1);
    workflow.addStep(step2);
    
    // 执行工作流
    const result = await workflow.execute(5);
    
    // 验证结果
    expect(result).toBe(12); // (5 + 1) * 2 = 12
    expect(step1.execute).toHaveBeenCalledTimes(1);
    expect(step2.execute).toHaveBeenCalledTimes(1);
  });
  
  it('should throw error when step execution fails', async () => {
    // 创建测试步骤，第二个步骤会失败
    const step1: WorkflowStep<number, number> = {
      execute: jest.fn(input => Promise.resolve(input + 1)),
      getName: jest.fn(() => 'Step1')
    };
    
    const step2: WorkflowStep<number, number> = {
      execute: jest.fn(() => Promise.reject(new Error('Step2 failed'))),
      getName: jest.fn(() => 'Step2')
    };
    
    // 创建工作流并添加步骤
    const workflow = new WorkflowImpl<number, number>('TestWorkflow');
    workflow.addStep(step1);
    workflow.addStep(step2);
    
    // 执行工作流并验证错误
    await expect(workflow.execute(5)).rejects.toThrow('Step2 failed');
  });
});
```

### 6.2 工作流步骤集成测试

```typescript
// src/application/workflow/steps/__tests__/IngestThoughtStep.test.ts

import { IngestThoughtStep } from '../IngestThoughtStep';
import { IngestThoughtUseCase } from '../../../usecases/IngestThoughtUseCase';
import { WorkflowContextImpl } from '../../WorkflowContextImpl';

describe('IngestThoughtStep', () => {
  it('should execute ingest thought step correctly', async () => {
    // 模拟依赖
    const mockUseCase = {
      execute: jest.fn(() => Promise.resolve({
        id: 'thought-1',
        content: 'test thought',
        userId: 'user-1',
        metadata: {},
        createdAt: new Date()
      }))
    } as unknown as IngestThoughtUseCase;
    
    // 创建步骤实例
    const step = new IngestThoughtStep(mockUseCase);
    const context = new WorkflowContextImpl();
    
    // 执行步骤
    const input = {
      content: 'test thought',
      userId: 'user-1'
    };
    
    const result = await step.execute(input, context);
    
    // 验证结果
    expect(result).toBeDefined();
    expect(result.id).toBe('thought-1');
    expect(mockUseCase.execute).toHaveBeenCalledWith(input);
    expect(context.get<string>('thoughtId')).toBe('thought-1');
  });
});
```

## 7. 集成与使用示例

### 7.1 工作流在应用中的使用

```typescript
// src/application/services/CognitiveProcessingService.ts

import { WorkflowFactory } from '../workflow/WorkflowFactory';
import { ThoughtInputDto } from '../dtos/ThoughtInputDto';
import { UserCognitiveModel } from '../../domain/entities/UserCognitiveModel';

export class CognitiveProcessingService {
  private readonly workflowFactory: WorkflowFactory;
  
  /**
   * 创建认知处理服务
   * @param workflowFactory 工作流工厂
   */
  constructor(workflowFactory: WorkflowFactory) {
    this.workflowFactory = workflowFactory;
  }
  
  /**
   * 处理用户思维输入
   * @param input 思维输入数据
   * @returns 更新后的认知模型
   */
  public async processThought(input: ThoughtInputDto): Promise<UserCognitiveModel> {
    const workflow = this.workflowFactory.createCognitiveProcessingWorkflow();
    return await workflow.execute(input);
  }
}
```

### 7.2 在控制器中使用工作流服务

```typescript
// src/presentation/controllers/ThoughtController.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { CognitiveProcessingService } from '../../application/services/CognitiveProcessingService';
import { ThoughtInputDto } from '../../application/dtos/ThoughtInputDto';

export class ThoughtController {
  private readonly cognitiveProcessingService: CognitiveProcessingService;
  
  /**
   * 创建思维控制器
   * @param cognitiveProcessingService 认知处理服务
   */
  constructor(cognitiveProcessingService: CognitiveProcessingService) {
    this.cognitiveProcessingService = cognitiveProcessingService;
  }
  
  /**
   * 处理思维输入请求
   * @param request Fastify请求
   * @param reply Fastify响应
   */
  public async ingestThought(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const input = request.body as ThoughtInputDto;
      const result = await this.cognitiveProcessingService.processThought(input);
      
      reply.status(200).send({
        success: true,
        data: result
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
}
```

## 8. 总结

Day 13的核心任务是实现工作流编排框架，用于协调和管理多个用例的执行。通过设计工作流接口、步骤接口和上下文接口，我们创建了一个灵活、可扩展的工作流系统。

工作流框架的主要特点包括：

1. **灵活性**：支持动态添加和移除工作流步骤
2. **可扩展性**：可以轻松创建新的工作流和步骤
3. **可测试性**：每个组件都可以独立测试
4. **错误处理**：提供了详细的错误信息，便于调试和监控
5. **上下文共享**：支持步骤间的数据共享

通过工作流框架，我们可以将复杂的业务流程分解为多个独立的步骤，每个步骤专注于单一功能，提高了代码的可维护性和可测试性。同时，工作流框架也为系统的未来扩展提供了良好的基础，可以轻松添加新的业务流程和功能。

在后续的开发中，我们将继续完善工作流框架，添加更多的工作流类型和步骤，同时优化工作流的执行效率和错误处理机制。