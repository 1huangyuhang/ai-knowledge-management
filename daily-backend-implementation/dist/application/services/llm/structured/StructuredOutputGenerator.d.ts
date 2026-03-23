export declare enum StructuredOutputFormat {
    JSON = "json",
    XML = "xml",
    YAML = "yaml",
    CSV = "csv"
}
export interface StructuredOutputValidationOptions {
    strict?: boolean;
    schema?: any;
    allowAdditionalFields?: boolean;
}
export interface StructuredOutputGenerationOptions {
    format: StructuredOutputFormat;
    validationOptions?: StructuredOutputValidationOptions;
    outputTemplate?: string;
    maxRetries?: number;
}
export interface StructuredOutputResult<T = any> {
    rawOutput: string;
    parsedOutput: T;
    format: StructuredOutputFormat;
    validationResult: {
        isValid: boolean;
        errors?: string[];
    };
    retryCount: number;
}
export interface StructuredOutputGenerator {
    generate<T = any>(prompt: string, options: StructuredOutputGenerationOptions): Promise<StructuredOutputResult<T>>;
    validate<T = any>(output: string, format: StructuredOutputFormat, options?: StructuredOutputValidationOptions): Promise<{
        isValid: boolean;
        parsedOutput?: T;
        errors?: string[];
    }>;
    parse<T = any>(output: string, format: StructuredOutputFormat): Promise<T>;
    generateStructuredPrompt(prompt: string, format: StructuredOutputFormat, schema?: any): string;
}
//# sourceMappingURL=StructuredOutputGenerator.d.ts.map