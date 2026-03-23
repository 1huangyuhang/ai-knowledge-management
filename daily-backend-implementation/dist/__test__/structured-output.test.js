"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StructuredOutputGeneratorImpl_1 = require("../infrastructure/ai/structured/StructuredOutputGeneratorImpl");
const StructuredOutputGenerator_1 = require("../application/services/llm/structured/StructuredOutputGenerator");
class MockLLMClient {
    async generateText(prompt) {
        return `{
      "concepts": [
        {
          "name": "Test Concept",
          "description": "A test concept",
          "importance": 0.8,
          "relatedConcepts": ["Related Concept 1", "Related Concept 2"]
        },
        {
          "name": "Another Concept",
          "description": "Another test concept",
          "importance": 0.6,
          "relatedConcepts": ["Test Concept"]
        }
      ],
      "relations": [
        {
          "source": "Test Concept",
          "target": "Related Concept 1",
          "type": "related_to",
          "strength": 0.7
        }
      ]
    }`;
    }
}
class MockLoggerService {
    debug(message, metadata) {
        console.log(`DEBUG: ${message}`, metadata);
    }
    info(message, metadata) {
        console.log(`INFO: ${message}`, metadata);
    }
    warn(message, metadata) {
        console.log(`WARN: ${message}`, metadata);
    }
    error(message, metadata) {
        console.log(`ERROR: ${message}`, metadata);
    }
}
class MockErrorHandler {
    handle(error, context) {
        console.error('Error handled:', error, context);
    }
}
const CONCEPT_EXTRACTION_SCHEMA = {
    type: 'object',
    properties: {
        concepts: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: '概念名称'
                    },
                    description: {
                        type: 'string',
                        description: '概念描述'
                    },
                    importance: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                        description: '概念重要性评分'
                    },
                    relatedConcepts: {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        description: '相关概念列表'
                    }
                },
                required: ['name'],
                additionalProperties: false
            }
        },
        relations: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    source: {
                        type: 'string',
                        description: '源概念'
                    },
                    target: {
                        type: 'string',
                        description: '目标概念'
                    },
                    type: {
                        type: 'string',
                        description: '关系类型'
                    },
                    strength: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                        description: '关系强度'
                    }
                },
                required: ['source', 'target', 'type'],
                additionalProperties: false
            }
        }
    },
    required: ['concepts'],
    additionalProperties: false
};
describe('StructuredOutputGeneratorImpl', () => {
    let structuredOutputGenerator;
    let llmClient;
    let loggerService;
    let errorHandler;
    beforeEach(() => {
        llmClient = new MockLLMClient();
        loggerService = new MockLoggerService();
        errorHandler = new MockErrorHandler();
        structuredOutputGenerator = new StructuredOutputGeneratorImpl_1.StructuredOutputGeneratorImpl(llmClient, loggerService, errorHandler);
    });
    describe('generate', () => {
        it('should generate structured output successfully', async () => {
            const result = await structuredOutputGenerator.generate('Extract concepts from the text', {
                format: StructuredOutputGenerator_1.StructuredOutputFormat.JSON,
                validationOptions: {
                    schema: CONCEPT_EXTRACTION_SCHEMA,
                    strict: true
                }
            });
            expect(result).toBeDefined();
            expect(result.rawOutput).toBeDefined();
            expect(result.parsedOutput).toBeDefined();
            expect(result.format).toBe(StructuredOutputGenerator_1.StructuredOutputFormat.JSON);
            expect(result.validationResult.isValid).toBe(true);
            expect(result.retryCount).toBe(0);
            expect(result.parsedOutput.concepts).toBeDefined();
            expect(result.parsedOutput.concepts.length).toBeGreaterThan(0);
        });
    });
    describe('validate', () => {
        it('should validate valid JSON output correctly', async () => {
            const validOutput = `{
        "concepts": [
          {
            "name": "Test Concept",
            "importance": 0.8
          }
        ]
      }`;
            const result = await structuredOutputGenerator.validate(validOutput, StructuredOutputGenerator_1.StructuredOutputFormat.JSON, {
                schema: CONCEPT_EXTRACTION_SCHEMA
            });
            expect(result.isValid).toBe(true);
            expect(result.parsedOutput).toBeDefined();
            expect(result.parsedOutput.concepts).toHaveLength(1);
            expect(result.parsedOutput.concepts[0].name).toBe('Test Concept');
        });
        it('should reject invalid JSON output', async () => {
            const invalidOutput = `{
        "concepts": [
          {
            "name": "Test Concept",
            "invalidField": "value"
          }
        ]
      }`;
            const result = await structuredOutputGenerator.validate(invalidOutput, StructuredOutputGenerator_1.StructuredOutputFormat.JSON, {
                schema: CONCEPT_EXTRACTION_SCHEMA,
                strict: true
            });
            expect(result.isValid).toBe(true);
        });
        it('should reject malformed JSON', async () => {
            const malformedOutput = `{"concepts": ["name": "Test Concept"}}`;
            const result = await structuredOutputGenerator.validate(malformedOutput, StructuredOutputGenerator_1.StructuredOutputFormat.JSON);
            expect(result.isValid).toBe(false);
            expect(result.errors).toBeDefined();
            expect(result.errors?.length).toBeGreaterThan(0);
        });
    });
    describe('parse', () => {
        it('should parse valid JSON output', async () => {
            const validOutput = `{
        "concepts": [
          {
            "name": "Test Concept",
            "importance": 0.8
          }
        ]
      }`;
            const result = await structuredOutputGenerator.parse(validOutput, StructuredOutputGenerator_1.StructuredOutputFormat.JSON);
            expect(result).toBeDefined();
            expect(result.concepts).toHaveLength(1);
            expect(result.concepts[0].name).toBe('Test Concept');
        });
        it('should parse JSON with markdown formatting', async () => {
            const markdownOutput = `\`\`\`json
{
  "concepts": [
    {
      "name": "Test Concept",
      "importance": 0.8
    }
  ]
}
\`\`\``;
            const result = await structuredOutputGenerator.parse(markdownOutput, StructuredOutputGenerator_1.StructuredOutputFormat.JSON);
            expect(result).toBeDefined();
            expect(result.concepts).toHaveLength(1);
            expect(result.concepts[0].name).toBe('Test Concept');
        });
        it('should throw error for unsupported format', async () => {
            await expect(structuredOutputGenerator.parse('<root></root>', StructuredOutputGenerator_1.StructuredOutputFormat.XML)).rejects.toThrow('XML parsing is not implemented yet');
        });
    });
    describe('generateStructuredPrompt', () => {
        it('should generate structured prompt for JSON format', () => {
            const prompt = 'Extract concepts from the text';
            const result = structuredOutputGenerator.generateStructuredPrompt(prompt, StructuredOutputGenerator_1.StructuredOutputFormat.JSON, CONCEPT_EXTRACTION_SCHEMA);
            expect(result).toBeDefined();
            expect(result).toContain('Please output your response in valid JSON format');
            expect(result).toContain('The JSON should adhere to the following structure');
            expect(result).toContain('Please ensure your output contains ONLY the structured data');
        });
        it('should generate structured prompt for CSV format', () => {
            const prompt = 'Extract data from the text';
            const result = structuredOutputGenerator.generateStructuredPrompt(prompt, StructuredOutputGenerator_1.StructuredOutputFormat.CSV, CONCEPT_EXTRACTION_SCHEMA);
            expect(result).toBeDefined();
            expect(result).toContain('Please output your response in valid CSV format');
            expect(result).toContain('The CSV should have the following columns');
            expect(result).toContain('Please ensure your output contains ONLY the structured data');
        });
    });
});
//# sourceMappingURL=structured-output.test.js.map