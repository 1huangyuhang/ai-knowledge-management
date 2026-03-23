import { 
  StructuredOutputGenerator, 
  StructuredOutputFormat, 
  StructuredOutputGenerationOptions, 
  StructuredOutputResult, 
  StructuredOutputValidationOptions 
} from '../../../application/services/llm/structured/StructuredOutputGenerator';
import { LLMClient } from '../../../application/services/llm/LLMClient';
import { LoggerService } from '../../logging/logger.service';
import { ErrorHandler } from '../../error/error-handler';

/**
 * 结构化输出生成器实现
 */
export class StructuredOutputGeneratorImpl implements StructuredOutputGenerator {
  private readonly llmClient: LLMClient;
  private readonly logger: LoggerService;
  private readonly errorHandler: ErrorHandler;

  /**
   * 创建结构化输出生成器
   * @param llmClient LLM客户端
   * @param logger 日志系统
   * @param errorHandler 错误处理器
   */
  constructor(
    llmClient: LLMClient,
    logger: LoggerService,
    errorHandler: ErrorHandler
  ) {
    this.llmClient = llmClient;
    this.logger = logger;
    this.errorHandler = errorHandler;
  }

  /**
   * 生成结构化输出
   * @param prompt 提示词
   * @param options 生成选项
   * @returns 结构化输出结果
   */
  public async generate<T = any>(
    prompt: string,
    options: StructuredOutputGenerationOptions
  ): Promise<StructuredOutputResult<T>> {
    const maxRetries = options.maxRetries || 3;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        this.logger.info('Generating structured output', {
          format: options.format,
          attempt: retryCount + 1,
          maxRetries: maxRetries
        });

        // 生成结构化提示词
        const structuredPrompt = this.generateStructuredPrompt(
          prompt,
          options.format,
          options.validationOptions?.schema
        );

        // 调用LLM生成输出
        const rawOutput = await this.llmClient.generateText(structuredPrompt);

        // 验证输出
        const validationResult = await this.validate<T>(rawOutput, options.format, options.validationOptions);

        if (validationResult.isValid && validationResult.parsedOutput) {
          this.logger.info('Structured output generated successfully', {
            format: options.format,
            retryCount,
            outputLength: rawOutput.length
          });

          return {
            rawOutput,
            parsedOutput: validationResult.parsedOutput,
            format: options.format,
            validationResult: {
              isValid: true
            },
            retryCount
          };
        } else {
          retryCount++;
          this.logger.warn('Structured output validation failed, retrying', {
            format: options.format,
            attempt: retryCount,
            maxRetries: maxRetries,
            errors: validationResult.errors
          });

          if (retryCount > maxRetries) {
            throw new Error(`Failed to generate valid structured output after ${maxRetries} attempts: ${validationResult.errors?.join(', ')}`);
          }
        }
      } catch (error) {
        retryCount++;
        this.logger.error('Error generating structured output', {
          format: options.format,
          attempt: retryCount,
          maxRetries: maxRetries,
          error: error.message
        });

        if (retryCount > maxRetries) {
          this.errorHandler.handle(error, { context: 'structured-output-generation' });
          throw error;
        }
      }
    }

    throw new Error(`Failed to generate structured output after ${maxRetries} attempts`);
  }

  /**
   * 验证结构化输出
   * @param output 要验证的输出
   * @param format 预期格式
   * @param options 验证选项
   * @returns 验证结果
   */
  public async validate<T = any>(
    output: string,
    format: StructuredOutputFormat,
    options?: StructuredOutputValidationOptions
  ): Promise<{
    isValid: boolean;
    parsedOutput?: T;
    errors?: string[];
  }> {
    const errors: string[] = [];

    try {
      // 解析输出
      const parsedOutput = await this.parse<T>(output, format);

      // 如果有验证选项，进行额外验证
      if (options?.schema) {
        const schemaValidationResult = this.validateAgainstSchema(parsedOutput, options.schema, options);
        if (!schemaValidationResult.isValid) {
          errors.push(...schemaValidationResult.errors);
        }
      }

      if (errors.length === 0) {
        return {
          isValid: true,
          parsedOutput
        };
      } else {
        return {
          isValid: false,
          parsedOutput,
          errors
        };
      }
    } catch (error: any) {
      return {
        isValid: false,
        errors: [error.message]
      };
    }
  }

  /**
   * 解析结构化输出
   * @param output 要解析的输出
   * @param format 输出格式
   * @returns 解析结果
   */
  public async parse<T = any>(
    output: string,
    format: StructuredOutputFormat
  ): Promise<T> {
    this.logger.debug('Parsing structured output', { format });

    let parsed: any;
    let cleanedOutput = output.trim();

    // 清理输出，移除可能的标记
    cleanedOutput = this.cleanOutput(cleanedOutput, format);

    try {
      switch (format) {
        case StructuredOutputFormat.JSON:
          parsed = JSON.parse(cleanedOutput);
          break;
        case StructuredOutputFormat.XML:
          parsed = this.parseXML(cleanedOutput);
          break;
        case StructuredOutputFormat.YAML:
          parsed = this.parseYAML(cleanedOutput);
          break;
        case StructuredOutputFormat.CSV:
          parsed = this.parseCSV(cleanedOutput);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      return parsed as T;
    } catch (error: any) {
      this.logger.error('Failed to parse structured output', {
        format,
        error: error.message,
        output: cleanedOutput
      });
      throw new Error(`Failed to parse ${format} output: ${error.message}`);
    }
  }

  /**
   * 生成结构化输出的提示模板
   * @param prompt 原始提示词
   * @param format 输出格式
   * @param schema 预期结构（可选）
   * @returns 增强后的提示词，包含结构化输出指导
   */
  public generateStructuredPrompt(
    prompt: string,
    format: StructuredOutputFormat,
    schema?: any
  ): string {
    let formatInstructions = '';
    let schemaInstructions = '';

    // 根据格式生成指导
    switch (format) {
      case StructuredOutputFormat.JSON:
        formatInstructions = `
Please output your response in valid JSON format. Make sure it is properly formatted with correct syntax.`;
        if (schema) {
          schemaInstructions = `
The JSON should adhere to the following structure: ${JSON.stringify(schema, null, 2)}`;
        }
        break;
      case StructuredOutputFormat.XML:
        formatInstructions = `
Please output your response in valid XML format. Make sure it is properly formatted with correct syntax.`;
        if (schema) {
          schemaInstructions = `
The XML should adhere to the following structure: ${this.schemaToXMLSchema(schema)}`;
        }
        break;
      case StructuredOutputFormat.YAML:
        formatInstructions = `
Please output your response in valid YAML format. Make sure it is properly formatted with correct syntax.`;
        break;
      case StructuredOutputFormat.CSV:
        formatInstructions = `
Please output your response in valid CSV format. Make sure it is properly formatted with correct syntax, including headers.`;
        if (schema) {
          schemaInstructions = `
The CSV should have the following columns: ${Object.keys(schema.properties).join(', ')}`;
        }
        break;
    }

    return `${prompt}

${formatInstructions}
${schemaInstructions}

Please ensure your output contains ONLY the structured data and no additional explanations or text.`;
  }

  /**
   * 清理输出，移除可能的标记
   * @param output 原始输出
   * @param format 输出格式
   * @returns 清理后的输出
   */
  private cleanOutput(output: string, format: StructuredOutputFormat): string {
    // 移除可能的格式标记，如 ```json 或 ```xml
    let cleaned = output.trim();
    
    // 移除开头的 ``` 标记
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
      // 移除可能的格式名称
      const formatEndIndex = cleaned.indexOf('\n');
      if (formatEndIndex > 0) {
        const possibleFormat = cleaned.substring(0, formatEndIndex).trim();
        if (possibleFormat === format || possibleFormat === '') {
          cleaned = cleaned.substring(formatEndIndex + 1);
        }
      }
    }
    
    // 移除结尾的 ``` 标记
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3).trim();
    }

    // 移除可能的前缀，如 "Output:" 或 "Result:"
    cleaned = cleaned.replace(/^(Output|Result):\s*/i, '').trim();

    return cleaned;
  }

  /**
   * 根据Schema验证输出
   * @param output 要验证的输出
   * @param schema Schema定义
   * @param options 验证选项
   * @returns 验证结果
   */
  private validateAgainstSchema(
    output: any,
    schema: any,
    options?: StructuredOutputValidationOptions
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      // 使用zod进行Schema验证
      const { z } = require('zod');
      
      // 简单实现：直接使用JSON Schema进行基本验证
      // 检查必填字段是否存在
      if (schema.required) {
        for (const requiredField of schema.required) {
          if (output[requiredField] === undefined) {
            errors.push(`Missing required field: ${requiredField}`);
          }
        }
      }
      
      // 检查额外属性
      if (schema.additionalProperties === false && typeof output === 'object' && output !== null) {
        const allowedProperties = schema.properties ? Object.keys(schema.properties) : [];
        const actualProperties = Object.keys(output);
        
        for (const prop of actualProperties) {
          if (!allowedProperties.includes(prop)) {
            errors.push(`Additional property not allowed: ${prop}`);
          }
        }
      }
      
      return { isValid: errors.length === 0, errors };
    } catch (error: any) {
      // 提取验证错误
      if (error.errors) {
        error.errors.forEach((err: any) => {
          errors.push(err.message);
        });
      } else {
        errors.push(error.message);
      }
      
      return { isValid: false, errors };
    }
  }
  
  /**
   * 将JSON Schema转换为zod schema
   * @param jsonSchema JSON Schema定义
   * @returns zod schema
   */
  private jsonSchemaToZodSchema(jsonSchema: any): any {
    const { z } = require('zod');
    
    switch (jsonSchema.type) {
      case 'object':
        const shape: any = {};
        
        // 处理对象属性
        if (jsonSchema.properties) {
          for (const [key, propSchema] of Object.entries(jsonSchema.properties)) {
            shape[key] = this.jsonSchemaToZodSchema(propSchema);
          }
        }
        
        let zodObj = z.object(shape);
        
        // 处理必填字段 - 使用正确的zod API
        if (jsonSchema.required && jsonSchema.required.length > 0) {
          // 使用扩展运算符将数组转换为参数列表
          zodObj = zodObj.required(...jsonSchema.required);
        }
        
        // 处理额外属性
        if (jsonSchema.additionalProperties === false) {
          zodObj = zodObj.strict();
        }
        
        return zodObj;
        
      case 'array':
        if (!jsonSchema.items) {
          return z.array(z.any());
        }
        return z.array(this.jsonSchemaToZodSchema(jsonSchema.items));
        
      case 'string':
        return z.string();
        
      case 'number':
        let zodNum = z.number();
        
        // 处理数值范围
        if (jsonSchema.minimum !== undefined) {
          zodNum = zodNum.min(jsonSchema.minimum);
        }
        if (jsonSchema.maximum !== undefined) {
          zodNum = zodNum.max(jsonSchema.maximum);
        }
        
        return zodNum;
        
      case 'boolean':
        return z.boolean();
        
      case 'null':
        return z.null();
        
      default:
        return z.any();
    }
  }

  /**
   * 解析XML输出
   * @param output XML输出
   * @returns 解析后的对象
   */
  private parseXML(output: string): any {
    // 在实际应用中，应该使用专门的XML解析库，如 xml2js 或 fast-xml-parser
    throw new Error('XML parsing is not implemented yet');
  }

  /**
   * 解析YAML输出
   * @param output YAML输出
   * @returns 解析后的对象
   */
  private parseYAML(output: string): any {
    // 在实际应用中，应该使用专门的YAML解析库，如 js-yaml
    throw new Error('YAML parsing is not implemented yet');
  }

  /**
   * 解析CSV输出
   * @param output CSV输出
   * @returns 解析后的数组
   */
  private parseCSV(output: string): any[] {
    // 实现基本的CSV解析
    const lines = output.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(header => header.trim());
    const result: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => value.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      result.push(row);
    }

    return result;
  }

  /**
   * 将JSON Schema转换为XML Schema
   * @param schema JSON Schema
   * @returns XML Schema字符串
   */
  private schemaToXMLSchema(schema: any): string {
    // 简单实现，实际应用中应该使用专门的库
    return `<root>${JSON.stringify(schema, null, 2)}</root>`;
  }
}
