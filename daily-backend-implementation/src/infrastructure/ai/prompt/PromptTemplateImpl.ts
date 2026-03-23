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

    // 替换模板中的所有参数
    for (const param of this.config.parameters) {
      const regex = new RegExp(`{{${param}}}`, 'g');
      const value = mergedParams[param] !== undefined ? String(mergedParams[param]) : 'undefined';
      prompt = prompt.replace(regex, value);
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