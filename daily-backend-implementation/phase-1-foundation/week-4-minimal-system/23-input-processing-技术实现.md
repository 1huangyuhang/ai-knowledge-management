# Day 23: 第一阶段 - 系统地基期 - Week 4 - 第23天 代码实现

## 输入处理实现

### 1. 输入验证器

```typescript
// src/application/validators/InputValidator.ts
import { z } from 'zod';
import { ThoughtFragment } from '../../domain/entities/ThoughtFragment';

/**
 * 输入验证结果
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

/**
 * 输入验证器
 */
export class InputValidator {
  /**
   * 验证思维片段输入
   * @param input 思维片段输入
   * @returns 验证结果
   */
  public validateThoughtInput(input: any): ValidationResult<{
    content: string;
    tags: string[];
    metadata: Record<string, any>;
  }> {
    const schema = z.object({
      content: z.string()
        .min(1, '内容不能为空')
        .max(10000, '内容不能超过10000个字符')
        .regex(/^[\s\S]*$/u, '内容包含无效字符'),
      tags: z.array(z.string()
        .max(50, '标签不能超过50个字符')
        .regex(/^[^<>]+$/, '标签包含无效字符'))
        .optional()
        .default([]),
      metadata: z.record(z.any())
        .optional()
        .default({}),
    });

    try {
      const validatedData = schema.parse(input);
      return {
        success: true,
        data: validatedData,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR',
        })),
      };
    }
  }

  /**
   * 验证模型ID
   * @param modelId 模型ID
   * @returns 验证结果
   */
  public validateModelId(modelId: string): ValidationResult<string> {
    const schema = z.string().uuid('无效的模型ID');

    try {
      const validatedId = schema.parse(modelId);
      return {
        success: true,
        data: validatedId,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [{
          field: 'modelId',
          message: error.message,
          code: 'INVALID_ID',
        }],
      };
    }
  }

  /**
   * 验证思维片段ID
   * @param thoughtId 思维片段ID
   * @returns 验证结果
   */
  public validateThoughtId(thoughtId: string): ValidationResult<string> {
    const schema = z.string().uuid('无效的思维片段ID');

    try {
      const validatedId = schema.parse(thoughtId);
      return {
        success: true,
        data: validatedId,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [{
          field: 'thoughtId',
          message: error.message,
          code: 'INVALID_ID',
        }],
      };
    }
  }

  /**
   * 验证分页参数
   * @param pagination 分页参数
   * @returns 验证结果
   */
  public validatePagination(pagination: any): ValidationResult<{
    limit: number;
    offset: number;
  }> {
    const schema = z.object({
      limit: z.number()
        .min(1, '每页数量不能小于1')
        .max(100, '每页数量不能超过100')
        .optional()
        .default(10),
      offset: z.number()
        .min(0, '偏移量不能小于0')
        .optional()
        .default(0),
    });

    try {
      const validatedPagination = schema.parse(pagination);
      return {
        success: true,
        data: validatedPagination,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'VALIDATION_ERROR',
        })),
      };
    }
  }
}
```

### 2. 文本预处理服务

```typescript
// src/application/services/TextPreprocessingService.ts
import { injectable } from 'inversify';

/**
 * 文本预处理选项
 */
export interface TextPreprocessingOptions {
  removeExtraWhitespace?: boolean;
  normalizeNewlines?: boolean;
  removeControlCharacters?: boolean;
  trimText?: boolean;
  lowercase?: boolean;
  removePunctuation?: boolean;
}

/**
 * 文本预处理结果
 */
export interface TextPreprocessingResult {
  originalText: string;
  processedText: string;
  metadata: {
    characterCount: number;
    wordCount: number;
    sentenceCount: number;
    processedCharacterCount: number;
    processedWordCount: number;
  };
}

/**
 * 文本预处理服务
 */
export class TextPreprocessingService {
  private readonly defaultOptions: TextPreprocessingOptions = {
    removeExtraWhitespace: true,
    normalizeNewlines: true,
    removeControlCharacters: true,
    trimText: true,
  };

  /**
   * 预处理文本
   * @param text 原始文本
   * @param options 预处理选项
   * @returns 预处理结果
   */
  public preprocessText(
    text: string,
    options: TextPreprocessingOptions = {}
  ): TextPreprocessingResult {
    const mergedOptions = { ...this.defaultOptions, ...options };
    let processedText = text;

    // 1. 去除首尾空格
    if (mergedOptions.trimText) {
      processedText = processedText.trim();
    }

    // 2. 标准化换行符
    if (mergedOptions.normalizeNewlines) {
      processedText = processedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    // 3. 去除多余空格
    if (mergedOptions.removeExtraWhitespace) {
      processedText = processedText.replace(/\s+/g, ' ');
    }

    // 4. 去除控制字符
    if (mergedOptions.removeControlCharacters) {
      processedText = processedText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    }

    // 5. 转换为小写
    if (mergedOptions.lowercase) {
      processedText = processedText.toLowerCase();
    }

    // 6. 去除标点符号
    if (mergedOptions.removePunctuation) {
      processedText = processedText.replace(/[^a-zA-Z0-9\s]/g, '');
    }

    // 计算元数据
    const metadata = {
      characterCount: text.length,
      wordCount: this.countWords(text),
      sentenceCount: this.countSentences(text),
      processedCharacterCount: processedText.length,
      processedWordCount: this.countWords(processedText),
    };

    return {
      originalText: text,
      processedText,
      metadata,
    };
  }

  /**
   * 分词
   * @param text 文本
   * @returns 词语数组
   */
  public tokenize(text: string): string[] {
    if (!text) return [];
    
    // 简单的分词实现，可根据需要扩展为更复杂的算法
    return text
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * 分句
   * @param text 文本
   * @returns 句子数组
   */
  public splitSentences(text: string): string[] {
    if (!text) return [];
    
    // 简单的分句实现，可根据需要扩展为更复杂的算法
    return text.split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);
  }

  /**
   * 提取关键词
   * @param text 文本
   * @param limit 关键词数量限制
   * @returns 关键词数组
   */
  public extractKeywords(text: string, limit: number = 10): string[] {
    const tokens = this.tokenize(text);
    const wordFreq = new Map<string, number>();

    // 计算词频
    for (const token of tokens) {
      const freq = wordFreq.get(token) || 0;
      wordFreq.set(token, freq + 1);
    }

    // 按词频排序并返回前N个
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }

  /**
   * 计算单词数量
   * @param text 文本
   * @returns 单词数量
   */
  private countWords(text: string): number {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }

  /**
   * 计算句子数量
   * @param text 文本
   * @returns 句子数量
   */
  private countSentences(text: string): number {
    if (!text.trim()) return 0;
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  }
}
```

### 3. 思维片段解析器

```typescript
// src/application/parsers/ThoughtFragmentParser.ts
import { ThoughtFragment } from '../../domain/entities/ThoughtFragment';
import { TextPreprocessingService } from '../services/TextPreprocessingService';

/**
 * 思维片段解析选项
 */
export interface ThoughtFragmentParserOptions {
  extractKeywords?: boolean;
  keywordLimit?: number;
  detectLanguage?: boolean;
  analyzeSentiment?: boolean;
}

/**
 * 思维片段解析结果
 */
export interface ThoughtFragmentParserResult {
  thoughtFragment: ThoughtFragment;
  metadata: {
    wordCount: number;
    sentenceCount: number;
    keywords: string[];
    language?: string;
    sentiment?: {
      score: number;
      magnitude: number;
    };
  };
}

/**
 * 思维片段解析器
 */
export class ThoughtFragmentParser {
  private readonly textPreprocessingService: TextPreprocessingService;

  /**
   * 创建思维片段解析器
   */
  constructor() {
    this.textPreprocessingService = new TextPreprocessingService();
  }

  /**
   * 解析思维片段输入
   * @param input 输入数据
   * @param options 解析选项
   * @returns 解析结果
   */
  public parseThoughtFragment(
    input: {
      content: string;
      tags: string[];
      metadata: Record<string, any>;
    },
    options: ThoughtFragmentParserOptions = {}
  ): ThoughtFragmentParserResult {
    const { content, tags, metadata } = input;
    
    // 预处理文本
    const preprocessingResult = this.textPreprocessingService.preprocessText(content);
    
    // 提取关键词
    const keywords = options.extractKeywords 
      ? this.textPreprocessingService.extractKeywords(content, options.keywordLimit || 10)
      : [];

    // 创建思维片段
    const thoughtFragment = new ThoughtFragment({
      content,
      tags,
      metadata: {
        ...metadata,
        originalContent: content,
        processedContent: preprocessingResult.processedText,
        characterCount: preprocessingResult.metadata.characterCount,
        wordCount: preprocessingResult.metadata.wordCount,
        sentenceCount: preprocessingResult.metadata.sentenceCount,
        keywords,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 构建解析结果
    const parserResult: ThoughtFragmentParserResult = {
      thoughtFragment,
      metadata: {
        wordCount: preprocessingResult.metadata.wordCount,
        sentenceCount: preprocessingResult.metadata.sentenceCount,
        keywords,
      },
    };

    // 语言检测（示例实现，可替换为更准确的语言检测服务）
    if (options.detectLanguage) {
      parserResult.metadata.language = this.detectLanguage(content);
    }

    // 情感分析（示例实现，可替换为更准确的情感分析服务）
    if (options.analyzeSentiment) {
      parserResult.metadata.sentiment = this.analyzeSentiment(content);
    }

    return parserResult;
  }

  /**
   * 检测语言（示例实现）
   * @param text 文本
   * @returns 语言代码
   */
  private detectLanguage(text: string): string {
    // 简单的语言检测实现，可替换为更准确的第三方库
    const englishPattern = /[a-zA-Z]/g;
    const chinesePattern = /[\u4e00-\u9fa5]/g;
    
    const englishMatches = text.match(englishPattern) || [];
    const chineseMatches = text.match(chinesePattern) || [];
    
    return chineseMatches.length > englishMatches.length ? 'zh' : 'en';
  }

  /**
   * 情感分析（示例实现）
   * @param text 文本
   * @returns 情感分析结果
   */
  private analyzeSentiment(text: string): {
    score: number;
    magnitude: number;
  } {
    // 简单的情感分析实现，可替换为更准确的第三方库
    const positiveWords = ['好', '棒', '优秀', 'great', 'good', 'excellent', 'happy', 'joy'];
    const negativeWords = ['坏', '差', '糟糕', 'bad', 'terrible', 'sad', 'angry'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    const lowerText = text.toLowerCase();
    
    for (const word of positiveWords) {
      if (lowerText.includes(word)) {
        positiveCount++;
      }
    }
    
    for (const word of negativeWords) {
      if (lowerText.includes(word)) {
        negativeCount++;
      }
    }
    
    const score = (positiveCount - negativeCount) / Math.max(1, positiveCount + negativeCount);
    const magnitude = (positiveCount + negativeCount) / Math.max(1, text.split(' ').length);
    
    return {
      score: Math.max(-1, Math.min(1, score)),
      magnitude: Math.max(0, Math.min(1, magnitude)),
    };
  }
}
```

### 4. 输入格式化器

```typescript
// src/application/formatters/InputFormatter.ts
import { ThoughtFragment } from '../../domain/entities/ThoughtFragment';

/**
 * 输入格式化选项
 */
export interface InputFormatterOptions {
  normalizeTags?: boolean;
  deduplicateTags?: boolean;
  lowercaseTags?: boolean;
  validateMetadataKeys?: boolean;
  stripInvalidMetadataKeys?: boolean;
}

/**
 * 输入格式化器
 */
export class InputFormatter {
  private readonly defaultOptions: InputFormatterOptions = {
    normalizeTags: true,
    deduplicateTags: true,
    lowercaseTags: false,
    validateMetadataKeys: true,
    stripInvalidMetadataKeys: true,
  };

  /**
   * 格式化思维片段输入
   * @param input 输入数据
   * @param options 格式化选项
   * @returns 格式化结果
   */
  public formatThoughtInput(
    input: {
      content: string;
      tags: string[];
      metadata: Record<string, any>;
    },
    options: InputFormatterOptions = {}
  ): {
    content: string;
    tags: string[];
    metadata: Record<string, any>;
  } {
    const mergedOptions = { ...this.defaultOptions, ...options };
    let { content, tags, metadata } = input;

    // 格式化标签
    if (mergedOptions.normalizeTags) {
      tags = this.formatTags(tags, mergedOptions);
    }

    // 格式化元数据
    if (mergedOptions.validateMetadataKeys) {
      metadata = this.formatMetadata(metadata, mergedOptions);
    }

    return {
      content,
      tags,
      metadata,
    };
  }

  /**
   * 格式化标签
   * @param tags 标签数组
   * @param options 格式化选项
   * @returns 格式化后的标签数组
   */
  private formatTags(
    tags: string[],
    options: InputFormatterOptions
  ): string[] {
    let formattedTags = [...tags];

    // 去除空标签
    formattedTags = formattedTags.filter(tag => tag.trim().length > 0);

    // 去除标签首尾空格
    formattedTags = formattedTags.map(tag => tag.trim());

    // 转换为小写
    if (options.lowercaseTags) {
      formattedTags = formattedTags.map(tag => tag.toLowerCase());
    }

    // 去重
    if (options.deduplicateTags) {
      formattedTags = [...new Set(formattedTags)];
    }

    return formattedTags;
  }

  /**
   * 格式化元数据
   * @param metadata 元数据
   * @param options 格式化选项
   * @returns 格式化后的元数据
   */
  private formatMetadata(
    metadata: Record<string, any>,
    options: InputFormatterOptions
  ): Record<string, any> {
    const formattedMetadata: Record<string, any> = {};

    for (const [key, value] of Object.entries(metadata)) {
      // 验证元数据键名
      if (this.isValidMetadataKey(key)) {
        formattedMetadata[key] = value;
      } else if (!options.stripInvalidMetadataKeys) {
        // 如果不允许去除无效键，则转换为有效的键名
        const safeKey = this.makeSafeMetadataKey(key);
        formattedMetadata[safeKey] = value;
      }
    }

    return formattedMetadata;
  }

  /**
   * 验证元数据键名是否有效
   * @param key 键名
   * @returns 是否有效
   */
  private isValidMetadataKey(key: string): boolean {
    // 只允许字母、数字、下划线和连字符
    return /^[a-zA-Z0-9_-]+$/.test(key);
  }

  /**
   * 将无效的元数据键名转换为有效的键名
   * @param key 键名
   * @returns 安全的键名
   */
  private makeSafeMetadataKey(key: string): string {
    // 替换无效字符为下划线
    return key.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * 格式化思维片段为JSON格式
   * @param thoughtFragment 思维片段
   * @returns JSON字符串
   */
  public toJSON(thoughtFragment: ThoughtFragment): string {
    return JSON.stringify({
      id: thoughtFragment.id,
      content: thoughtFragment.content,
      tags: thoughtFragment.tags,
      metadata: thoughtFragment.metadata,
      createdAt: thoughtFragment.createdAt.toISOString(),
      updatedAt: thoughtFragment.updatedAt.toISOString(),
    }, null, 2);
  }

  /**
   * 格式化思维片段为CSV格式
   * @param thoughtFragment 思维片段
   * @returns CSV字符串
   */
  public toCSV(thoughtFragment: ThoughtFragment): string {
    const escapeCsvField = (field: any) => {
      const str = String(field);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    return [
      escapeCsvField(thoughtFragment.id),
      escapeCsvField(thoughtFragment.content),
      escapeCsvField(thoughtFragment.tags.join(';')),
      escapeCsvField(JSON.stringify(thoughtFragment.metadata)),
      escapeCsvField(thoughtFragment.createdAt.toISOString()),
      escapeCsvField(thoughtFragment.updatedAt.toISOString()),
    ].join(',');
  }
}
```

### 5. 输入处理工作流

```typescript
// src/application/workflows/InputProcessingWorkflow.ts
import { InputValidator } from '../validators/InputValidator';
import { TextPreprocessingService } from '../services/TextPreprocessingService';
import { ThoughtFragmentParser } from '../parsers/ThoughtFragmentParser';
import { InputFormatter } from '../formatters/InputFormatter';
import { ThoughtFragment } from '../../domain/entities/ThoughtFragment';

/**
 * 输入处理工作流配置
 */
export interface InputProcessingWorkflowConfig {
  validation: boolean;
  preprocessing: boolean;
  parsing: boolean;
  formatting: boolean;
  extractKeywords: boolean;
  detectLanguage: boolean;
  analyzeSentiment: boolean;
}

/**
 * 输入处理结果
 */
export interface InputProcessingResult {
  thoughtFragment: ThoughtFragment;
  metadata: {
    validation: {
      success: boolean;
      errors: any[];
    };
    preprocessing: any;
    parsing: any;
    formatting: any;
  };
}

/**
 * 输入处理工作流
 */
export class InputProcessingWorkflow {
  private readonly inputValidator: InputValidator;
  private readonly textPreprocessingService: TextPreprocessingService;
  private readonly thoughtFragmentParser: ThoughtFragmentParser;
  private readonly inputFormatter: InputFormatter;

  private readonly defaultConfig: InputProcessingWorkflowConfig = {
    validation: true,
    preprocessing: true,
    parsing: true,
    formatting: true,
    extractKeywords: true,
    detectLanguage: false,
    analyzeSentiment: false,
  };

  /**
   * 创建输入处理工作流
   */
  constructor() {
    this.inputValidator = new InputValidator();
    this.textPreprocessingService = new TextPreprocessingService();
    this.thoughtFragmentParser = new ThoughtFragmentParser();
    this.inputFormatter = new InputFormatter();
  }

  /**
   * 处理输入
   * @param input 原始输入
   * @param config 工作流配置
   * @returns 处理结果
   */
  public async processInput(
    input: any,
    config: Partial<InputProcessingWorkflowConfig> = {}
  ): Promise<InputProcessingResult> {
    const workflowConfig = { ...this.defaultConfig, ...config };
    const metadata: InputProcessingResult['metadata'] = {
      validation: { success: true, errors: [] },
      preprocessing: {},
      parsing: {},
      formatting: {},
    };

    // 1. 验证输入
    if (workflowConfig.validation) {
      const validationResult = this.inputValidator.validateThoughtInput(input);
      metadata.validation = {
        success: validationResult.success,
        errors: validationResult.errors || [],
      };

      if (!validationResult.success) {
        throw new Error('输入验证失败', {
          cause: {
            validationErrors: validationResult.errors,
          },
        });
      }
    }

    // 2. 格式化输入
    let formattedInput = workflowConfig.formatting
      ? this.inputFormatter.formatThoughtInput(input)
      : input;

    // 3. 解析思维片段
    if (workflowConfig.parsing) {
      const parsingResult = this.thoughtFragmentParser.parseThoughtFragment(
        formattedInput,
        {
          extractKeywords: workflowConfig.extractKeywords,
          detectLanguage: workflowConfig.detectLanguage,
          analyzeSentiment: workflowConfig.analyzeSentiment,
        }
      );
      
      metadata.parsing = parsingResult.metadata;

      return {
        thoughtFragment: parsingResult.thoughtFragment,
        metadata,
      };
    }

    // 4. 如果不需要解析，直接创建思维片段
    const thoughtFragment = new ThoughtFragment({
      content: formattedInput.content,
      tags: formattedInput.tags,
      metadata: formattedInput.metadata,
    });

    return {
      thoughtFragment,
      metadata,
    };
  }
}
```

### 6. 输入处理中间件

```typescript
// src/application/middleware/input-processing-middleware.ts
import { Request, Response, NextFunction } from 'express';
import { InputProcessingWorkflow } from '../workflows/InputProcessingWorkflow';

/**
 * 输入处理中间件配置
 */
export interface InputProcessingMiddlewareConfig {
  extractKeywords?: boolean;
  detectLanguage?: boolean;
  analyzeSentiment?: boolean;
}

/**
 * 创建输入处理中间件
 * @param config 中间件配置
 * @returns 中间件函数
 */
export const createInputProcessingMiddleware = (config: InputProcessingMiddlewareConfig = {}) => {
  const inputProcessingWorkflow = new InputProcessingWorkflow();

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.method === 'POST' || req.method === 'PUT') {
        // 处理请求体
        const processingResult = await inputProcessingWorkflow.processInput(req.body, {
          extractKeywords: config.extractKeywords,
          detectLanguage: config.detectLanguage,
          analyzeSentiment: config.analyzeSentiment,
        });

        // 将处理结果附加到请求对象
        req.body = processingResult.thoughtFragment;
        (req as any).processingMetadata = processingResult.metadata;
      }

      next();
    } catch (error: any) {
      if (error.cause?.validationErrors) {
        res.status(400).json({
          success: false,
          error: {
            message: '输入处理失败',
            code: 'INPUT_PROCESSING_FAILED',
            type: 'validationError',
            details: error.cause.validationErrors,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            message: '输入处理失败',
            code: 'INPUT_PROCESSING_FAILED',
            type: 'systemError',
          },
        });
      }
    }
  };
};

/**
 * 输入处理结果中间件
 */
export const inputProcessingResultMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 保存原始的send方法
  const originalSend = res.send;

  res.send = function (body: any) {
    // 如果请求有处理元数据，将其添加到响应头
    if ((req as any).processingMetadata) {
      res.setHeader('X-Processing-Metadata', JSON.stringify((req as any).processingMetadata));
    }

    // 调用原始的send方法
    return originalSend.call(this, body);
  };

  next();
};
```
