# Day 36: 第二阶段 - AI融合期 - Week 6 - 第36天

## 今日目标
实现 Embedding 服务，负责将文本转换为向量表示，用于后续的向量存储和相似度搜索。

## 代码实现

### 1. Embedding 服务接口定义

```typescript
// src/application/ai/embedding/EmbeddingService.ts

/**
 * Embedding 向量接口
 */
export interface EmbeddingVector {
  /** 向量数据 */
  vector: number[];
  /** 向量维度 */
  dimension: number;
  /** 生成时间戳 */
  createdAt: number;
}

/**
 * Embedding 服务接口，负责将文本转换为向量表示
 */
export interface EmbeddingService {
  /**
   * 生成单个文本的 Embedding 向量
   * @param text 要生成向量的文本
   * @param model 要使用的 Embedding 模型名称
   * @returns Embedding 向量
   */
  generateEmbedding(text: string, model?: string): Promise<EmbeddingVector>;
  
  /**
   * 批量生成文本的 Embedding 向量
   * @param texts 要生成向量的文本数组
   * @param model 要使用的 Embedding 模型名称
   * @returns Embedding 向量数组
   */
  generateEmbeddings(texts: string[], model?: string): Promise<EmbeddingVector[]>;
  
  /**
   * 获取模型信息
   * @param model 模型名称
   * @returns 模型信息
   */
  getModelInfo(model: string): Promise<EmbeddingModelInfo>;
  
  /**
   * 列出可用的 Embedding 模型
   * @returns 可用模型列表
   */
  listModels(): Promise<string[]>;
}

/**
 * Embedding 模型信息接口
 */
export interface EmbeddingModelInfo {
  /** 模型名称 */
  name: string;
  /** 向量维度 */
  dimension: number;
  /** 模型描述 */
  description: string;
  /** 模型是否可用 */
  available: boolean;
}
```

### 2. OpenAI Embedding 服务实现

```typescript
// src/infrastructure/ai/embedding/OpenAIEmbeddingService.ts

import axios from 'axios';
import { EmbeddingService, EmbeddingVector, EmbeddingModelInfo } from '../../../application/ai/embedding/EmbeddingService';
import { Logger } from '../../../application/logger/Logger';

/**
 * OpenAI Embedding 服务配置
 */
export interface OpenAIEmbeddingConfig {
  /** API 密钥 */
  apiKey: string;
  /** API 基础 URL */
  baseUrl: string;
  /** 默认模型名称 */
  defaultModel: string;
  /** 请求超时时间（毫秒） */
  timeoutMs: number;
}

/**
 * 默认 OpenAI Embedding 配置
 */
export const DEFAULT_OPENAI_EMBEDDING_CONFIG: OpenAIEmbeddingConfig = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  defaultModel: 'text-embedding-ada-002',
  timeoutMs: 30000
};

/**
 * OpenAI Embedding 服务实现
 */
export class OpenAIEmbeddingService implements EmbeddingService {
  private axiosInstance: any;
  
  constructor(private config: OpenAIEmbeddingConfig, private logger: Logger) {
    // 创建 Axios 实例
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      }
    });
    
    // 添加请求拦截器
    this.axiosInstance.interceptors.request.use(
      (reqConfig: any) => {
        this.logger.debug(`Sending embedding request to ${reqConfig.url}`);
        return reqConfig;
      },
      (error: any) => {
        this.logger.error('Embedding request error', { error: error.message });
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * 生成单个文本的 Embedding 向量
   * @param text 要生成向量的文本
   * @param model 要使用的 Embedding 模型名称
   * @returns Embedding 向量
   */
  async generateEmbedding(text: string, model?: string): Promise<EmbeddingVector> {
    const embeddings = await this.generateEmbeddings([text], model);
    return embeddings[0];
  }
  
  /**
   * 批量生成文本的 Embedding 向量
   * @param texts 要生成向量的文本数组
   * @param model 要使用的 Embedding 模型名称
   * @returns Embedding 向量数组
   */
  async generateEmbeddings(texts: string[], model?: string): Promise<EmbeddingVector[]> {
    try {
      const response = await this.axiosInstance.post('/embeddings', {
        input: texts,
        model: model || this.config.defaultModel
      });
      
      const now = Date.now();
      return response.data.data.map((item: any, index: number) => ({
        vector: item.embedding,
        dimension: item.embedding.length,
        createdAt: now
      }));
    } catch (error: any) {
      this.logger.error('Failed to generate embeddings', { 
        error: error.response?.data || error.message,
        texts: texts.length
      });
      throw error;
    }
  }
  
  /**
   * 获取模型信息
   * @param model 模型名称
   * @returns 模型信息
   */
  async getModelInfo(model: string): Promise<EmbeddingModelInfo> {
    // 注意：OpenAI API 目前不提供获取单个模型详细信息的端点
    // 这里返回硬编码的模型信息，实际项目中可能需要调整
    const modelInfos: Record<string, EmbeddingModelInfo> = {
      'text-embedding-ada-002': {
        name: 'text-embedding-ada-002',
        dimension: 1536,
        description: 'OpenAI\'s most capable text embedding model.',
        available: true
      },
      'text-embedding-3-small': {
        name: 'text-embedding-3-small',
        dimension: 1536,
        description: 'Smaller, faster embedding model.',
        available: true
      },
      'text-embedding-3-large': {
        name: 'text-embedding-3-large',
        dimension: 3072,
        description: 'Larger, more capable embedding model.',
        available: true
      }
    };
    
    return modelInfos[model] || {
      name: model,
      dimension: 0,
      description: 'Unknown model',
      available: false
    };
  }
  
  /**
   * 列出可用的 Embedding 模型
   * @returns 可用模型列表
   */
  async listModels(): Promise<string[]> {
    // 注意：OpenAI API 目前不提供列出所有可用嵌入模型的端点
    // 这里返回硬编码的模型列表，实际项目中可能需要调整
    return [
      'text-embedding-ada-002',
      'text-embedding-3-small',
      'text-embedding-3-large'
    ];
  }
}
```

### 3. Embedding 服务工厂

```typescript
// src/infrastructure/ai/embedding/EmbeddingServiceFactory.ts

import { EmbeddingService } from '../../../application/ai/embedding/EmbeddingService';
import { OpenAIEmbeddingService, OpenAIEmbeddingConfig, DEFAULT_OPENAI_EMBEDDING_CONFIG } from './OpenAIEmbeddingService';
import { Logger } from '../../../application/logger/Logger';

/**
 * Embedding 服务类型
 */
export enum EmbeddingServiceType {
  OpenAI = 'openai',
  Local = 'local'
}

/**
 * Embedding 服务工厂，用于创建 Embedding 服务实例
 */
export class EmbeddingServiceFactory {
  /**
   * 创建 Embedding 服务实例
   * @param type 服务类型
   * @param config 服务配置
   * @param logger 日志记录器
   * @returns Embedding 服务实例
   */
  static createService(
    type: EmbeddingServiceType,
    config: Partial<OpenAIEmbeddingConfig>,
    logger: Logger
  ): EmbeddingService {
    const fullConfig = { ...DEFAULT_OPENAI_EMBEDDING_CONFIG, ...config };
    
    switch (type) {
      case EmbeddingServiceType.OpenAI:
        return new OpenAIEmbeddingService(fullConfig, logger);
      case EmbeddingServiceType.Local:
        // 本地 Embedding 服务实现（预留）
        throw new Error('Local Embedding service not implemented yet');
      default:
        throw new Error(`Unknown Embedding service type: ${type}`);
    }
  }
}
```

### 4. Embedding 异常定义

```typescript
// src/application/ai/embedding/EmbeddingError.ts

/**
 * Embedding 异常类
 */
export class EmbeddingError extends Error {
  /**
   * 构造函数
   * @param message 错误消息
   */
  constructor(message: string) {
    super(message);
    this.name = 'EmbeddingError';
  }
}

/**
 * Embedding 模型不可用异常
 */
export class EmbeddingModelUnavailableError extends EmbeddingError {
  /**
   * 模型名称
   */
  public modelName: string;
  
  /**
   * 构造函数
   * @param modelName 模型名称
   */
  constructor(modelName: string) {
    super(`Embedding model ${modelName} is unavailable`);
    this.name = 'EmbeddingModelUnavailableError';
    this.modelName = modelName;
  }
}

/**
 * Embedding 生成失败异常
 */
export class EmbeddingGenerationError extends EmbeddingError {
  /**
   * 原始文本
   */
  public originalText: string;
  
  /**
   * 构造函数
   * @param message 错误消息
   * @param originalText 原始文本
   */
  constructor(message: string, originalText: string) {
    super(message);
    this.name = 'EmbeddingGenerationError';
    this.originalText = originalText;
  }
}
```

### 5. 集成到依赖注入容器

```typescript
// src/infrastructure/container/DependencyContainer.ts

import { SimpleDependencyContainer } from '../../../../phase-1-foundation/week-4-minimal-system/26-system-integration-code.md';
import { EmbeddingService } from '../../application/ai/embedding/EmbeddingService';
import { EmbeddingServiceFactory, EmbeddingServiceType } from '../ai/embedding/EmbeddingServiceFactory';
import { Logger } from '../../application/logger/Logger';

/**
 * 配置 Embedding 相关依赖
 * @param container 依赖注入容器
 */
export function configureEmbeddingDependencies(container: SimpleDependencyContainer): void {
  // 注册 Embedding 服务
  container.registerSingleton(EmbeddingService, (c) => {
    const logger = c.resolve<Logger>(Logger);
    const config = {
      apiKey: process.env.OPENAI_API_KEY || ''
    };
    
    return EmbeddingServiceFactory.createService(
      EmbeddingServiceType.OpenAI,
      config,
      logger
    );
  });
}
```

### 6. 测试代码

```typescript
// test/application/ai/embedding/OpenAIEmbeddingService.test.ts

import { OpenAIEmbeddingService } from '../../../../src/infrastructure/ai/embedding/OpenAIEmbeddingService';
import { Logger } from '../../../../src/application/logger/Logger';

// 模拟 Logger
class MockLogger implements Logger {
  debug(message: string, metadata?: any): void {
    console.log(`DEBUG: ${message}`, metadata);
  }
  
  info(message: string, metadata?: any): void {
    console.log(`INFO: ${message}`, metadata);
  }
  
  warn(message: string, metadata?: any): void {
    console.log(`WARN: ${message}`, metadata);
  }
  
  error(message: string, metadata?: any): void {
    console.log(`ERROR: ${message}`, metadata);
  }
}

describe('OpenAIEmbeddingService', () => {
  let embeddingService: OpenAIEmbeddingService;
  let logger: Logger;
  
  beforeEach(() => {
    logger = new MockLogger();
    embeddingService = new OpenAIEmbeddingService({
      apiKey: 'test-api-key',
      baseUrl: 'https://api.openai.com/v1',
      defaultModel: 'text-embedding-ada-002',
      timeoutMs: 30000
    }, logger);
  });
  
  describe('getModelInfo', () => {
    it('should return correct model info for known model', async () => {
      const modelInfo = await embeddingService.getModelInfo('text-embedding-ada-002');
      
      expect(modelInfo.name).toBe('text-embedding-ada-002');
      expect(modelInfo.dimension).toBe(1536);
      expect(modelInfo.available).toBe(true);
    });
    
    it('should return unknown model info for unknown model', async () => {
      const modelInfo = await embeddingService.getModelInfo('unknown-model');
      
      expect(modelInfo.name).toBe('unknown-model');
      expect(modelInfo.dimension).toBe(0);
      expect(modelInfo.available).toBe(false);
    });
  });
  
  describe('listModels', () => {
    it('should return list of available models', async () => {
      const models = await embeddingService.listModels();
      
      expect(models).toContain('text-embedding-ada-002');
      expect(models).toContain('text-embedding-3-small');
      expect(models).toContain('text-embedding-3-large');
    });
  });
  
  // 注意：由于需要实际调用 OpenAI API，这里只测试了基本功能
  // 在实际项目中，应该使用 mock 来测试 generateEmbedding 和 generateEmbeddings 方法
});
```

### 7. 使用示例

```typescript
// src/application/use-cases/embedding/GenerateTextEmbeddingUseCase.ts

import { EmbeddingService } from '../../ai/embedding/EmbeddingService';

/**
 * 生成文本 Embedding 的用例
 */
export class GenerateTextEmbeddingUseCase {
  constructor(private embeddingService: EmbeddingService) {}
  
  /**
   * 执行用例
   * @param text 要生成 Embedding 的文本
   * @returns Embedding 向量
   */
  async execute(text: string) {
    return this.embeddingService.generateEmbedding(text);
  }
}

/**
 * 批量生成文本 Embedding 的用例
 */
export class GenerateBatchTextEmbeddingUseCase {
  constructor(private embeddingService: EmbeddingService) {}
  
  /**
   * 执行用例
   * @param texts 要生成 Embedding 的文本数组
   * @returns Embedding 向量数组
   */
  async execute(texts: string[]) {
    return this.embeddingService.generateEmbeddings(texts);
  }
}
```

## 设计说明

1. **接口抽象**：通过 `EmbeddingService` 接口抽象 Embedding 生成逻辑，便于后续扩展和替换实现。

2. **多服务支持**：设计了 `EmbeddingServiceFactory`，支持创建不同类型的 Embedding 服务，目前实现了 OpenAI Embedding 服务，预留了本地 Embedding 服务的扩展点。

3. **批量处理**：支持单个文本和批量文本的 Embedding 生成，提高处理效率。

4. **模型管理**：提供了获取模型信息和列出可用模型的功能，便于管理和选择 Embedding 模型。

5. **错误处理**：定义了专门的异常类，如 `EmbeddingError`、`EmbeddingModelUnavailableError` 和 `EmbeddingGenerationError`，便于区分不同类型的 Embedding 错误。

6. **依赖注入**：集成到现有的依赖注入容器中，便于在其他服务和用例中使用。

7. **测试支持**：编写了测试代码，便于验证 Embedding 服务的功能。

## 今日总结

今天实现了 Embedding 服务，包括：

1. 定义了 `EmbeddingVector` 和 `EmbeddingService` 接口，抽象了 Embedding 生成逻辑
2. 实现了 `OpenAIEmbeddingService`，基于 OpenAI API 生成 Embedding 向量
3. 设计了 `EmbeddingServiceFactory`，支持创建不同类型的 Embedding 服务
4. 定义了专门的 Embedding 异常类
5. 集成到了依赖注入容器中
6. 编写了测试代码
7. 提供了使用示例

该服务将用于后续的向量存储和相似度搜索，为认知模型的构建和演进提供基础支持。
