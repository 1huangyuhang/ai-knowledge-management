# Day 34: 第二阶段 - AI融合期 - Week 5 - 第34天

## 今日目标
实现结构化输出处理功能，用于将 LLM 的文本输出转换为结构化数据，以便后续处理和分析。

## 代码实现

### 1. 结构化输出接口定义

```typescript
// src/application/ai/structured-output/StructuredOutputService.ts

/**
 * 结构化输出服务接口，负责将 LLM 输出转换为结构化数据
 */
export interface StructuredOutputService {
  /**
   * 解析 LLM 输出为结构化数据
   * @param output LLM 原始输出文本
   * @param schema 预期的数据结构 schema
   * @returns 解析后的结构化数据
   */
  parseOutput<T>(output: string, schema: any): Promise<T>;
  
  /**
   * 验证结构化数据是否符合 schema
   * @param data 结构化数据
   * @param schema 预期的数据结构 schema
   * @returns 是否符合 schema
   */
  validateOutput(data: any, schema: any): boolean;
  
  /**
   * 从 LLM 输出中提取结构化数据（处理格式化输出，如 ```json ... ```）
   * @param output LLM 原始输出文本
   * @returns 提取出的结构化数据字符串
   */
  extractStructuredData(output: string): string;
}
```

### 2. 输出解析器接口

```typescript
// src/application/ai/structured-output/OutputParser.ts

/**
 * 输出解析器接口，负责将特定格式的文本转换为结构化数据
 */
export interface OutputParser {
  /**
   * 支持的输出格式
   */
  supportedFormats: string[];
  
  /**
   * 解析文本为结构化数据
   * @param text 要解析的文本
   * @returns 解析后的结构化数据
   */
  parse(text: string): any;
  
  /**
   * 检查文本是否可以被该解析器解析
   * @param text 要检查的文本
   * @returns 是否可以解析
   */
  canParse(text: string): boolean;
}
```

### 3. JSON 输出解析器实现

```typescript
// src/application/ai/structured-output/JsonOutputParser.ts

import { OutputParser } from './OutputParser';

/**
 * JSON 输出解析器，负责将 JSON 格式的文本转换为结构化数据
 */
export class JsonOutputParser implements OutputParser {
  supportedFormats: string[] = ['json', 'application/json'];
  
  /**
   * 解析 JSON 文本为结构化数据
   * @param text JSON 格式的文本
   * @returns 解析后的结构化数据
   */
  parse(text: string): any {
    return JSON.parse(text);
  }
  
  /**
   * 检查文本是否为有效的 JSON 格式
   * @param text 要检查的文本
   * @returns 是否为有效的 JSON 格式
   */
  canParse(text: string): boolean {
    try {
      JSON.parse(text);
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

### 4. 结构化输出服务实现

```typescript
// src/application/ai/structured-output/DefaultStructuredOutputService.ts

import Ajv, { JSONSchemaType } from 'ajv';
import { StructuredOutputService } from './StructuredOutputService';
import { OutputParser } from './OutputParser';
import { JsonOutputParser } from './JsonOutputParser';
import { Logger } from '../../logger/Logger';

/**
 * 默认结构化输出服务实现
 */
export class DefaultStructuredOutputService implements StructuredOutputService {
  private ajv: Ajv;
  private parsers: OutputParser[];
  private logger: Logger;
  
  /**
   * 构造函数
   * @param logger 日志记录器
   */
  constructor(logger: Logger) {
    this.logger = logger;
    this.ajv = new Ajv({ allErrors: true });
    this.parsers = [new JsonOutputParser()];
  }
  
  /**
   * 解析 LLM 输出为结构化数据
   * @param output LLM 原始输出文本
   * @param schema 预期的数据结构 schema
   * @returns 解析后的结构化数据
   */
  async parseOutput<T>(output: string, schema: any): Promise<T> {
    try {
      // 提取结构化数据
      const structuredText = this.extractStructuredData(output);
      
      // 查找合适的解析器
      const parser = this.findParser(structuredText);
      if (!parser) {
        throw new Error('No suitable parser found for the output format');
      }
      
      // 解析数据
      const data = parser.parse(structuredText);
      
      // 验证数据
      if (!this.validateOutput(data, schema)) {
        throw new Error('Output data does not match the expected schema');
      }
      
      return data as T;
    } catch (error) {
      this.logger.error('Failed to parse LLM output', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        output: output
      });
      throw error;
    }
  }
  
  /**
   * 验证结构化数据是否符合 schema
   * @param data 结构化数据
   * @param schema 预期的数据结构 schema
   * @returns 是否符合 schema
   */
  validateOutput(data: any, schema: any): boolean {
    const validate = this.ajv.compile(schema);
    const isValid = validate(data);
    
    if (!isValid && validate.errors) {
      this.logger.error('Output validation failed', { errors: validate.errors });
    }
    
    return isValid;
  }
  
  /**
   * 从 LLM 输出中提取结构化数据（处理格式化输出，如 ```json ... ```）
   * @param output LLM 原始输出文本
   * @returns 提取出的结构化数据字符串
   */
  extractStructuredData(output: string): string {
    // 处理 Markdown 格式化的输出，如 ```json ... ```
    const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = output.match(markdownRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    // 如果没有 Markdown 格式，直接返回输出
    return output.trim();
  }
  
  /**
   * 查找合适的解析器
   * @param text 要解析的文本
   * @returns 找到的解析器，或 undefined
   */
  private findParser(text: string): OutputParser | undefined {
    return this.parsers.find(parser => parser.canParse(text));
  }
  
  /**
   * 注册新的输出解析器
   * @param parser 要注册的解析器
   */
  registerParser(parser: OutputParser): void {
    this.parsers.push(parser);
  }
}
```

### 5. 结构化输出异常定义

```typescript
// src/application/ai/structured-output/StructuredOutputError.ts

/**
 * 结构化输出异常类
 */
export class StructuredOutputError extends Error {
  /**
   * 原始输出文本
   */
  public originalOutput: string;
  
  /**
   * 构造函数
   * @param message 错误消息
   * @param originalOutput 原始输出文本
   */
  constructor(message: string, originalOutput: string) {
    super(message);
    this.name = 'StructuredOutputError';
    this.originalOutput = originalOutput;
  }
}

/**
 * 输出解析异常类
 */
export class OutputParseError extends StructuredOutputError {
  /**
   * 构造函数
   * @param message 错误消息
   * @param originalOutput 原始输出文本
   */
  constructor(message: string, originalOutput: string) {
    super(message, originalOutput);
    this.name = 'OutputParseError';
  }
}

/**
 * 输出验证异常类
 */
export class OutputValidationError extends StructuredOutputError {
  /**
   * 验证错误列表
   */
  public validationErrors?: any[];
  
  /**
   * 构造函数
   * @param message 错误消息
   * @param originalOutput 原始输出文本
   * @param validationErrors 验证错误列表
   */
  constructor(message: string, originalOutput: string, validationErrors?: any[]) {
    super(message, originalOutput);
    this.name = 'OutputValidationError';
    this.validationErrors = validationErrors;
  }
}
```

### 6. 示例 Schema 定义

```typescript
// src/domain/ai/schema/CognitiveParsingSchema.ts

/**
 * 概念提取结果 Schema
 */
export const CONCEPT_EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    concepts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: '概念名称'
          },
          description: {
            type: 'string',
            description: '概念描述'
          },
          importance: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: '概念重要性评分'
          },
          relatedConcepts: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: '相关概念列表'
          }
        },
        required: ['name'],
        additionalProperties: false
      }
    },
    relations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            description: '源概念'
          },
          target: {
            type: 'string',
            description: '目标概念'
          },
          type: {
            type: 'string',
            description: '关系类型'
          },
          strength: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: '关系强度'
          }
        },
        required: ['source', 'target', 'type'],
        additionalProperties: false
      }
    }
  },
  required: ['concepts'],
  additionalProperties: false
};

/**
 * 思考路径提取结果 Schema
 */
export const THOUGHT_PATH_SCHEMA = {
  type: 'object',
  properties: {
    paths: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: '路径 ID'
          },
          steps: {
            type: 'array',
            items: {
              type: 'string',
              description: '路径步骤'
            }
          },
          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: '路径置信度'
          }
        },
        required: ['steps'],
        additionalProperties: false
      }
    }
  },
  required: ['paths'],
  additionalProperties: false
};
```

### 7. 集成到依赖注入容器

```typescript
// src/infrastructure/container/DependencyContainer.ts

import { SimpleDependencyContainer } from '../../../../phase-1-foundation/week-4-minimal-system/26-system-integration-code.md';
import { StructuredOutputService } from '../../application/ai/structured-output/StructuredOutputService';
import { DefaultStructuredOutputService } from '../../application/ai/structured-output/DefaultStructuredOutputService';
import { Logger } from '../../application/logger/Logger';

/**
 * 配置结构化输出相关依赖
 * @param container 依赖注入容器
 */
export function configureStructuredOutputDependencies(container: SimpleDependencyContainer): void {
  // 注册结构化输出服务
  container.registerSingleton(StructuredOutputService, (c) => {
    const logger = c.resolve<Logger>(Logger);
    return new DefaultStructuredOutputService(logger);
  });
}
```

### 8. 与 LLM 客户端集成

```typescript
// src/infrastructure/ai/llm/DefaultLLMClient.ts

import { LLMClient, LLMRequest, LLMResponse } from './LLMClient';
import { ApiCallService } from '../api/ApiCallService';
import { StructuredOutputService } from '../../../application/ai/structured-output/StructuredOutputService';

/**
 * 默认 LLM 客户端实现，集成了结构化输出处理
 */
export class DefaultLLMClient implements LLMClient {
  constructor(
    private apiCallService: ApiCallService,
    private structuredOutputService: StructuredOutputService
  ) {}
  
  // ... 其他方法实现
  
  /**
   * 生成结构化输出
   * @param prompt 提示词
   * @param schema 预期的数据结构 schema
   * @param options LLM 请求选项
   * @returns 解析后的结构化数据
   */
  async generateStructuredOutput<T>(prompt: string, schema: any, options?: Partial<LLMRequest>): Promise<T> {
    const request: LLMRequest = {
      model: options?.model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that outputs structured data in JSON format.' },
        { role: 'user', content: prompt }
      ],
      temperature: options?.temperature || 0.7,
      maxTokens: options?.maxTokens || 1000,
      topP: options?.topP || 1,
      frequencyPenalty: options?.frequencyPenalty || 0,
      presencePenalty: options?.presencePenalty || 0,
      stream: false
    };
    
    const response = await this.sendRequest(request);
    const output = response.choices[0].message.content || '';
    
    return this.structuredOutputService.parseOutput<T>(output, schema);
  }
}
```

### 9. 测试代码

```typescript
// test/application/ai/structured-output/DefaultStructuredOutputService.test.ts

import { DefaultStructuredOutputService } from '../../../../src/application/ai/structured-output/DefaultStructuredOutputService';
import { CONCEPT_EXTRACTION_SCHEMA } from '../../../../src/domain/ai/schema/CognitiveParsingSchema';
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

describe('DefaultStructuredOutputService', () => {
  let structuredOutputService: DefaultStructuredOutputService;
  let logger: Logger;
  
  beforeEach(() => {
    logger = new MockLogger();
    structuredOutputService = new DefaultStructuredOutputService(logger);
  });
  
  describe('extractStructuredData', () => {
    it('should extract JSON from markdown formatted output', () => {
      const output = `Here is your structured data:\n\n```json\n{"concepts": [{"name": "Test Concept"}]}```\n\nThank you!`;
      const extracted = structuredOutputService.extractStructuredData(output);
      
      expect(extracted).toBe('{"concepts": [{"name": "Test Concept"}]}');
    });
    
    it('should return plain text if no markdown formatting', () => {
      const output = '{"concepts": [{"name": "Test Concept"}]}';
      const extracted = structuredOutputService.extractStructuredData(output);
      
      expect(extracted).toBe(output);
    });
  });
  
  describe('parseOutput', () => {
    it('should parse valid JSON output correctly', async () => {
      const output = '{"concepts": [{"name": "Test Concept", "importance": 0.8}]}';
      const result = await structuredOutputService.parseOutput(output, CONCEPT_EXTRACTION_SCHEMA);
      
      expect(result).toEqual({
        concepts: [{ name: 'Test Concept', importance: 0.8 }]
      });
    });
    
    it('should throw error for invalid JSON', async () => {
      const output = '{"concepts": [{"name": "Test Concept", "importance": 0.8}';
      
      await expect(structuredOutputService.parseOutput(output, CONCEPT_EXTRACTION_SCHEMA))
        .rejects.toThrow();
    });
    
    it('should throw error for invalid schema', async () => {
      const output = '{"concepts": [{"name": "Test Concept", "invalidField": "value"}]}';
      
      await expect(structuredOutputService.parseOutput(output, CONCEPT_EXTRACTION_SCHEMA))
        .rejects.toThrow();
    });
  });
  
  describe('validateOutput', () => {
    it('should validate valid data correctly', () => {
      const data = {
        concepts: [{ name: 'Test Concept', importance: 0.8 }]
      };
      const isValid = structuredOutputService.validateOutput(data, CONCEPT_EXTRACTION_SCHEMA);
      
      expect(isValid).toBe(true);
    });
    
    it('should invalidate data with missing required fields', () => {
      const data = {
        concepts: [{ importance: 0.8 }] // 缺少 name 字段
      };
      const isValid = structuredOutputService.validateOutput(data, CONCEPT_EXTRACTION_SCHEMA);
      
      expect(isValid).toBe(false);
    });
  });
});
```

## 设计说明

1. **接口抽象**：通过 `StructuredOutputService` 和 `OutputParser` 接口抽象结构化输出处理逻辑，便于后续扩展和替换实现。

2. **多格式支持**：设计了可扩展的解析器机制，目前实现了 JSON 解析器，可根据需要添加其他格式的解析器（如 YAML、XML 等）。

3. **Schema 验证**：使用 Ajv 库进行 JSON Schema 验证，确保解析出的数据符合预期结构。

4. **错误处理**：定义了专门的异常类，如 `StructuredOutputError`、`OutputParseError` 和 `OutputValidationError`，便于区分不同类型的结构化输出错误。

5. **集成性**：与现有的 LLM 客户端集成，提供了 `generateStructuredOutput` 方法，便于直接生成和解析结构化输出。

6. **依赖注入**：集成到现有的依赖注入容器中，便于在其他服务中使用。

7. **测试支持**：编写了测试代码，便于验证结构化输出服务的功能。

## 今日总结

今天实现了结构化输出处理功能，包括：

1. 定义了 `StructuredOutputService` 接口，抽象了结构化输出处理逻辑
2. 定义了 `OutputParser` 接口，支持多种输出格式的解析
3. 实现了 `JsonOutputParser`，用于解析 JSON 格式的输出
4. 实现了 `DefaultStructuredOutputService`，集成了解析和验证功能
5. 定义了专门的结构化输出异常类
6. 提供了示例 Schema 定义，用于概念提取和思考路径提取
7. 集成到了依赖注入容器中
8. 与 LLM 客户端集成，提供了直接生成结构化输出的方法
9. 编写了测试代码

该功能将用于后续处理 LLM 的输出，将非结构化的文本转换为结构化数据，便于进行认知建模和分析。
