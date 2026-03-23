import { StructuredOutputGenerator, StructuredOutputFormat, StructuredOutputGenerationOptions, StructuredOutputResult, StructuredOutputValidationOptions } from '../../../application/services/llm/structured/StructuredOutputGenerator';
import { LLMClient } from '../../../application/services/llm/LLMClient';
import { LoggerService } from '../../logging/logger.service';
import { ErrorHandler } from '../../error/error-handler';
export declare class StructuredOutputGeneratorImpl implements StructuredOutputGenerator {
    private readonly llmClient;
    private readonly logger;
    private readonly errorHandler;
    constructor(llmClient: LLMClient, logger: LoggerService, errorHandler: ErrorHandler);
    generate<T = any>(prompt: string, options: StructuredOutputGenerationOptions): Promise<StructuredOutputResult<T>>;
    validate<T = any>(output: string, format: StructuredOutputFormat, options?: StructuredOutputValidationOptions): Promise<{
        isValid: boolean;
        parsedOutput?: T;
        errors?: string[];
    }>;
    parse<T = any>(output: string, format: StructuredOutputFormat): Promise<T>;
    generateStructuredPrompt(prompt: string, format: StructuredOutputFormat, schema?: any): string;
    private cleanOutput;
    private validateAgainstSchema;
    private jsonSchemaToZodSchema;
    private parseXML;
    private parseYAML;
    private parseCSV;
    private schemaToXMLSchema;
}
//# sourceMappingURL=StructuredOutputGeneratorImpl.d.ts.map