# 应用层设计文档

索引标签：#应用层 #服务设计 #用例设计 #工作流 #事件处理

## 相关文档

- [领域层设计](domain-layer-design.md)：详细描述领域层的设计
- [基础设施层设计](infrastructure-layer-design.md)：详细描述基础设施层的设计
- [表示层设计](presentation-layer-design.md)：详细描述表示层的设计
- [架构对齐](../architecture-design/architecture-alignment.md)：描述应用层在系统架构中的位置和作用
- [第一阶段：系统地基期 - Use Case设计实现](../../phase-1-foundation/week-2-application/08-use-case-design-technical-implementation.md)：详细描述Use Case设计的技术实现
- [第一阶段：系统地基期 - Ingest Thought UseCase实现](../../phase-1-foundation/week-2-application/09-ingest-thought-usecase-technical-implementation.md)：详细描述Ingest Thought用例的实现
- [第一阶段：系统地基期 - Generate Proposal UseCase实现](../../phase-1-foundation/week-2-application/10-generate-proposal-usecase-technical-implementation.md)：详细描述Generate Proposal用例的实现
- [第一阶段：系统地基期 - Update Model UseCase实现](../../phase-1-foundation/week-2-application/12-update-model-usecase-technical-implementation.md)：详细描述Update Model用例的实现
- [第一阶段：系统地基期 - 工作流编排实现](../../phase-1-foundation/week-2-application/13-workflow-orchestration-technical-implementation.md)：详细描述工作流编排的实现

## 1. 文档概述

本文档详细描述了认知辅助系统应用层的设计和实现，包括服务、用例、工作流等组件。应用层是系统的业务逻辑层，负责协调领域层和基础设施层，实现系统的核心业务功能。

应用层设计遵循Clean Architecture原则，依赖于领域层，而不直接依赖于基础设施层，确保了系统的可测试性和可维护性。

## 2. 设计原则

### 2.1 分层设计原则

- **依赖倒置**：应用层依赖于领域层接口，而不依赖于具体实现
- **单一职责**：每个服务或用例只负责处理一种类型的业务逻辑
- **开放封闭**：对扩展开放，对修改封闭
- **接口隔离**：使用小而具体的接口，而不是大而全的接口
- **依赖注入**：使用依赖注入容器管理组件之间的依赖关系

### 2.2 设计目标

1. **清晰的业务逻辑**：将业务逻辑与技术实现分离，便于理解和维护
2. **良好的可测试性**：设计便于单元测试和集成测试的组件
3. **可扩展性**：便于添加新的业务功能
4. **松耦合**：组件之间通过接口通信，降低耦合度
5. **事务管理**：确保业务操作的原子性和一致性

## 3. 组件设计

### 3.1 服务设计

服务是应用层的核心组件，负责实现特定的业务功能，调用领域层的实体和仓库，以及基础设施层的服务。

#### 3.1.1 服务基类

设计一个服务基类，提供通用功能：

```typescript
export abstract class BaseService {
  protected validate<T>(data: any, schema: any): T {
    return schema.parse(data);
  }
}
```

#### 3.1.2 核心服务设计

| 服务名称 | 功能描述 | 主要方法 |
|----------|----------|----------|
| `FileUploadService` | 处理文件上传和解析 | `uploadFile`, `getFile`, `listFiles` |
| `SpeechRecognitionService` | 处理语音转文字 | `uploadAudio`, `transcribeAudio`, `getTranscript` |
| `AISchedulerService` | 管理AI任务调度 | `createTask`, `getTask`, `listTasks`, `cancelTask` |
| `InputIntegrationService` | 处理输入整合 | `submitTextInput`, `listInputs`, `mergeInputs` |
| `CognitiveModelService` | 管理认知模型 | `getModel`, `updateModel`, `listModels` |
| `InsightService` | 生成和管理认知洞察 | `generateInsights`, `getInsights`, `resolveInsight` |
| `SuggestionService` | 生成和管理建议 | `generateSuggestions`, `getSuggestions`, `feedbackSuggestion` |
| `FileProcessorService` | 处理文件内容提取 | `processFile`, `extractText`, `extractImages` |
| `AudioProcessorService` | 处理音频内容提取 | `processAudio`, `normalizeAudio`, `extractSegments` |
| `AppleAuthService` | 处理苹果认证 | `generateAuthUrl`, `exchangeCodeForToken`, `verifyIdToken`, `refreshToken` |
| `APNsService` | 处理苹果推送通知 | `sendNotification`, `sendBatchNotifications`, `registerDeviceToken`, `unregisterDeviceToken` |

#### 3.1.3 服务实现示例

**FileUploadService示例**：

```typescript
import { FileUploadService as FileUploadServiceInterface } from '../../domain/repositories/FileUploadService';
import { FileStorageService } from '../../infrastructure/file-storage/FileStorageService';
import { FileRepository } from '../../domain/repositories/FileRepository';
import { FileProcessorService } from './FileProcessorService';
import { File } from '../../domain/entities/File';
import { BaseService } from './BaseService';
import { FileUploadRequest } from '../../presentation/requests/FileUploadRequest';

export class FileUploadService extends BaseService implements FileUploadServiceInterface {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly fileRepository: FileRepository,
    private readonly fileProcessorService: FileProcessorService
  ) {
    super();
  }

  async uploadFile(file: File, type?: string, tags?: string): Promise<File> {
    // 1. 存储文件
    const filePath = await this.fileStorageService.storeFile(file);
    
    // 2. 提取文件元数据
    const metadata = await this.fileProcessorService.extractMetadata(file);
    
    // 3. 创建文件实体
    const fileEntity = File.create({
      name: file.name,
      type: type || metadata.type,
      size: file.size,
      mimeType: file.type,
      filePath,
      tags: tags?.split(',') || [],
      metadata
    });
    
    // 4. 保存到数据库
    const savedFile = await this.fileRepository.save(fileEntity);
    
    // 5. 异步处理文件内容
    this.fileProcessorService.processFile(savedFile.id).catch(error => {
      console.error('Error processing file:', error);
    });
    
    return savedFile;
  }

  async getFile(id: string): Promise<File | null> {
    return this.fileRepository.findById(id);
  }

  async listFiles(type?: string, page: number = 1, limit: number = 10): Promise<{
    files: File[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.fileRepository.findAll(type, page, limit);
  }
}
```

### 3.2 用例设计

用例是应用层的另一个核心组件，负责实现特定的业务流程，调用一个或多个服务来完成业务功能。

#### 3.2.1 核心用例设计

| 用例名称 | 功能描述 | 主要方法 |
|----------|----------|----------|
| `IngestThoughtUseCase` | 处理思想片段输入 | `execute` |
| `GenerateInsightUseCase` | 生成认知洞察 | `execute` |
| `GenerateSuggestionUseCase` | 生成个性化建议 | `execute` |
| `UpdateCognitiveModelUseCase` | 更新认知模型 | `execute` |
| `AnalyzeInputUseCase` | 分析输入内容 | `execute` |
| `ProcessFileUseCase` | 处理文件内容 | `execute` |
| `ProcessSpeechUseCase` | 处理语音内容 | `execute` |
| `IntegrateInputsUseCase` | 整合多种输入 | `execute` |

#### 3.2.2 用例实现示例

**IngestThoughtUseCase示例**：

```typescript
import { IngestThoughtUseCase as IngestThoughtUseCaseInterface } from '../../domain/use-cases/IngestThoughtUseCase';
import { CognitiveModelService } from '../services/CognitiveModelService';
import { InputIntegrationService } from '../services/InputIntegrationService';
import { InsightService } from '../services/InsightService';
import { SuggestionService } from '../services/SuggestionService';
import { ThoughtFragment } from '../../domain/entities/ThoughtFragment';
import { ThoughtIngestRequest } from '../../presentation/requests/ThoughtIngestRequest';

export class IngestThoughtUseCase implements IngestThoughtUseCaseInterface {
  constructor(
    private readonly cognitiveModelService: CognitiveModelService,
    private readonly inputIntegrationService: InputIntegrationService,
    private readonly insightService: InsightService,
    private readonly suggestionService: SuggestionService
  ) {}

  async execute(request: ThoughtIngestRequest): Promise<{
    thoughtFragment: ThoughtFragment;
    insightsGenerated: number;
    suggestionsGenerated: number;
  }> {
    // 1. 提交文本输入
    const inputResult = await this.inputIntegrationService.submitTextInput({
      text: request.text,
      type: request.type,
      tags: request.tags
    });
    
    // 2. 更新认知模型
    await this.cognitiveModelService.updateModel({
      modelId: request.modelId,
      thoughtFragmentId: inputResult.thoughtFragment.id
    });
    
    // 3. 生成洞察
    const insightsResult = await this.insightService.generateInsights({
      modelId: request.modelId,
      thoughtFragmentId: inputResult.thoughtFragment.id
    });
    
    // 4. 生成建议
    const suggestionsResult = await this.suggestionService.generateSuggestions({
      modelId: request.modelId,
      insightIds: insightsResult.insights.map(insight => insight.id)
    });
    
    return {
      thoughtFragment: inputResult.thoughtFragment,
      insightsGenerated: insightsResult.insights.length,
      suggestionsGenerated: suggestionsResult.suggestions.length
    };
  }
}
```

### 3.3 工作流设计

工作流是应用层的高级组件，负责协调多个用例或服务，实现复杂的业务流程。

#### 3.3.1 核心工作流设计

| 工作流名称 | 功能描述 | 主要步骤 |
|------------|----------|----------|
| `CognitiveAnalysisWorkflow` | 完整的认知分析流程 | 输入处理 → 模型更新 → 洞察生成 → 建议生成 |
| `FileProcessingWorkflow` | 文件处理流程 | 文件上传 → 内容提取 → 思想片段生成 → 认知分析 |
| `SpeechProcessingWorkflow` | 语音处理流程 | 音频上传 → 语音转文字 → 思想片段生成 → 认知分析 |
| `InputIntegrationWorkflow` | 输入整合流程 | 输入收集 → 输入合并 → 输入分类 → 认知分析 |

#### 3.3.2 工作流实现示例

**CognitiveAnalysisWorkflow示例**：

```typescript
import { CognitiveAnalysisWorkflow as CognitiveAnalysisWorkflowInterface } from '../../domain/workflows/CognitiveAnalysisWorkflow';
import { AnalyzeInputUseCase } from '../use-cases/AnalyzeInputUseCase';
import { UpdateCognitiveModelUseCase } from '../use-cases/UpdateCognitiveModelUseCase';
import { GenerateInsightUseCase } from '../use-cases/GenerateInsightUseCase';
import { GenerateSuggestionUseCase } from '../use-cases/GenerateSuggestionUseCase';
import { CognitiveAnalysisRequest } from '../../presentation/requests/CognitiveAnalysisRequest';

export class CognitiveAnalysisWorkflow implements CognitiveAnalysisWorkflowInterface {
  constructor(
    private readonly analyzeInputUseCase: AnalyzeInputUseCase,
    private readonly updateCognitiveModelUseCase: UpdateCognitiveModelUseCase,
    private readonly generateInsightUseCase: GenerateInsightUseCase,
    private readonly generateSuggestionUseCase: GenerateSuggestionUseCase
  ) {}

  async execute(request: CognitiveAnalysisRequest): Promise<{
    analysisId: string;
    modelUpdated: boolean;
    insights: any[];
    suggestions: any[];
  }> {
    const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 1. 分析输入
    const analysisResult = await this.analyzeInputUseCase.execute({
      analysisId,
      inputType: request.inputType,
      inputId: request.inputId
    });
    
    // 2. 更新认知模型
    const modelUpdateResult = await this.updateCognitiveModelUseCase.execute({
      analysisId,
      modelId: request.modelId,
      analysisResult: analysisResult
    });
    
    // 3. 生成洞察
    const insightResult = await this.generateInsightUseCase.execute({
      analysisId,
      modelId: request.modelId,
      analysisResult: analysisResult
    });
    
    // 4. 生成建议
    const suggestionResult = await this.generateSuggestionUseCase.execute({
      analysisId,
      modelId: request.modelId,
      insights: insightResult.insights
    });
    
    return {
      analysisId,
      modelUpdated: modelUpdateResult.updated,
      insights: insightResult.insights,
      suggestions: suggestionResult.suggestions
    };
  }
}
```

### 3.4 事件处理设计

事件处理是应用层的重要组件，负责处理系统内部和外部的事件，实现事件驱动的业务流程。

#### 3.4.1 事件类型设计

| 事件名称 | 事件类型 | 描述 |
|----------|----------|------|
| `FileUploadedEvent` | 内部事件 | 文件上传完成 |
| `FileProcessedEvent` | 内部事件 | 文件处理完成 |
| `AudioUploadedEvent` | 内部事件 | 音频上传完成 |
| `AudioTranscribedEvent` | 内部事件 | 音频转文字完成 |
| `AITaskCreatedEvent` | 内部事件 | AI任务创建 |
| `AITaskCompletedEvent` | 内部事件 | AI任务完成 |
| `CognitiveModelUpdatedEvent` | 内部事件 | 认知模型更新 |
| `InsightsGeneratedEvent` | 内部事件 | 洞察生成完成 |
| `SuggestionsGeneratedEvent` | 内部事件 | 建议生成完成 |

#### 3.4.2 事件处理实现示例

**EventBus示例**：

```typescript
export type EventHandler<T> = (event: T) => Promise<void>;

export class EventBus {
  private handlers: Map<string, Array<EventHandler<any>>> = new Map();

  subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
  }

  async publish<T>(eventType: string, event: T): Promise<void> {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      await Promise.all(handlers.map(handler => handler(event)));
    }
  }

  unsubscribe<T>(eventType: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      this.handlers.set(
        eventType,
        handlers.filter(h => h !== handler)
      );
    }
  }
}
```

**FileUploadedEventHandler示例**：

```typescript
import { EventHandler } from '../EventBus';
import { FileUploadedEvent } from '../events/FileUploadedEvent';
import { FileProcessorService } from '../services/FileProcessorService';
import { AISchedulerService } from '../services/AISchedulerService';

export class FileUploadedEventHandler implements EventHandler<FileUploadedEvent> {
  constructor(
    private readonly fileProcessorService: FileProcessorService,
    private readonly aiSchedulerService: AISchedulerService
  ) {}

  async handle(event: FileUploadedEvent): Promise<void> {
    // 1. 处理文件内容
    const processedFile = await this.fileProcessorService.processFile(event.fileId);
    
    // 2. 创建AI分析任务
    await this.aiSchedulerService.createTask({
      type: 'cognitive_analysis',
      inputType: 'file',
      inputId: event.fileId,
      priority: 'medium',
      params: {
        analysisDepth: 'deep',
        extractImages: true
      }
    });
  }
}
```

## 4. 依赖管理

### 4.1 依赖注入设计

使用tsyringe实现依赖注入，管理组件之间的依赖关系。

#### 4.1.1 依赖注入配置

```typescript
import { container } from 'tsyringe';
import { FileUploadService } from '../services/FileUploadService';
import { FileStorageService } from '../../infrastructure/file-storage/FileStorageService';
import { FileRepository } from '../../infrastructure/database/repositories/FileRepository';
import { FileProcessorService } from '../services/FileProcessorService';

// 注册服务
container.register(FileUploadService, {
  useFactory: (c) => {
    return new FileUploadService(
      c.resolve(FileStorageService),
      c.resolve(FileRepository),
      c.resolve(FileProcessorService)
    );
  }
});
```

### 4.2 服务定位器设计

设计一个服务定位器，用于在需要时获取服务实例：

```typescript
import { container } from 'tsyringe';

export class ServiceLocator {
  static get<T>(serviceClass: any): T {
    return container.resolve<T>(serviceClass);
  }
}
```

## 5. 事务管理

### 5.1 事务设计

设计一个事务管理器，确保业务操作的原子性和一致性：

```typescript
export interface TransactionManager {
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export class DatabaseTransactionManager implements TransactionManager {
  constructor(private readonly db: any) {}

  async beginTransaction(): Promise<void> {
    await this.db.beginTransaction();
  }

  async commit(): Promise<void> {
    await this.db.commit();
  }

  async rollback(): Promise<void> {
    await this.db.rollback();
  }
}
```

### 5.2 事务装饰器

设计一个事务装饰器，用于简化事务管理：

```typescript
export function Transaction() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const transactionManager = ServiceLocator.get<TransactionManager>(TransactionManager);
      
      try {
        await transactionManager.beginTransaction();
        const result = await originalMethod.apply(this, args);
        await transactionManager.commit();
        return result;
      } catch (error) {
        await transactionManager.rollback();
        throw error;
      }
    };
    
    return descriptor;
  };
}
```

## 6. 错误处理

### 6.1 应用层错误类型

| 错误类型 | 描述 |
|----------|------|
| `FileUploadError` | 文件上传失败 |
| `FileProcessingError` | 文件处理失败 |
| `AudioProcessingError` | 音频处理失败 |
| `AITaskError` | AI任务失败 |
| `CognitiveModelError` | 认知模型操作失败 |
| `InsightGenerationError` | 洞察生成失败 |
| `SuggestionGenerationError` | 建议生成失败 |

### 6.2 错误处理示例

```typescript
export class FileUploadError extends Error {
  constructor(message: string, public readonly fileId?: string) {
    super(message);
    this.name = 'FileUploadError';
  }
}

export class FileProcessingError extends Error {
  constructor(message: string, public readonly fileId?: string) {
    super(message);
    this.name = 'FileProcessingError';
  }
}
```

## 7. 测试策略

### 7.1 单元测试

- **服务单元测试**：测试服务的核心逻辑，Mock依赖的仓库和服务
- **用例单元测试**：测试用例的业务流程，Mock依赖的服务
- **工作流单元测试**：测试工作流的流程逻辑，Mock依赖的用例
- **事件处理单元测试**：测试事件处理器的逻辑，Mock依赖的服务

### 7.2 集成测试

- **服务集成测试**：测试服务与仓库和基础设施服务的集成
- **用例集成测试**：测试用例与服务的集成
- **工作流集成测试**：测试工作流与用例的集成

### 7.3 测试示例

**FileUploadService单元测试**：

```typescript
import { FileUploadService } from '../services/FileUploadService';
import { FileStorageService } from '../../infrastructure/file-storage/FileStorageService';
import { FileRepository } from '../../infrastructure/database/repositories/FileRepository';
import { FileProcessorService } from '../services/FileProcessorService';

// Mock依赖
const mockFileStorageService = {
  storeFile: jest.fn().mockResolvedValue('test/path/file.pdf')
} as unknown as FileStorageService;

const mockFileRepository = {
  save: jest.fn().mockResolvedValue({ id: 'file-123' }),
  findById: jest.fn(),
  findAll: jest.fn()
} as unknown as FileRepository;

const mockFileProcessorService = {
  extractMetadata: jest.fn().mockResolvedValue({ type: 'document' }),
  processFile: jest.fn()
} as unknown as FileProcessorService;

// 测试用例
describe('FileUploadService', () => {
  let fileUploadService: FileUploadService;
  
  beforeEach(() => {
    fileUploadService = new FileUploadService(
      mockFileStorageService,
      mockFileRepository,
      mockFileProcessorService
    );
  });
  
  it('should upload file successfully', async () => {
    const mockFile = {
      name: 'test.pdf',
      size: 1024,
      type: 'application/pdf'
    } as unknown as File;
    
    const result = await fileUploadService.uploadFile(mockFile, 'document', 'work,project');
    
    expect(mockFileStorageService.storeFile).toHaveBeenCalledWith(mockFile);
    expect(mockFileProcessorService.extractMetadata).toHaveBeenCalledWith(mockFile);
    expect(mockFileRepository.save).toHaveBeenCalled();
    expect(mockFileProcessorService.processFile).toHaveBeenCalled();
    expect(result).toEqual({ id: 'file-123' });
  });
});
```

## 8. 实现步骤

### 8.1 阶段1：基础服务实现

1. **实现核心服务**：
   - FileUploadService
   - SpeechRecognitionService
   - AISchedulerService
   - InputIntegrationService

2. **实现基础用例**：
   - IngestThoughtUseCase
   - GenerateInsightUseCase

3. **配置依赖注入**：
   - 使用tsyringe配置服务依赖
   - 实现服务定位器

### 8.2 阶段2：高级服务和用例实现

1. **实现高级服务**：
   - CognitiveModelService
   - InsightService
   - SuggestionService
   - FileProcessorService
   - AudioProcessorService

2. **实现高级用例**：
   - UpdateCognitiveModelUseCase
   - GenerateSuggestionUseCase
   - AnalyzeInputUseCase
   - ProcessFileUseCase
   - ProcessSpeechUseCase

3. **实现事件处理**：
   - EventBus
   - 核心事件处理器

### 8.3 阶段3：工作流实现

1. **实现核心工作流**：
   - CognitiveAnalysisWorkflow
   - FileProcessingWorkflow
   - SpeechProcessingWorkflow

2. **实现事件驱动的工作流**：
   - 配置事件订阅和发布
   - 实现事件驱动的业务流程

### 8.4 阶段4：测试和优化

1. **编写单元测试**：
   - 为所有服务和用例编写单元测试
   - 实现代码覆盖率报告

2. **编写集成测试**：
   - 测试服务与仓库的集成
   - 测试用例与服务的集成

3. **优化性能**：
   - 优化服务调用链
   - 实现缓存机制
   - 优化数据库查询

## 9. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2024-01-08 | 初始创建 | 系统架构师 |
