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