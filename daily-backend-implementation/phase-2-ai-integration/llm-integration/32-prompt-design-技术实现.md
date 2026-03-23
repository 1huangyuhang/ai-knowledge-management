# Day 32: 第二阶段 - AI融合期 - Week 1 - 第32天 代码实现

## Prompt 设计实现

### 1. Prompt 模板接口定义

```typescript
// src/application/services/llm/prompt/PromptTemplate.ts

/**
 * Prompt 模板配置
 */
export interface PromptTemplateConfig {
  /**
   * 模板名称
   */
  name: string;
  /**
   * 模板内容
   */
  template: string;
  /**
   * 模板描述
   */
  description?: string;
  /**
   * 模板参数
   */
  parameters?: string[];
  /**
   * 模板默认参数
   */
  defaultParams?: Record<string, any>;
  /**
   * 模板版本
   */
  version?: string;
  /**
   * 模板类型
   */
  type?: string;
}

/**
 * Prompt 生成选项
 */
export interface PromptGenerationOptions {
  /**
   * 模板参数
   */
  params?: Record<string, any>;
  /**
   * 模板名称
   */
  templateName?: string;
  /**
   * 自定义模板
   */
  customTemplate?: string;
}

/**
 * Prompt 模板接口
 */
export interface PromptTemplate {
  /**
   * 获取模板名称
   */
  getName(): string;
  /**
   * 获取模板描述
   */
  getDescription(): string;
  /**
   * 获取模板参数
   */
  getParameters(): string[];
  /**
   * 生成 Prompt
   * @param params 模板参数
   * @returns 生成的 Prompt
   */
  generatePrompt(params: Record<string, any>): string;
  /**
   * 获取模板内容
   */
  getTemplate(): string;
  /**
   * 验证参数是否有效
   * @param params 模板参数
   * @returns 是否有效
   */
  validateParams(params: Record<string, any>): boolean;
}

/**
 * Prompt 模板管理接口
 */
export interface PromptTemplateManager {
  /**
   * 注册模板
   * @param template 模板配置
   */
  registerTemplate(template: PromptTemplateConfig): void;
  /**
   * 获取模板
   * @param name 模板名称
   * @returns 模板
   */
  getTemplate(name: string): PromptTemplate | undefined;
  /**
   * 生成 Prompt
   * @param options 生成选项
   * @returns 生成的 Prompt
   */
  generatePrompt(options: PromptGenerationOptions): string;
  /**
   * 获取所有模板
   * @returns 所有模板
   */
  getAllTemplates(): Map<string, PromptTemplate>;
  /**
   * 删除模板
   * @param name 模板名称
   */
  removeTemplate(name: string): void;
  /**
   * 更新模板
   * @param template 模板配置
   */
  updateTemplate(template: PromptTemplateConfig): void;
}
```

### 2. Prompt 模板实现

```typescript
// src/infrastructure/ai/prompt/PromptTemplateImpl.ts

import { PromptTemplate, PromptTemplateConfig } from '../../../application/services/llm/prompt/PromptTemplate';

/**
 * Prompt 模板实现
 */
export class PromptTemplateImpl implements PromptTemplate {
  private readonly config: PromptTemplateConfig;

  /**
   * 创建 Prompt 模板
   * @param config 模板配置
   */
  constructor(config: PromptTemplateConfig) {
    this.config = {
      version: '1.0.0',
      type: 'default',
      parameters: [],
      defaultParams: {},
      ...config,
    };

    // 从模板中提取参数
    this.extractParameters();
  }

  /**
   * 获取模板名称
   */
  public getName(): string {
    return this.config.name;
  }

  /**
   * 获取模板描述
   */
  public getDescription(): string {
    return this.config.description || '';
  }

  /**
   * 获取模板参数
   */
  public getParameters(): string[] {
    return this.config.parameters || [];
  }

  /**
   * 生成 Prompt
   * @param params 模板参数
   * @returns 生成的 Prompt
   */
  public generatePrompt(params: Record<string, any>): string {
    let prompt = this.config.template;

    // 合并默认参数和用户参数
    const mergedParams = {
      ...this.config.defaultParams,
      ...params,
    };

    // 替换模板中的参数
    for (const [key, value] of Object.entries(mergedParams)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      prompt = prompt.replace(regex, String(value));
    }

    return prompt;
  }

  /**
   * 获取模板内容
   */
  public getTemplate(): string {
    return this.config.template;
  }

  /**
   * 验证参数是否有效
   * @param params 模板参数
   * @returns 是否有效
   */
  public validateParams(params: Record<string, any>): boolean {
    // 检查必填参数是否存在
    for (const param of this.config.parameters || []) {
      if (!(param in params) && !(param in this.config.defaultParams)) {
        return false;
      }
    }
    return true;
  }

  /**
   * 从模板中提取参数
   */
  private extractParameters(): void {
    const params: string[] = [];
    const regex = /{{(\w+)}}/g;
    let match;

    while ((match = regex.exec(this.config.template)) !== null) {
      if (!params.includes(match[1])) {
        params.push(match[1]);
      }
    }

    this.config.parameters = params;
  }
}
```

### 3. Prompt 模板管理器实现

```typescript
// src/infrastructure/ai/prompt/PromptTemplateManagerImpl.ts

import { PromptTemplate, PromptTemplateConfig, PromptTemplateManager, PromptGenerationOptions } from '../../../application/services/llm/prompt/PromptTemplate';
import { PromptTemplateImpl } from './PromptTemplateImpl';
import { LoggingSystem } from '../../logging/LoggingSystem';

/**
 * Prompt 模板管理器实现
 */
export class PromptTemplateManagerImpl implements PromptTemplateManager {
  private readonly templates: Map<string, PromptTemplate> = new Map();
  private readonly loggingSystem: LoggingSystem;

  /**
   * 创建 Prompt 模板管理器
   * @param loggingSystem 日志系统
   */
  constructor(loggingSystem: LoggingSystem) {
    this.loggingSystem = loggingSystem;
    this.registerDefaultTemplates();
  }

  /**
   * 注册模板
   * @param template 模板配置
   */
  public registerTemplate(template: PromptTemplateConfig): void {
    const promptTemplate = new PromptTemplateImpl(template);
    this.templates.set(template.name, promptTemplate);
    this.loggingSystem.logInfo('Prompt template registered', { templateName: template.name });
  }

  /**
   * 获取模板
   * @param name 模板名称
   * @returns 模板
   */
  public getTemplate(name: string): PromptTemplate | undefined {
    return this.templates.get(name);
  }

  /**
   * 生成 Prompt
   * @param options 生成选项
   * @returns 生成的 Prompt
   */
  public generatePrompt(options: PromptGenerationOptions): string {
    if (options.customTemplate) {
      // 使用自定义模板
      const customTemplate = new PromptTemplateImpl({
        name: 'custom',
        template: options.customTemplate,
        description: 'Custom template',
      });
      return customTemplate.generatePrompt(options.params || {});
    }

    const templateName = options.templateName || 'default';
    const template = this.templates.get(templateName);

    if (!template) {
      throw new Error(`Prompt template not found: ${templateName}`);
    }

    // 验证参数
    if (!template.validateParams(options.params || {})) {
      throw new Error(`Invalid parameters for template: ${templateName}`);
    }

    const prompt = template.generatePrompt(options.params || {});
    this.loggingSystem.logInfo('Prompt generated', {
      templateName,
      promptLength: prompt.length,
    });

    return prompt;
  }

  /**
   * 获取所有模板
   * @returns 所有模板
   */
  public getAllTemplates(): Map<string, PromptTemplate> {
    return this.templates;
  }

  /**
   * 删除模板
   * @param name 模板名称
   */
  public removeTemplate(name: string): void {
    this.templates.delete(name);
    this.loggingSystem.logInfo('Prompt template removed', { templateName: name });
  }

  /**
   * 更新模板
   * @param template 模板配置
   */
  public updateTemplate(template: PromptTemplateConfig): void {
    this.registerTemplate(template);
  }

  /**
   * 注册默认模板
   */
  private registerDefaultTemplates(): void {
    // 注册默认模板
    this.registerTemplate({
      name: 'default',
      template: '请根据以下内容生成响应：\n\n{{content}}',
      description: '默认模板',
      parameters: ['content'],
    });

    // 注册思维片段解析模板
    this.registerTemplate({
      name: 'thought-parser',
      template: `你是一个思维片段解析专家，请从以下文本中提取关键概念和它们之间的关系：\n\n{{text}}\n\n请以JSON格式输出，包含以下字段：\n- concepts: 概念列表，每个概念包含name、description和type\n- relations: 关系列表，每个关系包含source、target和type\n- summary: 文本摘要\n\n请确保输出格式正确，不要包含任何额外内容。`,
      description: '思维片段解析模板',
      parameters: ['text'],
    });

    // 注册概念关系推断模板
    this.registerTemplate({
      name: 'relation-inference',
      template: `你是一个概念关系推断专家，请根据以下概念列表推断它们之间的潜在关系：\n\n概念列表：\n{{concepts}}\n\n请以JSON格式输出，包含以下字段：\n- relations: 关系列表，每个关系包含source、target、type和confidence\n\n请确保输出格式正确，不要包含任何额外内容。`,
      description: '概念关系推断模板',
      parameters: ['concepts'],
    });

    // 注册认知模型摘要模板
    this.registerTemplate({
      name: 'model-summary',
      template: `你是一个认知模型分析专家，请根据以下认知模型数据生成一个简洁的摘要：\n\n认知模型数据：\n{{modelData}}\n\n请从以下几个方面生成摘要：\n1. 核心概念\n2. 主要关系\n3. 认知结构特点\n4. 潜在的认知盲区\n\n请确保摘要简洁明了，不要超过500字。`,
      description: '认知模型摘要模板',
      parameters: ['modelData'],
    });

    // 注册主题分析模板
    this.registerTemplate({
      name: 'theme-analysis',
      template: `你是一个主题分析专家，请从以下文本中提取核心主题：\n\n文本：\n{{text}}\n\n请以JSON格式输出，包含以下字段：\n- themes: 主题列表，每个主题包含name、weight和relatedConcepts\n- summary: 主题分析摘要\n\n请确保输出格式正确，不要包含任何额外内容。`,
      description: '主题分析模板',
      parameters: ['text'],
    });
  }
}
```

### 4. Prompt 服务工厂

```typescript
// src/application/services/llm/prompt/PromptServiceFactory.ts

import { PromptTemplateManager } from './PromptTemplate';
import { PromptTemplateManagerImpl } from '../../../infrastructure/ai/prompt/PromptTemplateManagerImpl';
import { LoggingSystem } from '../../../infrastructure/logging/LoggingSystem';

/**
 * Prompt 服务工厂
 */
export class PromptServiceFactory {
  /**
   * 创建 Prompt 模板管理器
   * @param loggingSystem 日志系统
   * @returns Prompt 模板管理器
   */
  public static createPromptTemplateManager(
    loggingSystem: LoggingSystem
  ): PromptTemplateManager {
    return new PromptTemplateManagerImpl(loggingSystem);
  }
}
```

### 5. Prompt 生成服务

```typescript
// src/application/services/llm/prompt/PromptGenerationService.ts

import { PromptTemplateManager } from './PromptTemplate';
import { LLMClient } from '../LLMClient';
import { LoggingSystem } from '../../../infrastructure/logging/LoggingSystem';

/**
 * Prompt 生成服务配置
 */
export interface PromptGenerationServiceConfig {
  defaultTemplate?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Prompt 生成服务
 */
export class PromptGenerationService {
  private readonly promptTemplateManager: PromptTemplateManager;
  private readonly llmClient: LLMClient;
  private readonly loggingSystem: LoggingSystem;
  private readonly config: PromptGenerationServiceConfig;

  /**
   * 创建 Prompt 生成服务
   * @param promptTemplateManager Prompt 模板管理器
   * @param llmClient LLM 客户端
   * @param loggingSystem 日志系统
   * @param config 配置
   */
  constructor(
    promptTemplateManager: PromptTemplateManager,
    llmClient: LLMClient,
    loggingSystem: LoggingSystem,
    config: PromptGenerationServiceConfig = {}
  ) {
    this.promptTemplateManager = promptTemplateManager;
    this.llmClient = llmClient;
    this.loggingSystem = loggingSystem;
    this.config = {
      defaultTemplate: 'default',
      temperature: 0.7,
      maxTokens: 1000,
      ...config,
    };
  }

  /**
   * 生成并执行 Prompt
   * @param options 生成选项
   * @returns LLM 响应
   */
  public async generateAndExecutePrompt(options: any): Promise<string> {
    // 生成 Prompt
    const prompt = this.promptTemplateManager.generatePrompt(options);

    // 执行 Prompt
    const response = await this.llmClient.generateText(prompt, {
      temperature: options.temperature || this.config.temperature,
      maxTokens: options.maxTokens || this.config.maxTokens,
    });

    return response;
  }

  /**
   * 生成并流式执行 Prompt
   * @param options 生成选项
   * @returns 文本流
   */
  public async *generateAndStreamPrompt(options: any): AsyncGenerator<string, void, unknown> {
    // 生成 Prompt
    const prompt = this.promptTemplateManager.generatePrompt(options);

    // 流式执行 Prompt
    yield* this.llmClient.streamText(prompt, {
      temperature: options.temperature || this.config.temperature,
      maxTokens: options.maxTokens || this.config.maxTokens,
    });
  }

  /**
   * 获取模板管理器
   * @returns 模板管理器
   */
  public getPromptTemplateManager(): PromptTemplateManager {
    return this.promptTemplateManager;
  }
}
```

### 6. 依赖注入配置

```typescript
// src/infrastructure/dependency-injection/ai/PromptDependencyConfig.ts

import { globalContainer } from '../DependencyContainer';
import { PromptTemplateManager } from '../../../application/services/llm/prompt/PromptTemplate';
import { PromptTemplateManagerImpl } from '../ai/prompt/PromptTemplateManagerImpl';
import { PromptGenerationService } from '../../../application/services/llm/prompt/PromptGenerationService';
import { LoggingSystem } from '../logging/LoggingSystem';
import { LLMClient } from '../../../application/services/llm/LLMClient';

/**
 * 配置 Prompt 相关依赖
 * @param loggingSystem 日志系统
 */
export const configurePromptDependencies = (
  loggingSystem: LoggingSystem
): void => {
  // 注册 Prompt 模板管理器
  globalContainer.registerSingleton<PromptTemplateManager>('PromptTemplateManager', () => {
    return new PromptTemplateManagerImpl(loggingSystem);
  });

  // 注册 Prompt 生成服务
  globalContainer.registerSingleton<PromptGenerationService>('PromptGenerationService', () => {
    const promptTemplateManager = globalContainer.resolve<PromptTemplateManager>('PromptTemplateManager');
    const llmClient = globalContainer.resolve<LLMClient>('LLMClient');
    return new PromptGenerationService(promptTemplateManager, llmClient, loggingSystem);
  });
};
```

### 7. 系统集成器扩展

```typescript
// src/infrastructure/system/SystemIntegrator.ts (扩展)

import { configureAIDependencies } from './dependency-injection/ai/DependencyConfig';
import { configurePromptDependencies } from './dependency-injection/ai/PromptDependencyConfig';

/**
 * 系统集成器
 * 负责初始化和管理所有系统组件
 */
export class SystemIntegrator {
  // 原有代码...

  /**
   * 初始化系统
   */
  public async initialize(): Promise<SystemComponents> {
    // 原有初始化代码...

    // 配置 AI 依赖
    configureAIDependencies(this.configManager, loggingSystem, errorHandler);
    loggingSystem.logInfo('AI dependencies configured');

    // 配置 Prompt 依赖
    configurePromptDependencies(loggingSystem);
    loggingSystem.logInfo('Prompt dependencies configured');

    // 原有初始化代码...
  }
}
```

### 8. 测试用例

```typescript
// src/application/services/llm/prompt/PromptTemplate.test.ts

import { PromptTemplateImpl } from '../../../infrastructure/ai/prompt/PromptTemplateImpl';
import { PromptTemplateManagerImpl } from '../../../infrastructure/ai/prompt/PromptTemplateManagerImpl';
import { LoggingSystem } from '../../../infrastructure/logging/LoggingSystem';

// Mock logging
const mockLoggingSystem = {
  logInfo: jest.fn(),
  logError: jest.fn(),
} as unknown as LoggingSystem;

describe('PromptTemplateImpl', () => {
  it('should generate prompt with parameters', () => {
    const template = new PromptTemplateImpl({
      name: 'test-template',
      template: 'Hello {{name}}, welcome to {{app}}!',
      description: 'Test template',
    });

    const prompt = template.generatePrompt({ name: 'John', app: 'AI Assistant' });
    expect(prompt).toBe('Hello John, welcome to AI Assistant!');
    expect(template.getName()).toBe('test-template');
    expect(template.getDescription()).toBe('Test template');
    expect(template.getParameters()).toEqual(['name', 'app']);
    expect(template.validateParams({ name: 'John', app: 'AI Assistant' })).toBe(true);
    expect(template.validateParams({ name: 'John' })).toBe(false);
  });

  it('should use default parameters when not provided', () => {
    const template = new PromptTemplateImpl({
      name: 'test-template',
      template: 'Hello {{name}}, welcome to {{app}}!',
      description: 'Test template',
      defaultParams: { app: 'Default App' },
    });

    const prompt = template.generatePrompt({ name: 'John' });
    expect(prompt).toBe('Hello John, welcome to Default App!');
    expect(template.validateParams({ name: 'John' })).toBe(true);
  });
});

describe('PromptTemplateManagerImpl', () => {
  it('should register and get templates', () => {
    const manager = new PromptTemplateManagerImpl(mockLoggingSystem);
    
    manager.registerTemplate({
      name: 'custom-template',
      template: 'Custom template: {{param}}',
      description: 'Custom template',
    });

    const template = manager.getTemplate('custom-template');
    expect(template).toBeDefined();
    expect(template?.getName()).toBe('custom-template');
    
    const prompt = manager.generatePrompt({
      templateName: 'custom-template',
      params: { param: 'test' },
    });
    expect(prompt).toBe('Custom template: test');
  });

  it('should generate prompt with custom template', () => {
    const manager = new PromptTemplateManagerImpl(mockLoggingSystem);
    
    const prompt = manager.generatePrompt({
      customTemplate: 'Custom template: {{param}}',
      params: { param: 'test' },
    });
    expect(prompt).toBe('Custom template: test');
  });

  it('should throw error for invalid template', () => {
    const manager = new PromptTemplateManagerImpl(mockLoggingSystem);
    
    expect(() => {
      manager.generatePrompt({
        templateName: 'non-existent-template',
        params: { param: 'test' },
      });
    }).toThrow('Prompt template not found: non-existent-template');
  });

  it('should have default templates registered', () => {
    const manager = new PromptTemplateManagerImpl(mockLoggingSystem);
    const templates = manager.getAllTemplates();
    
    expect(templates.has('default')).toBe(true);
    expect(templates.has('thought-parser')).toBe(true);
    expect(templates.has('relation-inference')).toBe(true);
    expect(templates.has('model-summary')).toBe(true);
    expect(templates.has('theme-analysis')).toBe(true);
  });
});
```

### 9. 使用示例

```typescript
// src/application/usecases/llm/GenerateThoughtAnalysisUseCase.ts

import { PromptGenerationService } from '../../services/llm/prompt/PromptGenerationService';
import { LoggingSystem } from '../../../infrastructure/logging/LoggingSystem';

/**
 * 生成思维分析用例
 */
export class GenerateThoughtAnalysisUseCase {
  private readonly promptGenerationService: PromptGenerationService;
  private readonly loggingSystem: LoggingSystem;

  /**
   * 创建生成思维分析用例
   * @param promptGenerationService Prompt 生成服务
   * @param loggingSystem 日志系统
   */
  constructor(
    promptGenerationService: PromptGenerationService,
    loggingSystem: LoggingSystem
  ) {
    this.promptGenerationService = promptGenerationService;
    this.loggingSystem = loggingSystem;
  }

  /**
   * 执行用例
   * @param text 思维片段文本
   * @returns 分析结果
   */
  public async execute(text: string): Promise<any> {
    try {
      this.loggingSystem.logInfo('Generating thought analysis', { textLength: text.length });
      
      const result = await this.promptGenerationService.generateAndExecutePrompt({
        templateName: 'thought-parser',
        params: { text },
        temperature: 0.3,
        maxTokens: 2000,
      });

      // 解析 JSON 结果
      return JSON.parse(result);
    } catch (error: any) {
      this.loggingSystem.logError('Failed to generate thought analysis', { error: error.message });
      throw error;
    }
  }
}
```

## 实现总结

1. **Prompt 模板系统**：实现了完整的 Prompt 模板系统，支持模板注册、获取、更新和删除。

2. **动态 Prompt 生成**：支持根据模板和参数动态生成 Prompt，提高了 Prompt 的复用性和灵活性。

3. **默认模板库**：内置了多种常用模板，包括思维片段解析、概念关系推断、认知模型摘要、主题分析等。

4. **模板参数验证**：实现了模板参数验证，确保生成的 Prompt 格式正确。

5. **自定义模板支持**：支持使用自定义模板生成 Prompt，提高了系统的灵活性。

6. **与 LLM 客户端集成**：实现了 Prompt 生成服务，能够直接调用 LLM 客户端执行 Prompt。

7. **详细日志记录**：记录了 Prompt 模板的注册、使用和生成过程，便于调试和监控。

8. **依赖注入支持**：通过依赖注入容器管理 Prompt 相关服务，便于测试和替换。

9. **完整的测试用例**：实现了针对 Prompt 模板和模板管理器的测试用例，确保系统的可靠性。

10. **使用示例**：提供了使用 Prompt 生成服务的示例用例，展示了如何在实际业务中使用。

这个实现遵循了 Clean Architecture 原则，将 Prompt 相关的接口定义在应用层，实现放在基础设施层，保持了系统的分层结构和依赖方向。同时，实现了完整的错误处理、日志记录和测试用例，确保了系统的可靠性和可观测性。