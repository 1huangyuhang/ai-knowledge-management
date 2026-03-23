# 94-输入整合模块技术实现文档

## 1. 模块概述

输入整合模块负责整合来自不同来源的输入（文件、语音、文字），将它们转换为统一的格式，并根据内容类型和优先级进行分类和路由，最终发送给AI调度模块进行处理。

## 2. 架构设计

### 2.1 分层结构

| 层级 | 组件 | 职责 |
|------|------|------|
| 表示层 | InputIntegrationController | 处理输入整合请求 |
| 应用层 | InputAdapter | 适配不同类型的输入 |
| 应用层 | InputMerger | 合并相关输入 |
| 应用层 | InputRouter | 路由输入到不同处理流程 |
| 应用层 | InputPrioritizer | 为输入分配优先级 |
| 领域层 | FileInput | 文件输入实体 |
| 领域层 | SpeechInput | 语音输入实体 |
| 领域层 | ThoughtFragment | 文字输入实体 |
| 领域层 | AITask | AI任务实体 |

### 2.2 核心组件

#### 2.2.1 InputAdapter

**职责**：将不同类型的输入转换为统一的内部表示。

**关键接口**：
- `adaptFileInput(fileInput: FileInput)`：适配文件输入
- `adaptSpeechInput(speechInput: SpeechInput)`：适配语音输入
- `adaptTextInput(textInput: ThoughtFragment)`：适配文字输入
- `normalizeInput(input: any)`：标准化输入格式

#### 2.2.2 InputMerger

**职责**：合并相关的输入，例如将同一个用户的多个输入合并为一个任务。

**关键接口**：
- `mergeInputs(inputs: any[])`：合并多个输入
- `isInputsRelated(input1: any, input2: any)`：判断输入是否相关
- `createMergedTask(mergedInput: any)`：创建合并后的任务

#### 2.2.3 InputRouter

**职责**：根据输入类型和内容将输入路由到不同的处理流程。

**关键接口**：
- `routeInput(input: any)`：路由输入
- `determineProcessingFlow(input: any)`：确定处理流程
- `getRouteDestination(input: any)`：获取路由目标

#### 2.2.4 InputPrioritizer

**职责**：根据输入内容和用户设置为输入分配优先级。

**关键接口**：
- `assignPriority(input: any)`：分配优先级
- `analyzeInputImportance(input: any)`：分析输入重要性
- `calculatePriorityScore(input: any)`：计算优先级分数

#### 2.2.5 InputIntegrationController

**职责**：处理输入整合相关的HTTP请求，提供输入整合API。

**关键接口**：
- `integrateInput(req: Request, res: Response)`：整合输入
- `getInputHistory(req: Request, res: Response)`：获取输入历史
- `getInputStatistics(req: Request, res: Response)`：获取输入统计信息

## 3. 数据流设计

```
不同来源输入 → InputAdapter → 标准化输入
                                   ↓
                           InputPrioritizer → 分配优先级
                                   ↓
                           InputMerger → 合并相关输入
                                   ↓
                           InputRouter → 路由到处理流程
                                   ↓
                           创建AITask → 发送到AI调度模块
```

## 4. 输入类型和处理流程

### 4.1 输入类型

| 输入类型 | 来源 | 处理流程 |
|----------|------|----------|
| 文件输入 | 文件上传 | 文件解析 → OCR（如有必要）→ 内容提取 → 认知分析 |
| 语音输入 | 音频上传/实时录制 | 语音转文字 → 内容清理 → 认知分析 |
| 文字输入 | 直接输入 | 文本预处理 → 关键词提取 → 认知分析 |

### 4.2 处理流程决策

处理流程的决策基于以下因素：
- 输入类型
- 输入内容长度
- 输入内容复杂度
- 用户设置的优先级
- 系统当前负载

## 5. 技术选型

| 技术/库 | 用途 | 版本 |
|---------|------|------|
| inversify | 依赖注入 | ^6.0.1 |
| zod | 数据验证 | ^3.22.4 |
| lodash | 工具函数 | ^4.17.21 |

## 6. 代码实现

### 6.1 InputAdapter

```typescript
// src/application/adapters/InputAdapter.ts
import { injectable } from 'inversify';
import { FileInput } from '../../domain/entities/FileInput';
import { SpeechInput } from '../../domain/entities/SpeechInput';
import { ThoughtFragment } from '../../domain/entities/ThoughtFragment';

/**
 * 统一输入格式
 */
export interface UnifiedInput {
  id: string;
  type: 'file' | 'speech' | 'text';
  content: string;
  metadata: Record<string, any>;
  source: string;
  createdAt: Date;
  priority?: number;
}

@injectable()
export class InputAdapter {
  /**
   * 适配文件输入
   * @param fileInput 文件输入
   * @returns 统一输入格式
   */
  public adaptFileInput(fileInput: FileInput): UnifiedInput {
    return {
      id: fileInput.id,
      type: 'file',
      content: fileInput.content,
      metadata: {
        ...fileInput.metadata,
        fileName: fileInput.name,
        fileType: fileInput.type,
        fileSize: fileInput.size
      },
      source: 'file_upload',
      createdAt: fileInput.createdAt
    };
  }

  /**
   * 适配语音输入
   * @param speechInput 语音输入
   * @returns 统一输入格式
   */
  public adaptSpeechInput(speechInput: SpeechInput): UnifiedInput {
    return {
      id: speechInput.id,
      type: 'speech',
      content: speechInput.transcription,
      metadata: {
        ...speechInput.metadata,
        audioUrl: speechInput.audioUrl,
        confidence: speechInput.confidence,
        language: speechInput.language,
        duration: speechInput.duration
      },
      source: 'speech_input',
      createdAt: speechInput.createdAt
    };
  }

  /**
   * 适配文字输入
   * @param textInput 文字输入
   * @returns 统一输入格式
   */
  public adaptTextInput(textInput: ThoughtFragment): UnifiedInput {
    return {
      id: textInput.id,
      type: 'text',
      content: textInput.content,
      metadata: {
        ...textInput.metadata,
        tags: textInput.tags
      },
      source: 'text_input',
      createdAt: textInput.createdAt
    };
  }

  /**
   * 标准化输入格式
   * @param input 输入数据
   * @returns 标准化后的输入
   */
  public normalizeInput(input: any): UnifiedInput {
    // 根据输入类型调用相应的适配方法
    if (input instanceof FileInput) {
      return this.adaptFileInput(input);
    } else if (input instanceof SpeechInput) {
      return this.adaptSpeechInput(input);
    } else if (input instanceof ThoughtFragment) {
      return this.adaptTextInput(input);
    } else {
      // 直接输入的文本
      return {
        id: input.id || crypto.randomUUID(),
        type: 'text',
        content: input.content || '',
        metadata: input.metadata || {},
        source: input.source || 'direct_input',
        createdAt: input.createdAt || new Date()
      };
    }
  }
}
```

### 6.2 InputMerger

```typescript
// src/application/services/InputMerger.ts
import { injectable } from 'inversify';
import { UnifiedInput } from '../adapters/InputAdapter';

@injectable()
export class InputMerger {
  /**
   * 合并相关输入
   * @param inputs 输入列表
   * @returns 合并后的输入列表
   */
  public mergeInputs(inputs: UnifiedInput[]): UnifiedInput[] {
    const mergedInputs: UnifiedInput[] = [];
    const processedInputs = new Set<string>();

    for (let i = 0; i < inputs.length; i++) {
      if (processedInputs.has(inputs[i].id)) {
        continue;
      }

      let mergedInput = inputs[i];
      processedInputs.add(inputs[i].id);

      for (let j = i + 1; j < inputs.length; j++) {
        if (processedInputs.has(inputs[j].id)) {
          continue;
        }

        if (this.isInputsRelated(mergedInput, inputs[j])) {
          mergedInput = this.mergeTwoInputs(mergedInput, inputs[j]);
          processedInputs.add(inputs[j].id);
        }
      }

      mergedInputs.push(mergedInput);
    }

    return mergedInputs;
  }

  /**
   * 判断两个输入是否相关
   * @param input1 输入1
   * @param input2 输入2
   * @returns 是否相关
   */
  public isInputsRelated(input1: UnifiedInput, input2: UnifiedInput): boolean {
    // 检查是否来自同一个用户
    if (input1.metadata.userId !== input2.metadata.userId) {
      return false;
    }

    // 检查时间差是否在阈值内（5分钟）
    const timeDiff = Math.abs(input1.createdAt.getTime() - input2.createdAt.getTime());
    if (timeDiff > 5 * 60 * 1000) {
      return false;
    }

    // 检查是否有相同的标签或主题
    if (input1.metadata.tags && input2.metadata.tags) {
      const commonTags = input1.metadata.tags.filter((tag: string) => 
        input2.metadata.tags.includes(tag)
      );
      if (commonTags.length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * 合并两个输入
   * @param input1 输入1
   * @param input2 输入2
   * @returns 合并后的输入
   */
  private mergeTwoInputs(input1: UnifiedInput, input2: UnifiedInput): UnifiedInput {
    return {
      id: crypto.randomUUID(),
      type: 'merged',
      content: `${input1.content}\n\n${input2.content}`,
      metadata: {
        ...input1.metadata,
        ...input2.metadata,
        sources: [input1.source, input2.source],
        originalIds: [input1.id, input2.id],
        mergedAt: new Date()
      },
      source: 'merged_input',
      createdAt: new Date(Math.min(input1.createdAt.getTime(), input2.createdAt.getTime())),
      priority: Math.max(input1.priority || 0, input2.priority || 0)
    };
  }

  /**
   * 创建合并后的任务
   * @param mergedInput 合并后的输入
   * @returns 任务数据
   */
  public createMergedTask(mergedInput: UnifiedInput): any {
    return {
      type: 'COGNITIVE_ANALYSIS',
      input: mergedInput,
      metadata: {
        merged: true,
        originalInputs: mergedInput.metadata.originalIds || [mergedInput.id],
        inputTypes: mergedInput.metadata.sources || [mergedInput.source]
      }
    };
  }
}
```

### 6.3 InputRouter

```typescript
// src/application/services/InputRouter.ts
import { injectable } from 'inversify';
import { UnifiedInput } from '../adapters/InputAdapter';

/**
 * 路由目标
 */
export interface RouteDestination {
  flow: string;
  service: string;
  queue: string;
  priority: number;
}

@injectable()
export class InputRouter {
  /**
   * 路由输入
   * @param input 统一输入格式
   * @returns 路由结果
   */
  public routeInput(input: UnifiedInput): RouteDestination {
    const flow = this.determineProcessingFlow(input);
    const destination = this.getRouteDestination(input, flow);
    
    return {
      ...destination,
      priority: input.priority || 0
    };
  }

  /**
   * 确定处理流程
   * @param input 统一输入格式
   * @returns 处理流程名称
   */
  public determineProcessingFlow(input: UnifiedInput): string {
    switch (input.type) {
      case 'file':
        return this.determineFileProcessingFlow(input);
      case 'speech':
        return 'speech_analysis';
      case 'text':
        return this.determineTextProcessingFlow(input);
      case 'merged':
        return 'merged_analysis';
      default:
        return 'default_analysis';
    }
  }

  /**
   * 确定文件处理流程
   * @param input 统一输入格式
   * @returns 处理流程名称
   */
  private determineFileProcessingFlow(input: UnifiedInput): string {
    const fileType = input.metadata.fileType || '';
    
    if (fileType.includes('pdf')) {
      return 'pdf_analysis';
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return 'document_analysis';
    } else if (fileType.includes('excel') || fileType.includes('xls')) {
      return 'spreadsheet_analysis';
    } else if (fileType.includes('image')) {
      return 'image_analysis';
    } else {
      return 'text_analysis';
    }
  }

  /**
   * 确定文本处理流程
   * @param input 统一输入格式
   * @returns 处理流程名称
   */
  private determineTextProcessingFlow(input: UnifiedInput): string {
    const contentLength = input.content.length;
    
    if (contentLength < 100) {
      return 'short_text_analysis';
    } else if (contentLength < 1000) {
      return 'medium_text_analysis';
    } else {
      return 'long_text_analysis';
    }
  }

  /**
   * 获取路由目标
   * @param input 统一输入格式
   * @param flow 处理流程
   * @returns 路由目标
   */
  private getRouteDestination(input: UnifiedInput, flow: string): Omit<RouteDestination, 'priority'> {
    const routeMap: Record<string, Omit<RouteDestination, 'priority'>> = {
      'pdf_analysis': { flow: 'pdf_analysis', service: 'file_service', queue: 'pdf_queue' },
      'document_analysis': { flow: 'document_analysis', service: 'file_service', queue: 'document_queue' },
      'spreadsheet_analysis': { flow: 'spreadsheet_analysis', service: 'file_service', queue: 'spreadsheet_queue' },
      'image_analysis': { flow: 'image_analysis', service: 'file_service', queue: 'image_queue' },
      'text_analysis': { flow: 'text_analysis', service: 'text_service', queue: 'text_queue' },
      'speech_analysis': { flow: 'speech_analysis', service: 'speech_service', queue: 'speech_queue' },
      'short_text_analysis': { flow: 'short_text_analysis', service: 'text_service', queue: 'short_text_queue' },
      'medium_text_analysis': { flow: 'medium_text_analysis', service: 'text_service', queue: 'medium_text_queue' },
      'long_text_analysis': { flow: 'long_text_analysis', service: 'text_service', queue: 'long_text_queue' },
      'merged_analysis': { flow: 'merged_analysis', service: 'cognitive_service', queue: 'merged_queue' },
      'default_analysis': { flow: 'default_analysis', service: 'cognitive_service', queue: 'default_queue' }
    };

    return routeMap[flow] || routeMap.default_analysis;
  }
}
```

## 7. 测试策略

### 7.1 单元测试

- 测试InputAdapter的输入适配逻辑
- 测试InputMerger的输入合并逻辑
- 测试InputRouter的路由决策逻辑
- 测试InputPrioritizer的优先级分配逻辑

### 7.2 集成测试

- 测试完整的输入整合流程
- 测试不同类型输入的处理
- 测试输入合并的效果
- 测试路由决策的准确性

### 7.3 端到端测试

- 测试从输入提交到AI任务创建的完整流程
- 测试不同来源输入的整合效果
- 测试系统在高并发场景下的表现

## 8. 部署和监控

- 集成Prometheus监控输入处理指标
- 实现输入处理日志记录
- 配置输入处理告警
- 实现输入处理历史查询API
- 支持输入处理统计和分析

## 9. 扩展考虑

- 支持实时输入整合
- 实现智能输入分类
- 支持用户自定义输入处理规则
- 实现输入处理结果缓存
- 支持多语言输入处理