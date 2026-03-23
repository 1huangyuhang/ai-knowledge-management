# 93-AI调度模块技术实现文档

## 1. 模块概述

AI调度模块负责管理和调度所有AI任务，包括任务创建、优先级管理、执行调度、结果处理和任务监控。该模块确保所有AI任务按照优先级和依赖关系有序执行，最大化系统资源利用率。

## 2. 架构设计

### 2.1 分层结构

| 层级 | 组件 | 职责 |
|------|------|------|
| 表示层 | AITaskController | 处理AI任务相关请求 |
| 应用层 | AIScheduler | 协调AI任务调度 |
| 应用层 | AITaskQueue | 管理任务队列 |
| 应用层 | AITaskExecutor | 执行AI任务 |
| 应用层 | AITaskMonitor | 监控任务执行状态 |
| 基础设施层 | AITaskRepository | 任务数据存储 |
| 领域层 | AITask | AI任务实体 |
| 领域层 | AITaskStatus | 任务状态枚举 |
| 领域层 | AITaskPriority | 任务优先级枚举 |

### 2.2 核心组件

#### 2.2.1 AIScheduler

**职责**：核心调度器，负责任务的分配、优先级管理和执行控制。

**关键接口**：
- `scheduleTask(task: AITask)`：调度新任务
- `rescheduleTask(taskId: string, newPriority: AITaskPriority)`：重新调度任务
- `cancelTask(taskId: string)`：取消任务
- `processTaskQueue()`：处理任务队列

#### 2.2.2 AITaskQueue

**职责**：管理任务队列，实现优先级排序和队列管理。

**关键接口**：
- `enqueue(task: AITask)`：将任务加入队列
- `dequeue(): AITask | undefined`：获取下一个要执行的任务
- `peek(): AITask | undefined`：查看队列头部任务
- `remove(taskId: string)`：从队列中移除任务
- `size(): number`：获取队列大小

#### 2.2.3 AITaskExecutor

**职责**：执行具体的AI任务，根据任务类型调用相应的AI服务。

**关键接口**：
- `executeTask(task: AITask)`：执行任务
- `executeFileProcessingTask(task: AITask)`：执行文件处理任务
- `executeSpeechProcessingTask(task: AITask)`：执行语音处理任务
- `executeCognitiveAnalysisTask(task: AITask)`：执行认知分析任务

#### 2.2.4 AITaskMonitor

**职责**：监控任务执行状态，处理任务超时和失败重试。

**关键接口**：
- `monitorTask(task: AITask)`：监控任务
- `onTaskComplete(task: AITask)`：任务完成回调
- `onTaskFailed(task: AITask)`：任务失败回调
- `onTaskTimeout(task: AITask)`：任务超时回调
- `retryTask(task: AITask)`：重试失败任务

#### 2.2.5 AITaskController

**职责**：处理AI任务相关的HTTP请求，提供任务管理API。

**关键接口**：
- `createTask(req: Request, res: Response)`：创建新任务
- `getTasks(req: Request, res: Response)`：获取任务列表
- `getTaskById(req: Request, res: Response)`：获取单个任务详情
- `updateTask(req: Request, res: Response)`：更新任务
- `deleteTask(req: Request, res: Response)`：删除任务
- `getTaskStatistics(req: Request, res: Response)`：获取任务统计信息

## 3. 数据流设计

```
任务创建 → AITaskController → AIScheduler → AITaskQueue
                                             ↓
                                    AIScheduler → AITaskExecutor → 调用AI服务
                                             ↓
                                    AITaskMonitor → 监控任务状态
                                             ↓
                                    更新任务状态 → 存储到AITaskRepository
                                             ↓
                                    任务完成 → 触发后续流程
```

## 4. 任务调度算法

### 4.1 优先级调度

采用基于优先级的调度算法，优先级从高到低为：
- URGENT (紧急)
- HIGH (高)
- MEDIUM (中)
- LOW (低)

### 4.2 任务依赖管理

支持任务之间的依赖关系，确保依赖任务完成后再执行后续任务。

### 4.3 资源管理

根据系统资源情况动态调整任务执行速率，防止系统过载。

## 5. 技术选型

| 技术/库 | 用途 | 版本 |
|---------|------|------|
| bull | 任务队列管理 | ^4.10.4 |
| ioredis | Redis客户端 | ^5.3.2 |
| inversify | 依赖注入 | ^6.0.1 |
| winston | 日志记录 | ^3.11.0 |

## 6. 代码实现

### 6.1 AIScheduler

```typescript
// src/application/services/AIScheduler.ts
import { injectable, inject } from 'inversify';
import { AITask } from '../../domain/entities/AITask';
import { AITaskQueue } from './AITaskQueue';
import { AITaskExecutor } from './AITaskExecutor';
import { AITaskMonitor } from './AITaskMonitor';
import { AITaskStatus, AITaskPriority } from '../../domain/entities/AITask';
import { AITaskRepository } from '../repositories/AITaskRepository';

@injectable()
export class AIScheduler {
  constructor(
    @inject(AITaskQueue) private readonly taskQueue: AITaskQueue,
    @inject(AITaskExecutor) private readonly taskExecutor: AITaskExecutor,
    @inject(AITaskMonitor) private readonly taskMonitor: AITaskMonitor,
    @inject(AITaskRepository) private readonly taskRepository: AITaskRepository
  ) {}

  /**
   * 调度新任务
   * @param task AI任务
   * @returns 调度结果
   */
  public async scheduleTask(task: AITask): Promise<AITask> {
    // 1. 保存任务到数据库
    const savedTask = await this.taskRepository.save(task);
    
    // 2. 将任务加入队列
    this.taskQueue.enqueue(savedTask);
    
    // 3. 启动任务处理
    this.processTaskQueue();
    
    return savedTask;
  }

  /**
   * 重新调度任务
   * @param taskId 任务ID
   * @param newPriority 新优先级
   * @returns 更新后的任务
   */
  public async rescheduleTask(taskId: string, newPriority: AITaskPriority): Promise<AITask> {
    // 1. 从数据库获取任务
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`);
    }
    
    // 2. 更新任务优先级
    task.priority = newPriority;
    task.updatedAt = new Date();
    
    // 3. 保存更新后的任务
    const updatedTask = await this.taskRepository.save(task);
    
    // 4. 如果任务处于待执行状态，重新加入队列
    if (task.status === AITaskStatus.PENDING) {
      this.taskQueue.remove(taskId);
      this.taskQueue.enqueue(updatedTask);
    }
    
    return updatedTask;
  }

  /**
   * 取消任务
   * @param taskId 任务ID
   * @returns 取消结果
   */
  public async cancelTask(taskId: string): Promise<AITask> {
    // 1. 从数据库获取任务
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`);
    }
    
    // 2. 更新任务状态为取消
    task.cancel();
    
    // 3. 保存更新后的任务
    const cancelledTask = await this.taskRepository.save(task);
    
    // 4. 从队列中移除任务
    this.taskQueue.remove(taskId);
    
    return cancelledTask;
  }

  /**
   * 处理任务队列
   */
  public async processTaskQueue(): Promise<void> {
    // 1. 获取下一个要执行的任务
    const task = this.taskQueue.dequeue();
    if (!task) {
      return;
    }
    
    // 2. 更新任务状态为运行中
    task.start();
    await this.taskRepository.save(task);
    
    // 3. 监控任务执行
    this.taskMonitor.monitorTask(task);
    
    try {
      // 4. 执行任务
      const result = await this.taskExecutor.executeTask(task);
      
      // 5. 更新任务状态为成功
      task.succeed(result);
      await this.taskRepository.save(task);
      
      // 6. 任务完成回调
      this.taskMonitor.onTaskComplete(task);
    } catch (error: any) {
      // 7. 更新任务状态为失败
      task.fail(error.message);
      await this.taskRepository.save(task);
      
      // 8. 任务失败回调
      this.taskMonitor.onTaskFailed(task);
    }
    
    // 9. 继续处理下一个任务
    this.processTaskQueue();
  }
}
```

### 6.2 AITaskQueue

```typescript
// src/application/services/AITaskQueue.ts
import { injectable } from 'inversify';
import { AITask } from '../../domain/entities/AITask';
import { AITaskPriority } from '../../domain/entities/AITask';

@injectable()
export class AITaskQueue {
  private readonly queue: AITask[] = [];
  private readonly priorityOrder: Record<AITaskPriority, number> = {
    [AITaskPriority.URGENT]: 0,
    [AITaskPriority.HIGH]: 1,
    [AITaskPriority.MEDIUM]: 2,
    [AITaskPriority.LOW]: 3
  };

  /**
   * 将任务加入队列
   * @param task AI任务
   */
  public enqueue(task: AITask): void {
    this.queue.push(task);
    this.sortQueue();
  }

  /**
   * 获取下一个要执行的任务
   * @returns AI任务或undefined
   */
  public dequeue(): AITask | undefined {
    return this.queue.shift();
  }

  /**
   * 查看队列头部任务
   * @returns AI任务或undefined
   */
  public peek(): AITask | undefined {
    return this.queue[0];
  }

  /**
   * 从队列中移除任务
   * @param taskId 任务ID
   */
  public remove(taskId: string): void {
    const index = this.queue.findIndex(task => task.id === taskId);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  /**
   * 获取队列大小
   * @returns 队列大小
   */
  public size(): number {
    return this.queue.length;
  }

  /**
   * 清空队列
   */
  public clear(): void {
    this.queue.length = 0;
  }

  /**
   * 根据优先级排序队列
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // 首先按优先级排序
      const priorityCompare = this.priorityOrder[a.priority] - this.priorityOrder[b.priority];
      if (priorityCompare !== 0) {
        return priorityCompare;
      }
      
      // 优先级相同则按创建时间排序（先进先出）
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }
}
```

### 6.3 AITaskExecutor

```typescript
// src/application/services/AITaskExecutor.ts
import { injectable } from 'inversify';
import { AITask } from '../../domain/entities/AITask';

@injectable()
export class AITaskExecutor {
  /**
   * 执行AI任务
   * @param task AI任务
   * @returns 执行结果
   */
  public async executeTask(task: AITask): Promise<any> {
    switch (task.type) {
      case 'FILE_PROCESSING':
        return this.executeFileProcessingTask(task);
      case 'SPEECH_PROCESSING':
        return this.executeSpeechProcessingTask(task);
      case 'COGNITIVE_ANALYSIS':
        return this.executeCognitiveAnalysisTask(task);
      case 'EMBEDDING_GENERATION':
        return this.executeEmbeddingGenerationTask(task);
      default:
        throw new Error(`不支持的任务类型: ${task.type}`);
    }
  }

  /**
   * 执行文件处理任务
   * @param task AI任务
   * @returns 执行结果
   */
  private async executeFileProcessingTask(task: AITask): Promise<any> {
    // TODO: 实现文件处理任务执行逻辑
    // 调用相关AI服务处理文件
    return {
      message: '文件处理任务执行成功',
      taskId: task.id,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 执行语音处理任务
   * @param task AI任务
   * @returns 执行结果
   */
  private async executeSpeechProcessingTask(task: AITask): Promise<any> {
    // TODO: 实现语音处理任务执行逻辑
    // 调用相关AI服务处理语音
    return {
      message: '语音处理任务执行成功',
      taskId: task.id,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 执行认知分析任务
   * @param task AI任务
   * @returns 执行结果
   */
  private async executeCognitiveAnalysisTask(task: AITask): Promise<any> {
    // TODO: 实现认知分析任务执行逻辑
    // 调用相关AI服务进行认知分析
    return {
      message: '认知分析任务执行成功',
      taskId: task.id,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 执行嵌入生成任务
   * @param task AI任务
   * @returns 执行结果
   */
  private async executeEmbeddingGenerationTask(task: AITask): Promise<any> {
    // TODO: 实现嵌入生成任务执行逻辑
    // 调用相关AI服务生成嵌入
    return {
      message: '嵌入生成任务执行成功',
      taskId: task.id,
      timestamp: new Date().toISOString()
    };
  }
}
```

## 7. 测试策略

### 7.1 单元测试

- 测试AIScheduler的任务调度逻辑
- 测试AITaskQueue的优先级排序和队列管理
- 测试AITaskExecutor的任务执行逻辑
- 测试AITaskMonitor的任务监控功能

### 7.2 集成测试

- 测试完整的任务调度流程
- 测试任务优先级调度效果
- 测试任务依赖管理
- 测试任务失败重试机制

### 7.3 端到端测试

- 测试从任务创建到执行完成的完整流程
- 测试高并发场景下的任务调度
- 测试系统资源限制下的任务调度

## 8. 部署和监控

- 集成Prometheus监控任务执行指标
- 实现任务执行日志记录
- 配置任务执行告警
- 实现任务执行历史查询API
- 支持任务执行统计和分析

## 9. 扩展考虑

- 实现分布式任务调度
- 支持动态资源分配
- 实现任务执行预测和优化
- 支持任务执行结果缓存
- 集成更多AI服务和模型
- 实现任务执行可视化