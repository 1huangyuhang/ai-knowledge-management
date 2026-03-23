/**
 * 结构化输出格式类型
 */
export enum StructuredOutputFormat {
  JSON = 'json',
  XML = 'xml',
  YAML = 'yaml',
  CSV = 'csv',
}

/**
 * 结构化输出验证选项
 */
export interface StructuredOutputValidationOptions {
  /**
   * 是否严格验证格式
   */
  strict?: boolean;
  /**
   * 预期的输出结构（JSON Schema、XML Schema等）
   */
  schema?: any;
  /**
   * 允许的额外字段
   */
  allowAdditionalFields?: boolean;
}

/**
 * 结构化输出生成选项
 */
export interface StructuredOutputGenerationOptions {
  /**
   * 输出格式
   */
  format: StructuredOutputFormat;
  /**
   * 验证选项
   */
  validationOptions?: StructuredOutputValidationOptions;
  /**
   * 输出模板，用于指导LLM生成特定格式的输出
   */
  outputTemplate?: string;
  /**
   * 最大重试次数
   */
  maxRetries?: number;
}

/**
 * 结构化输出结果
 */
export interface StructuredOutputResult<T = any> {
  /**
   * 原始输出文本
   */
  rawOutput: string;
  /**
   * 解析后的结构化数据
   */
  parsedOutput: T;
  /**
   * 输出格式
   */
  format: StructuredOutputFormat;
  /**
   * 验证结果
   */
  validationResult: {
    /**
     * 是否验证通过
     */
    isValid: boolean;
    /**
     * 验证错误信息
     */
    errors?: string[];
  };
  /**
   * 重试次数
   */
  retryCount: number;
}

/**
 * 结构化输出生成器接口
 */
export interface StructuredOutputGenerator {
  /**
   * 生成结构化输出
   * @param prompt 提示词
   * @param options 生成选项
   * @returns 结构化输出结果
   */
  generate<T = any>(
    prompt: string,
    options: StructuredOutputGenerationOptions
  ): Promise<StructuredOutputResult<T>>;

  /**
   * 验证结构化输出
   * @param output 要验证的输出
   * @param format 预期格式
   * @param options 验证选项
   * @returns 验证结果
   */
  validate<T = any>(
    output: string,
    format: StructuredOutputFormat,
    options?: StructuredOutputValidationOptions
  ): Promise<{
    isValid: boolean;
    parsedOutput?: T;
    errors?: string[];
  }>;

  /**
   * 解析结构化输出
   * @param output 要解析的输出
   * @param format 输出格式
   * @returns 解析结果
   */
  parse<T = any>(
    output: string,
    format: StructuredOutputFormat
  ): Promise<T>;

  /**
   * 生成结构化输出的提示模板
   * @param prompt 原始提示词
   * @param format 输出格式
   * @param schema 预期结构（可选）
   * @returns 增强后的提示词，包含结构化输出指导
   */
  generateStructuredPrompt(
    prompt: string,
    format: StructuredOutputFormat,
    schema?: any
  ): string;
}
