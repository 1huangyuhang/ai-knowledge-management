# 55-反馈格式化技术实现文档

## 1. 模块概述

### 1.1 功能定位
反馈格式化模块是认知反馈系统的重要组成部分，负责将系统生成的各种认知洞察、主题分析、思维盲点和概念空洞等结果格式化为用户友好的反馈形式。该模块支持多种输出格式，能够根据用户偏好和使用场景动态调整反馈的呈现方式，确保反馈内容清晰、易读、有价值，并能有效帮助用户理解和改进自己的认知结构。

### 1.2 设计原则
- 遵循 Clean Architecture 原则，核心业务逻辑与 AI 能力解耦
- 支持多种反馈格式，便于扩展和替换
- 高内聚、低耦合，与其他模块通过接口交互
- 支持个性化反馈定制
- 提供可配置的反馈格式化参数
- 确保反馈内容的可读性和有效性

### 1.3 技术栈
- TypeScript
- Node.js
- Express.js (HTTP API)
- SQLite (结构化数据存储)
- OpenAI API (AI 辅助反馈生成)
- 模板引擎 (如 Handlebars 或 EJS)
- Markdown 处理库 (如 marked)
- HTML 处理库 (如 cheerio)

## 2. 架构设计

### 2.1 分层架构
```
┌─────────────────────────────────────────────────┐
│ Presentation Layer                              │
│ - REST API Controllers                          │
├─────────────────────────────────────────────────┤
│ Application Layer                               │
│ - FeedbackFormattingUseCase                     │
│ - FeedbackFormattingService (Interface)         │
├─────────────────────────────────────────────────┤
│ Domain Layer                                    │
│ - FormattedFeedback (Entity)                    │
│ - FeedbackFormat (Enum)                         │
│ - FeedbackFormattingRules                       │
├─────────────────────────────────────────────────┤
│ Infrastructure Layer                            │
│ - FeedbackRepository                            │
│ - TemplateService                               │
│ - CacheService                                  │
├─────────────────────────────────────────────────┤
│ AI Capability Layer                             │
│ - AIFeedbackFormatter                           │
│ - NLPService                                    │
└─────────────────────────────────────────────────┘
```

### 2.2 核心组件

| 组件 | 职责 | 所在层 |
|------|------|--------|
| FeedbackFormattingService | 反馈格式化核心服务接口 | Application |
| FeedbackFormattingServiceImpl | 反馈格式化服务实现 | Application |
| FeedbackFormatter | 反馈格式化器接口 | Application |
| MarkdownFeedbackFormatter | Markdown 格式反馈格式化器 | Application |
| HtmlFeedbackFormatter | HTML 格式反馈格式化器 | Application |
| PlainTextFeedbackFormatter | 纯文本格式反馈格式化器 | Application |
| JsonFeedbackFormatter | JSON 格式反馈格式化器 | Application |
| AIFeedbackFormatter | AI 辅助反馈格式化器 | AI Capability |
| FeedbackRepository | 反馈存储仓库 | Infrastructure |
| TemplateService | 模板服务 | Infrastructure |
| CacheService | 反馈缓存服务 | Infrastructure |
| NLPService | 自然语言处理服务 | AI Capability |

## 3. 核心接口定义

### 3.1 FeedbackFormattingService
```typescript
/**
 * 反馈格式化服务接口
 */
export interface FeedbackFormattingService {
  /**
   * 格式化认知反馈
   * @param userId 用户ID
   * @param feedbackData 反馈数据
   * @param format 反馈格式
   * @param options 反馈格式化选项
   * @returns 格式化后的反馈
   */
  formatFeedback(
    userId: string,
    feedbackData: FeedbackData,
    format: FeedbackFormat,
    options?: FeedbackFormattingOptions
  ): Promise<FormattedFeedback>;

  /**
   * 为用户生成多格式反馈
   * @param userId 用户ID
   * @param feedbackData 反馈数据
   * @param formats 反馈格式列表
   * @param options 反馈格式化选项
   * @returns 多种格式的反馈
   */
  generateMultiFormatFeedback(
    userId: string,
    feedbackData: FeedbackData,
    formats: FeedbackFormat[],
    options?: FeedbackFormattingOptions
  ): Promise<FormattedFeedback[]>;

  /**
   * 获取用户的历史反馈
   * @param userId 用户ID
   * @param filters 过滤条件
   * @returns 历史反馈列表
   */
  getHistoricalFeedback(userId: string, filters: FeedbackFilters): Promise<FormattedFeedback[]>;

  /**
   * 获取特定反馈的详细信息
   * @param feedbackId 反馈ID
   * @returns 反馈详细信息
   */
  getFeedbackDetails(feedbackId: string): Promise<FormattedFeedback>;

  /**
   * 更新反馈格式化配置
   * @param userId 用户ID
   * @param config 反馈格式化配置
   */
  updateFeedbackFormattingConfig(userId: string, config: FeedbackFormattingConfig): Promise<void>;
}

/**
 * 反馈数据
 */
export interface FeedbackData {
  insights?: CognitiveInsight[];
  themes?: CognitiveTheme[];
  blindspots?: CognitiveBlindspot[];
  gaps?: CognitiveGap[];
  metadata?: Record<string, any>;
}

/**
 * 反馈格式化选项
 */
export interface FeedbackFormattingOptions {
  templateId?: string;
  includeTitle?: boolean;
  includeMetadata?: boolean;
  includeTimestamp?: boolean;
  includeSuggestions?: boolean;
  maxItemsPerSection?: number;
  prioritySections?: FeedbackSection[];
  customStyles?: Record<string, any>;
}

/**
 * 反馈过滤条件
 */
export interface FeedbackFilters {
  startDate?: Date;
  endDate?: Date;
  formats?: FeedbackFormat[];
  sections?: FeedbackSection[];
}

/**
 * 反馈格式化配置
 */
export interface FeedbackFormattingConfig {
  defaultFormat: FeedbackFormat;
  preferredTemplates: Record<FeedbackFormat, string>;
  includeMetadata: boolean;
  includeTimestamp: boolean;
  maxItemsPerSection: number;
  prioritySections: FeedbackSection[];
}

/**
 * 反馈部分枚举
 */
export enum FeedbackSection {
  INSIGHTS = 'INSIGHTS',
  THEMES = 'THEMES',
  BLINDSPOTS = 'BLINDSPOTS',
  GAPS = 'GAPS',
  SUMMARY = 'SUMMARY'
}
```

### 3.2 FeedbackFormatter
```typescript
/**
 * 反馈格式枚举
 */
export enum FeedbackFormat {
  MARKDOWN = 'MARKDOWN',
  HTML = 'HTML',
  PLAIN_TEXT = 'PLAIN_TEXT',
  JSON = 'JSON',
  AI_GENERATED = 'AI_GENERATED'
}

/**
 * 反馈格式化器接口
 */
export interface FeedbackFormatter {
  /**
   * 获取支持的反馈格式
   */
  getSupportedFormat(): FeedbackFormat;

  /**
   * 格式化反馈
   * @param feedbackData 反馈数据
   * @param options 反馈格式化选项
   * @returns 格式化后的反馈内容
   */
  format(feedbackData: FeedbackData, options?: FeedbackFormattingOptions): Promise<string>;
}
```

## 4. 数据结构设计

### 4.1 FormattedFeedback (实体)
```typescript
/**
 * 格式化反馈实体
 */
export class FormattedFeedback {
  constructor(
    public id: string,
    public userId: string,
    public format: FeedbackFormat,
    public content: string,
    public sections: FeedbackSection[],
    public metadata: Record<string, any>,
    public feedbackDataId?: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

/**
 * 反馈模板实体
 */
export class FeedbackTemplate {
  constructor(
    public id: string,
    public name: string,
    public format: FeedbackFormat,
    public content: string,
    public defaultOptions: FeedbackFormattingOptions,
    public isCustom: boolean,
    public userId?: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
```

## 5. 实现细节

### 5.1 FeedbackFormattingServiceImpl
```typescript
/**
 * 反馈格式化服务实现
 */
export class FeedbackFormattingServiceImpl implements FeedbackFormattingService {
  private readonly feedbackFormatters: Map<FeedbackFormat, FeedbackFormatter>;
  private readonly cacheService: CacheService;
  private readonly feedbackRepository: FeedbackRepository;
  private readonly templateService: TemplateService;
  private readonly configRepository: ConfigRepository;

  constructor(
    cacheService: CacheService,
    feedbackRepository: FeedbackRepository,
    templateService: TemplateService,
    configRepository: ConfigRepository,
    ...formatters: FeedbackFormatter[]
  ) {
    this.cacheService = cacheService;
    this.feedbackRepository = feedbackRepository;
    this.templateService = templateService;
    this.configRepository = configRepository;
    this.feedbackFormatters = new Map(formatters.map(formatter => [formatter.getSupportedFormat(), formatter]));
  }

  async formatFeedback(
    userId: string,
    feedbackData: FeedbackData,
    format: FeedbackFormat,
    options?: FeedbackFormattingOptions
  ): Promise<FormattedFeedback> {
    const cacheKey = `feedback:${userId}:${format}:${JSON.stringify(feedbackData)}:${JSON.stringify(options)}`;
    
    // 检查缓存
    if (options?.cache !== false) {
      const cachedFeedback = await this.cacheService.get<FormattedFeedback>(cacheKey);
      if (cachedFeedback) {
        return cachedFeedback;
      }
    }

    // 获取用户配置
    const userConfig = await this.configRepository.getFeedbackFormattingConfig(userId);
    
    // 合并选项和配置
    const mergedOptions = {
      ...userConfig,
      ...options
    };

    // 获取反馈格式化器
    const formatter = this.feedbackFormatters.get(format);
    if (!formatter) {
      throw new Error(`Unsupported feedback format: ${format}`);
    }

    // 格式化反馈
    const formattedContent = await formatter.format(feedbackData, mergedOptions);

    // 确定包含的反馈部分
    const includedSections = this.determineIncludedSections(feedbackData);

    // 创建格式化反馈实体
    const formattedFeedback = new FormattedFeedback(
      uuidv4(),
      userId,
      format,
      formattedContent,
      includedSections,
      {
        formattingOptions: mergedOptions,
        feedbackDataSummary: this.generateFeedbackDataSummary(feedbackData)
      },
      undefined,
      new Date(),
      new Date()
    );

    // 保存反馈
    await this.feedbackRepository.saveFeedback(formattedFeedback);

    // 缓存结果
    await this.cacheService.set(cacheKey, formattedFeedback, 3600); // 缓存1小时

    return formattedFeedback;
  }

  async generateMultiFormatFeedback(
    userId: string,
    feedbackData: FeedbackData,
    formats: FeedbackFormat[],
    options?: FeedbackFormattingOptions
  ): Promise<FormattedFeedback[]> {
    // 并行生成多种格式的反馈
    const feedbackPromises = formats.map(format => 
      this.formatFeedback(userId, feedbackData, format, options)
    );
    
    return Promise.all(feedbackPromises);
  }

  private determineIncludedSections(feedbackData: FeedbackData): FeedbackSection[] {
    const sections: FeedbackSection[] = [];
    
    if (feedbackData.insights && feedbackData.insights.length > 0) {
      sections.push(FeedbackSection.INSIGHTS);
    }
    
    if (feedbackData.themes && feedbackData.themes.length > 0) {
      sections.push(FeedbackSection.THEMES);
    }
    
    if (feedbackData.blindspots && feedbackData.blindspots.length > 0) {
      sections.push(FeedbackSection.BLINDSPOTS);
    }
    
    if (feedbackData.gaps && feedbackData.gaps.length > 0) {
      sections.push(FeedbackSection.GAPS);
    }
    
    sections.push(FeedbackSection.SUMMARY);
    
    return sections;
  }

  private generateFeedbackDataSummary(feedbackData: FeedbackData): Record<string, any> {
    return {
      insightCount: feedbackData.insights?.length || 0,
      themeCount: feedbackData.themes?.length || 0,
      blindspotCount: feedbackData.blindspots?.length || 0,
      gapCount: feedbackData.gaps?.length || 0
    };
  }

  // 其他方法实现...
}
```

### 5.2 MarkdownFeedbackFormatter
```typescript
/**
 * Markdown 格式反馈格式化器
 */
export class MarkdownFeedbackFormatter implements FeedbackFormatter {
  private readonly templateService: TemplateService;

  constructor(templateService: TemplateService) {
    this.templateService = templateService;
  }

  getSupportedFormat(): FeedbackFormat {
    return FeedbackFormat.MARKDOWN;
  }

  async format(feedbackData: FeedbackData, options?: FeedbackFormattingOptions): Promise<string> {
    // 获取模板
    const templateId = options?.templateId || 'default-markdown';
    const template = await this.templateService.getTemplate(templateId);
    
    // 准备模板数据
    const templateData = this.prepareTemplateData(feedbackData, options);
    
    // 渲染模板
    return this.templateService.renderTemplate(template, templateData);
  }

  private prepareTemplateData(feedbackData: FeedbackData, options?: FeedbackFormattingOptions): any {
    // 准备模板数据
    const data = {
      title: '认知反馈报告',
      timestamp: new Date().toISOString(),
      sections: this.determineIncludedSections(feedbackData),
      insights: feedbackData.insights?.slice(0, options?.maxItemsPerSection || 10) || [],
      themes: feedbackData.themes?.slice(0, options?.maxItemsPerSection || 10) || [],
      blindspots: feedbackData.blindspots?.slice(0, options?.maxItemsPerSection || 10) || [],
      gaps: feedbackData.gaps?.slice(0, options?.maxItemsPerSection || 10) || [],
      metadata: options?.includeMetadata ? feedbackData.metadata : undefined,
      includeTimestamp: options?.includeTimestamp !== false
    };
    
    // 添加摘要
    data.summary = this.generateSummary(feedbackData);
    
    return data;
  }

  private determineIncludedSections(feedbackData: FeedbackData): string[] {
    // 确定包含的章节
    const sections: string[] = [];
    
    if (feedbackData.insights && feedbackData.insights.length > 0) {
      sections.push('insights');
    }
    
    if (feedbackData.themes && feedbackData.themes.length > 0) {
      sections.push('themes');
    }
    
    if (feedbackData.blindspots && feedbackData.blindspots.length > 0) {
      sections.push('blindspots');
    }
    
    if (feedbackData.gaps && feedbackData.gaps.length > 0) {
      sections.push('gaps');
    }
    
    sections.push('summary');
    
    return sections;
  }

  private generateSummary(feedbackData: FeedbackData): string {
    // 生成反馈摘要
    const summaryParts: string[] = [];
    
    if (feedbackData.insights && feedbackData.insights.length > 0) {
      summaryParts.push(`识别到 ${feedbackData.insights.length} 个认知洞察`);
    }
    
    if (feedbackData.themes && feedbackData.themes.length > 0) {
      summaryParts.push(`分析出 ${feedbackData.themes.length} 个核心主题`);
    }
    
    if (feedbackData.blindspots && feedbackData.blindspots.length > 0) {
      summaryParts.push(`检测到 ${feedbackData.blindspots.length} 个思维盲点`);
    }
    
    if (feedbackData.gaps && feedbackData.gaps.length > 0) {
      summaryParts.push(`发现 ${feedbackData.gaps.length} 个概念空洞`);
    }
    
    return summaryParts.join('，') + '。';
  }
}
```

### 5.3 HtmlFeedbackFormatter
```typescript
/**
 * HTML 格式反馈格式化器
 */
export class HtmlFeedbackFormatter implements FeedbackFormatter {
  private readonly templateService: TemplateService;

  constructor(templateService: TemplateService) {
    this.templateService = templateService;
  }

  getSupportedFormat(): FeedbackFormat {
    return FeedbackFormat.HTML;
  }

  async format(feedbackData: FeedbackData, options?: FeedbackFormattingOptions): Promise<string> {
    // 获取模板
    const templateId = options?.templateId || 'default-html';
    const template = await this.templateService.getTemplate(templateId);
    
    // 准备模板数据
    const templateData = this.prepareTemplateData(feedbackData, options);
    
    // 渲染模板
    return this.templateService.renderTemplate(template, templateData);
  }

  private prepareTemplateData(feedbackData: FeedbackData, options?: FeedbackFormattingOptions): any {
    // 准备模板数据，类似 Markdown 格式化器，但包含 HTML 特定的样式和结构
    const data = {
      title: '认知反馈报告',
      timestamp: new Date().toLocaleString(),
      sections: this.determineIncludedSections(feedbackData),
      insights: feedbackData.insights?.slice(0, options?.maxItemsPerSection || 10) || [],
      themes: feedbackData.themes?.slice(0, options?.maxItemsPerSection || 10) || [],
      blindspots: feedbackData.blindspots?.slice(0, options?.maxItemsPerSection || 10) || [],
      gaps: feedbackData.gaps?.slice(0, options?.maxItemsPerSection || 10) || [],
      metadata: options?.includeMetadata ? feedbackData.metadata : undefined,
      includeTimestamp: options?.includeTimestamp !== false,
      customStyles: options?.customStyles || {}
    };
    
    // 添加摘要
    data.summary = this.generateSummary(feedbackData);
    
    return data;
  }

  private determineIncludedSections(feedbackData: FeedbackData): string[] {
    // 确定包含的章节，与 Markdown 格式化器相同
    const sections: string[] = [];
    
    if (feedbackData.insights && feedbackData.insights.length > 0) {
      sections.push('insights');
    }
    
    if (feedbackData.themes && feedbackData.themes.length > 0) {
      sections.push('themes');
    }
    
    if (feedbackData.blindspots && feedbackData.blindspots.length > 0) {
      sections.push('blindspots');
    }
    
    if (feedbackData.gaps && feedbackData.gaps.length > 0) {
      sections.push('gaps');
    }
    
    sections.push('summary');
    
    return sections;
  }

  private generateSummary(feedbackData: FeedbackData): string {
    // 生成反馈摘要，与 Markdown 格式化器相同
    const summaryParts: string[] = [];
    
    if (feedbackData.insights && feedbackData.insights.length > 0) {
      summaryParts.push(`识别到 ${feedbackData.insights.length} 个认知洞察`);
    }
    
    if (feedbackData.themes && feedbackData.themes.length > 0) {
      summaryParts.push(`分析出 ${feedbackData.themes.length} 个核心主题`);
    }
    
    if (feedbackData.blindspots && feedbackData.blindspots.length > 0) {
      summaryParts.push(`检测到 ${feedbackData.blindspots.length} 个思维盲点`);
    }
    
    if (feedbackData.gaps && feedbackData.gaps.length > 0) {
      summaryParts.push(`发现 ${feedbackData.gaps.length} 个概念空洞`);
    }
    
    return summaryParts.join('，') + '。';
  }
}
```

### 5.4 PlainTextFeedbackFormatter
```typescript
/**
 * 纯文本格式反馈格式化器
 */
export class PlainTextFeedbackFormatter implements FeedbackFormatter {
  getSupportedFormat(): FeedbackFormat {
    return FeedbackFormat.PLAIN_TEXT;
  }

  async format(feedbackData: FeedbackData, options?: FeedbackFormattingOptions): Promise<string> {
    let content = '';
    
    // 添加标题
    content += '认知反馈报告\n';
    content += '='.repeat(20) + '\n\n';
    
    // 添加时间戳
    if (options?.includeTimestamp !== false) {
      content += `生成时间: ${new Date().toLocaleString()}\n\n`;
    }
    
    // 添加摘要
    content += '【摘要】\n';
    content += this.generateSummary(feedbackData) + '\n\n';
    
    // 添加认知洞察
    if (feedbackData.insights && feedbackData.insights.length > 0) {
      content += '【认知洞察】\n';
      const insightsToInclude = feedbackData.insights.slice(0, options?.maxItemsPerSection || 10);
      for (let i = 0; i < insightsToInclude.length; i++) {
        const insight = insightsToInclude[i];
        content += `${i + 1}. ${insight.title}\n`;
        content += `   ${insight.description}\n\n`;
      }
    }
    
    // 添加主题分析
    if (feedbackData.themes && feedbackData.themes.length > 0) {
      content += '【核心主题】\n';
      const themesToInclude = feedbackData.themes.slice(0, options?.maxItemsPerSection || 10);
      for (let i = 0; i < themesToInclude.length; i++) {
        const theme = themesToInclude[i];
        content += `${i + 1}. ${theme.name} (权重: ${theme.weight})\n`;
        content += `   ${theme.description || '无描述'}\n\n`;
      }
    }
    
    // 添加思维盲点
    if (feedbackData.blindspots && feedbackData.blindspots.length > 0) {
      content += '【思维盲点】\n';
      const blindspotsToInclude = feedbackData.blindspots.slice(0, options?.maxItemsPerSection || 10);
      for (let i = 0; i < blindspotsToInclude.length; i++) {
        const blindspot = blindspotsToInclude[i];
        content += `${i + 1}. ${blindspot.title}\n`;
        content += `   ${blindspot.description}\n\n`;
      }
    }
    
    // 添加概念空洞
    if (feedbackData.gaps && feedbackData.gaps.length > 0) {
      content += '【概念空洞】\n';
      const gapsToInclude = feedbackData.gaps.slice(0, options?.maxItemsPerSection || 10);
      for (let i = 0; i < gapsToInclude.length; i++) {
        const gap = gapsToInclude[i];
        content += `${i + 1}. ${gap.title}\n`;
        content += `   ${gap.description}\n\n`;
      }
    }
    
    // 添加页脚
    content += '='.repeat(20) + '\n';
    content += '认知反馈系统生成';
    
    return content;
  }

  private generateSummary(feedbackData: FeedbackData): string {
    const summaryParts: string[] = [];
    
    if (feedbackData.insights && feedbackData.insights.length > 0) {
      summaryParts.push(`识别到 ${feedbackData.insights.length} 个认知洞察`);
    }
    
    if (feedbackData.themes && feedbackData.themes.length > 0) {
      summaryParts.push(`分析出 ${feedbackData.themes.length} 个核心主题`);
    }
    
    if (feedbackData.blindspots && feedbackData.blindspots.length > 0) {
      summaryParts.push(`检测到 ${feedbackData.blindspots.length} 个思维盲点`);
    }
    
    if (feedbackData.gaps && feedbackData.gaps.length > 0) {
      summaryParts.push(`发现 ${feedbackData.gaps.length} 个概念空洞`);
    }
    
    return summaryParts.join('，') + '。';
  }
}
```

### 5.5 JsonFeedbackFormatter
```typescript
/**
 * JSON 格式反馈格式化器
 */
export class JsonFeedbackFormatter implements FeedbackFormatter {
  getSupportedFormat(): FeedbackFormat {
    return FeedbackFormat.JSON;
  }

  async format(feedbackData: FeedbackData, options?: FeedbackFormattingOptions): Promise<string> {
    // 准备 JSON 数据
    const jsonData = {
      title: '认知反馈报告',
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(feedbackData),
      sections: this.determineIncludedSections(feedbackData),
      data: {
        insights: feedbackData.insights?.slice(0, options?.maxItemsPerSection || 10) || [],
        themes: feedbackData.themes?.slice(0, options?.maxItemsPerSection || 10) || [],
        blindspots: feedbackData.blindspots?.slice(0, options?.maxItemsPerSection || 10) || [],
        gaps: feedbackData.gaps?.slice(0, options?.maxItemsPerSection || 10) || []
      },
      metadata: options?.includeMetadata ? feedbackData.metadata : undefined,
      formattingOptions: options
    };
    
    // 转换为 JSON 字符串
    return JSON.stringify(jsonData, null, 2);
  }

  private determineIncludedSections(feedbackData: FeedbackData): string[] {
    const sections: string[] = [];
    
    if (feedbackData.insights && feedbackData.insights.length > 0) {
      sections.push('insights');
    }
    
    if (feedbackData.themes && feedbackData.themes.length > 0) {
      sections.push('themes');
    }
    
    if (feedbackData.blindspots && feedbackData.blindspots.length > 0) {
      sections.push('blindspots');
    }
    
    if (feedbackData.gaps && feedbackData.gaps.length > 0) {
      sections.push('gaps');
    }
    
    return sections;
  }

  private generateSummary(feedbackData: FeedbackData): string {
    const summaryParts: string[] = [];
    
    if (feedbackData.insights && feedbackData.insights.length > 0) {
      summaryParts.push(`识别到 ${feedbackData.insights.length} 个认知洞察`);
    }
    
    if (feedbackData.themes && feedbackData.themes.length > 0) {
      summaryParts.push(`分析出 ${feedbackData.themes.length} 个核心主题`);
    }
    
    if (feedbackData.blindspots && feedbackData.blindspots.length > 0) {
      summaryParts.push(`检测到 ${feedbackData.blindspots.length} 个思维盲点`);
    }
    
    if (feedbackData.gaps && feedbackData.gaps.length > 0) {
      summaryParts.push(`发现 ${feedbackData.gaps.length} 个概念空洞`);
    }
    
    return summaryParts.join('，') + '。';
  }
}
```

### 5.6 AIFeedbackFormatter
```typescript
/**
 * AI 辅助反馈格式化器
 */
export class AIFeedbackFormatter implements FeedbackFormatter {
  private readonly openaiService: OpenAIService;

  constructor(openaiService: OpenAIService) {
    this.openaiService = openaiService;
  }

  getSupportedFormat(): FeedbackFormat {
    return FeedbackFormat.AI_GENERATED;
  }

  async format(feedbackData: FeedbackData, options?: FeedbackFormattingOptions): Promise<string> {
    // 准备反馈数据摘要
    const feedbackSummary = this.prepareFeedbackSummary(feedbackData);
    
    // 构建 AI 提示词
    const prompt = this.buildAIPrompt(feedbackSummary, options);
    
    // 调用 OpenAI API 生成反馈
    const aiResponse = await this.openaiService.complete({
      model: 'gpt-4',
      prompt: prompt,
      maxTokens: 1500,
      temperature: 0.7
    });
    
    return aiResponse;
  }

  private prepareFeedbackSummary(feedbackData: FeedbackData): string {
    let summary = '认知反馈数据摘要：\n\n';
    
    // 添加认知洞察摘要
    if (feedbackData.insights && feedbackData.insights.length > 0) {
      summary += '【认知洞察】\n';
      for (const insight of feedbackData.insights) {
        summary += `- ${insight.title}: ${insight.description}\n`;
      }
      summary += '\n';
    }
    
    // 添加主题分析摘要
    if (feedbackData.themes && feedbackData.themes.length > 0) {
      summary += '【核心主题】\n';
      for (const theme of feedbackData.themes) {
        summary += `- ${theme.name} (权重: ${theme.weight}): ${theme.description || '无描述'}\n`;
      }
      summary += '\n';
    }
    
    // 添加思维盲点摘要
    if (feedbackData.blindspots && feedbackData.blindspots.length > 0) {
      summary += '【思维盲点】\n';
      for (const blindspot of feedbackData.blindspots) {
        summary += `- ${blindspot.title}: ${blindspot.description}\n`;
      }
      summary += '\n';
    }
    
    // 添加概念空洞摘要
    if (feedbackData.gaps && feedbackData.gaps.length > 0) {
      summary += '【概念空洞】\n';
      for (const gap of feedbackData.gaps) {
        summary += `- ${gap.title}: ${gap.description}\n`;
      }
      summary += '\n';
    }
    
    return summary;
  }

  private buildAIPrompt(feedbackSummary: string, options?: FeedbackFormattingOptions): string {
    return `
您是一位认知科学专家，请根据以下认知反馈数据摘要，生成一份友好、有洞察力的认知反馈报告：\n\n${feedbackSummary}\n\n请按照以下要求生成报告：\n1. 报告要友好、专业，易于理解\n2. 突出重点，不要过于冗长\n3. 提供具体的改进建议\n4. 使用自然流畅的语言\n5. 结构清晰，包含摘要、主要发现和改进建议\n6. 针对每个问题提供具体的行动建议\n`;
  }
}
```

## 6. 错误处理

### 6.1 异常类型
```typescript
/**
 * 反馈格式化异常
 */
export class FeedbackFormattingError extends ApplicationError {
  constructor(message: string, cause?: Error) {
    super(message, 'FEEDBACK_FORMATTING_ERROR', cause);
  }
}

/**
 * 反馈格式化器异常
 */
export class FeedbackFormatterError extends ApplicationError {
  constructor(formatterType: FeedbackFormat, message: string, cause?: Error) {
    super(`${formatterType} formatter failed: ${message}`, 'FEEDBACK_FORMATTER_ERROR', cause);
  }
}

/**
 * AI 反馈格式化异常
 */
export class AIFeedbackFormattingError extends ApplicationError {
  constructor(message: string, cause?: Error) {
    super(`AI feedback formatting failed: ${message}`, 'AI_FEEDBACK_FORMATTING_ERROR', cause);
  }
}

/**
 * 模板服务异常
 */
export class TemplateServiceError extends ApplicationError {
  constructor(message: string, cause?: Error) {
    super(`Template service failed: ${message}`, 'TEMPLATE_SERVICE_ERROR', cause);
  }
}
```

### 6.2 错误处理策略

| 错误类型 | 处理策略 | 重试机制 | 日志级别 |
|----------|----------|----------|----------|
| FeedbackFormattingError | 返回500错误，记录详细日志 | 否 | ERROR |
| FeedbackFormatterError | 回退到默认格式化器，记录警告日志 | 否 | WARN |
| AIFeedbackFormattingError | 回退到 Markdown 格式化器，记录警告日志 | 是（最多3次） | WARN |
| TemplateServiceError | 使用默认模板，记录警告日志 | 否 | WARN |
| 数据库连接错误 | 重试连接，返回503错误 | 是（最多5次，指数退避） | ERROR |
| 缓存服务错误 | 跳过缓存，继续执行 | 否 | INFO |

## 7. 性能优化

### 7.1 缓存策略
- 格式化反馈结果缓存1小时，减少重复计算
- 使用 Redis 或内存缓存存储热点反馈
- 支持手动刷新缓存
- 缓存模板，减少模板加载时间

### 7.2 并行处理
- 多种格式反馈并行生成
- 批量处理数据库操作
- AI 调用异步执行，不阻塞主线程

### 7.3 资源限制
- 限制 AI 调用频率和并发数
- 限制单个反馈的大小和复杂度
- 对大数据集进行分页处理

### 7.4 模板优化
- 预编译模板，提高渲染速度
- 优化模板结构，减少渲染时间
- 支持模板缓存，减少模板加载时间

## 8. 测试策略

### 8.1 单元测试
- 测试每个反馈格式化器的核心逻辑
- 测试模板渲染功能
- 测试错误处理
- 测试各种边界情况

### 8.2 集成测试
- 测试反馈格式化服务与其他服务的集成
- 测试 AI 辅助反馈格式化流程
- 测试反馈存储和检索
- 测试反馈格式化配置更新

### 8.3 端到端测试
- 测试完整的反馈格式化流程
- 测试不同格式的反馈生成
- 测试性能和响应时间
- 测试反馈内容的准确性和可读性

### 8.4 测试工具
- Jest: 单元测试和集成测试
- Supertest: API 测试
- MockServiceWorker: 模拟外部服务
- LoadTest: 性能测试
- 人工评估: 反馈内容的可读性和有效性评估

## 9. 部署与监控

### 9.1 部署策略
- 容器化部署（Docker）
- 支持水平扩展
- 配置化的资源分配
- 支持蓝绿部署和滚动更新

### 9.2 监控指标
- 反馈格式化成功率
- 反馈格式化平均时间
- 每个格式化器的使用频率
- 缓存命中率
- AI 调用成功率和响应时间
- 错误率和错误类型分布
- 反馈内容的用户满意度（通过反馈收集）

### 9.3 日志记录
- 结构化日志，包含反馈格式化类型、用户ID、生成时间等
- 支持日志级别配置
- 日志集中存储和分析
- 记录反馈格式化的关键指标

## 10. 扩展与演进

### 10.1 新增反馈格式化器
- 实现 FeedbackFormatter 接口
- 在 FeedbackFormattingServiceImpl 中注册
- 配置格式化器优先级和资源分配

### 10.2 AI 模型升级
- 支持多 AI 模型切换
- 实现 AI 模型评估机制
- 支持模型版本管理
- 实现模型微调功能，提高反馈质量

### 10.3 反馈格式扩展
- 在 FeedbackFormat 枚举中添加新格式
- 实现对应的格式化器
- 更新前端展示逻辑

### 10.4 个性化反馈
- 基于用户反馈调整反馈格式化策略
- 学习用户偏好的反馈格式和风格
- 支持用户自定义反馈模板

### 10.5 多语言支持
- 扩展反馈格式化器，支持多语言反馈
- 集成多语言模板
- 支持跨语言反馈生成

## 11. 代码结构

```
src/
├── application/
│   ├── services/
│   │   ├── feedback-formatting/
│   │   │   ├── FeedbackFormattingService.ts
│   │   │   ├── FeedbackFormattingServiceImpl.ts
│   │   │   ├── formatters/
│   │   │   │   ├── FeedbackFormatter.ts
│   │   │   │   ├── MarkdownFeedbackFormatter.ts
│   │   │   │   ├── HtmlFeedbackFormatter.ts
│   │   │   │   ├── PlainTextFeedbackFormatter.ts
│   │   │   │   ├── JsonFeedbackFormatter.ts
│   │   │   │   └── AIFeedbackFormatter.ts
│   │   │   └── FeedbackFormattingUseCase.ts
│   │   └── TemplateService.ts
│   └── dtos/
│       └── feedback-formatting/
│           ├── FeedbackFormattingOptions.ts
│           ├── FeedbackFilters.ts
│           └── FeedbackFormattingConfig.ts
├── domain/
│   ├── entities/
│   │   ├── FormattedFeedback.ts
│   │   └── FeedbackTemplate.ts
│   ├── enums/
│   │   ├── FeedbackFormat.ts
│   │   └── FeedbackSection.ts
│   └── rules/
│       └── FeedbackFormattingRules.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── FeedbackRepository.ts
│   │   └── ConfigRepository.ts
│   └── services/
│       ├── CacheService.ts
│       └── TemplateServiceImpl.ts
├── ai/
│   └── services/
│       ├── AIFeedbackFormatter.ts
│       └── OpenAIService.ts
└── presentation/
    └── controllers/
        └── FeedbackFormattingController.ts
```

## 12. 总结

反馈格式化模块是认知反馈系统的重要组成部分，负责将系统生成的各种认知结果格式化为用户友好的反馈形式。该模块采用了插件化设计，支持多种反馈格式，包括 Markdown、HTML、纯文本、JSON 和 AI 生成格式。

该实现严格遵循了 Clean Architecture 原则，实现了核心业务逻辑与 AI 能力的解耦，确保了系统的可维护性和可扩展性。通过缓存、并行处理和模板优化等策略，保证了系统的性能和响应速度。

这个技术实现文档为 AI 代码生成提供了清晰的指导，包括接口定义、数据结构、实现细节、错误处理、性能优化和测试策略等方面，确保生成的代码符合生产级质量要求。反馈格式化模块的实现将为认知反馈系统提供强大的反馈生成和格式化能力，帮助用户更好地理解和改进自己的认知结构。