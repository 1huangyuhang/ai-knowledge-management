"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredOutputGeneratorImpl = void 0;
const StructuredOutputGenerator_1 = require("../../../application/services/llm/structured/StructuredOutputGenerator");
class StructuredOutputGeneratorImpl {
    llmClient;
    logger;
    errorHandler;
    constructor(llmClient, logger, errorHandler) {
        this.llmClient = llmClient;
        this.logger = logger;
        this.errorHandler = errorHandler;
    }
    async generate(prompt, options) {
        const maxRetries = options.maxRetries || 3;
        let retryCount = 0;
        while (retryCount <= maxRetries) {
            try {
                this.logger.info('Generating structured output', {
                    format: options.format,
                    attempt: retryCount + 1,
                    maxRetries: maxRetries
                });
                const structuredPrompt = this.generateStructuredPrompt(prompt, options.format, options.validationOptions?.schema);
                const rawOutput = await this.llmClient.generateText(structuredPrompt);
                const validationResult = await this.validate(rawOutput, options.format, options.validationOptions);
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
                }
                else {
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
            }
            catch (error) {
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
    async validate(output, format, options) {
        const errors = [];
        try {
            const parsedOutput = await this.parse(output, format);
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
            }
            else {
                return {
                    isValid: false,
                    parsedOutput,
                    errors
                };
            }
        }
        catch (error) {
            return {
                isValid: false,
                errors: [error.message]
            };
        }
    }
    async parse(output, format) {
        this.logger.debug('Parsing structured output', { format });
        let parsed;
        let cleanedOutput = output.trim();
        cleanedOutput = this.cleanOutput(cleanedOutput, format);
        try {
            switch (format) {
                case StructuredOutputGenerator_1.StructuredOutputFormat.JSON:
                    parsed = JSON.parse(cleanedOutput);
                    break;
                case StructuredOutputGenerator_1.StructuredOutputFormat.XML:
                    parsed = this.parseXML(cleanedOutput);
                    break;
                case StructuredOutputGenerator_1.StructuredOutputFormat.YAML:
                    parsed = this.parseYAML(cleanedOutput);
                    break;
                case StructuredOutputGenerator_1.StructuredOutputFormat.CSV:
                    parsed = this.parseCSV(cleanedOutput);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
            return parsed;
        }
        catch (error) {
            this.logger.error('Failed to parse structured output', {
                format,
                error: error.message,
                output: cleanedOutput
            });
            throw new Error(`Failed to parse ${format} output: ${error.message}`);
        }
    }
    generateStructuredPrompt(prompt, format, schema) {
        let formatInstructions = '';
        let schemaInstructions = '';
        switch (format) {
            case StructuredOutputGenerator_1.StructuredOutputFormat.JSON:
                formatInstructions = `
Please output your response in valid JSON format. Make sure it is properly formatted with correct syntax.`;
                if (schema) {
                    schemaInstructions = `
The JSON should adhere to the following structure: ${JSON.stringify(schema, null, 2)}`;
                }
                break;
            case StructuredOutputGenerator_1.StructuredOutputFormat.XML:
                formatInstructions = `
Please output your response in valid XML format. Make sure it is properly formatted with correct syntax.`;
                if (schema) {
                    schemaInstructions = `
The XML should adhere to the following structure: ${this.schemaToXMLSchema(schema)}`;
                }
                break;
            case StructuredOutputGenerator_1.StructuredOutputFormat.YAML:
                formatInstructions = `
Please output your response in valid YAML format. Make sure it is properly formatted with correct syntax.`;
                break;
            case StructuredOutputGenerator_1.StructuredOutputFormat.CSV:
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
    cleanOutput(output, format) {
        let cleaned = output.trim();
        if (cleaned.startsWith('```')) {
            cleaned = cleaned.substring(3);
            const formatEndIndex = cleaned.indexOf('\n');
            if (formatEndIndex > 0) {
                const possibleFormat = cleaned.substring(0, formatEndIndex).trim();
                if (possibleFormat === format || possibleFormat === '') {
                    cleaned = cleaned.substring(formatEndIndex + 1);
                }
            }
        }
        if (cleaned.endsWith('```')) {
            cleaned = cleaned.substring(0, cleaned.length - 3).trim();
        }
        cleaned = cleaned.replace(/^(Output|Result):\s*/i, '').trim();
        return cleaned;
    }
    validateAgainstSchema(output, schema, options) {
        const errors = [];
        try {
            const { z } = require('zod');
            if (schema.required) {
                for (const requiredField of schema.required) {
                    if (output[requiredField] === undefined) {
                        errors.push(`Missing required field: ${requiredField}`);
                    }
                }
            }
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
        }
        catch (error) {
            if (error.errors) {
                error.errors.forEach((err) => {
                    errors.push(err.message);
                });
            }
            else {
                errors.push(error.message);
            }
            return { isValid: false, errors };
        }
    }
    jsonSchemaToZodSchema(jsonSchema) {
        const { z } = require('zod');
        switch (jsonSchema.type) {
            case 'object':
                const shape = {};
                if (jsonSchema.properties) {
                    for (const [key, propSchema] of Object.entries(jsonSchema.properties)) {
                        shape[key] = this.jsonSchemaToZodSchema(propSchema);
                    }
                }
                let zodObj = z.object(shape);
                if (jsonSchema.required && jsonSchema.required.length > 0) {
                    zodObj = zodObj.required(...jsonSchema.required);
                }
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
    parseXML(output) {
        throw new Error('XML parsing is not implemented yet');
    }
    parseYAML(output) {
        throw new Error('YAML parsing is not implemented yet');
    }
    parseCSV(output) {
        const lines = output.split('\n').filter(line => line.trim());
        if (lines.length === 0)
            return [];
        const headers = lines[0].split(',').map(header => header.trim());
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(value => value.trim());
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            result.push(row);
        }
        return result;
    }
    schemaToXMLSchema(schema) {
        return `<root>${JSON.stringify(schema, null, 2)}</root>`;
    }
}
exports.StructuredOutputGeneratorImpl = StructuredOutputGeneratorImpl;
//# sourceMappingURL=StructuredOutputGeneratorImpl.js.map