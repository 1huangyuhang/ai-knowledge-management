import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { StructuredOutputGeneratorImpl } from '../../../src/infrastructure/ai/structured/StructuredOutputGeneratorImpl';
import { StructuredOutputFormat, StructuredOutputGenerationOptions } from '../../../src/application/services/llm/structured/StructuredOutputGenerator';
import { LLMClient } from '../../../src/application/services/llm/LLMClient';
import { LoggerService } from '../../../src/infrastructure/logging/logger.service';
import { ErrorHandler } from '../../../src/infrastructure/error/error-handler';

// Mock dependencies
const mockLLMClient: jest.Mocked<LLMClient> = {
  generateText: jest.fn(),
  generateChatCompletion: jest.fn()
};

const mockLoggerService: jest.Mocked<LoggerService> = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  fatal: jest.fn(),
  log: jest.fn()
};

const mockErrorHandler: jest.Mocked<ErrorHandler> = {
  handle: jest.fn(),
  formatError: jest.fn()
};

describe('StructuredOutputGeneratorImpl', () => {
  let structuredOutputGenerator: StructuredOutputGeneratorImpl;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create new instance for each test
    structuredOutputGenerator = new StructuredOutputGeneratorImpl(
      mockLLMClient,
      mockLoggerService,
      mockErrorHandler
    );
  });

  describe('generate', () => {
    it('should generate valid JSON output', async () => {
      // Arrange
      const prompt = 'Tell me about JavaScript';
      const expectedOutput = JSON.stringify({ name: 'JavaScript', type: 'programming language', popularity: 'high' });
      mockLLMClient.generateText.mockResolvedValue(`\`\`\`json\n${expectedOutput}\n\`\`\``);
      
      const options: StructuredOutputGenerationOptions = {
        format: StructuredOutputFormat.JSON
      };

      // Act
      const result = await structuredOutputGenerator.generate(prompt, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.rawOutput).toBe(`\`\`\`json\n${expectedOutput}\n\`\`\``);
      expect(result.parsedOutput).toEqual(JSON.parse(expectedOutput));
      expect(result.format).toBe(StructuredOutputFormat.JSON);
      expect(result.validationResult.isValid).toBe(true);
      expect(result.retryCount).toBe(0);
      expect(mockLLMClient.generateText).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid output and retry', async () => {
      // Arrange
      const prompt = 'Tell me about JavaScript';
      const invalidOutput = 'Invalid JSON output';
      const validOutput = JSON.stringify({ name: 'JavaScript', type: 'programming language' });
      
      // Mock LLM to return invalid output first, then valid output
      mockLLMClient.generateText
        .mockResolvedValueOnce(invalidOutput)
        .mockResolvedValueOnce(`\`\`\`json\n${validOutput}\n\`\`\``);
      
      const options: StructuredOutputGenerationOptions = {
        format: StructuredOutputFormat.JSON,
        maxRetries: 2
      };

      // Act
      const result = await structuredOutputGenerator.generate(prompt, options);

      // Assert
      expect(result).toBeDefined();
      expect(result.parsedOutput).toEqual(JSON.parse(validOutput));
      expect(result.retryCount).toBe(1);
      expect(mockLLMClient.generateText).toHaveBeenCalledTimes(2);
    });

    it('should throw error after maximum retries', async () => {
      // Arrange
      const prompt = 'Tell me about JavaScript';
      const invalidOutput = 'Invalid JSON output';
      
      // Mock LLM to always return invalid output
      mockLLMClient.generateText.mockResolvedValue(invalidOutput);
      
      const options: StructuredOutputGenerationOptions = {
        format: StructuredOutputFormat.JSON,
        maxRetries: 2
      };

      // Act & Assert
      await expect(structuredOutputGenerator.generate(prompt, options)).rejects.toThrow();
      expect(mockLLMClient.generateText).toHaveBeenCalledTimes(3); // Initial attempt + 2 retries
    });
  });

  describe('validate', () => {
    it('should validate valid JSON output', async () => {
      // Arrange
      const validJson = JSON.stringify({ name: 'Test', value: 123 });

      // Act
      const result = await structuredOutputGenerator.validate(validJson, StructuredOutputFormat.JSON);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.parsedOutput).toEqual({ name: 'Test', value: 123 });
      expect(result.errors).toBeUndefined();
    });

    it('should invalidate invalid JSON output', async () => {
      // Arrange
      const invalidJson = '{ invalid json }';

      // Act
      const result = await structuredOutputGenerator.validate(invalidJson, StructuredOutputFormat.JSON);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.parsedOutput).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe('parse', () => {
    it('should parse valid JSON output', async () => {
      // Arrange
      const validJson = JSON.stringify({ name: 'Test', value: 123 });

      // Act
      const result = await structuredOutputGenerator.parse(validJson, StructuredOutputFormat.JSON);

      // Assert
      expect(result).toEqual({ name: 'Test', value: 123 });
    });

    it('should parse CSV output', async () => {
      // Arrange
      const csvData = 'name,value\nTest,123\nAnother,456';

      // Act
      const result = await structuredOutputGenerator.parse(csvData, StructuredOutputFormat.CSV);

      // Assert
      expect(result).toEqual([
        { name: 'Test', value: '123' },
        { name: 'Another', value: '456' }
      ]);
    });

    it('should clean and parse formatted JSON', async () => {
      // Arrange
      const formattedJson = '```json\n{ "name": "Test" }\n```';

      // Act
      const result = await structuredOutputGenerator.parse(formattedJson, StructuredOutputFormat.JSON);

      // Assert
      expect(result).toEqual({ name: 'Test' });
    });
  });

  describe('generateStructuredPrompt', () => {
    it('should generate JSON structured prompt', () => {
      // Arrange
      const prompt = 'Tell me about JavaScript';
      const schema = { type: 'object', properties: { name: { type: 'string' } } };

      // Act
      const result = structuredOutputGenerator.generateStructuredPrompt(prompt, StructuredOutputFormat.JSON, schema);

      // Assert
      expect(result).toContain(prompt);
      expect(result).toContain('Please output your response in valid JSON format');
      expect(result).toContain(JSON.stringify(schema, null, 2));
      expect(result).toContain('Please ensure your output contains ONLY the structured data');
    });

    it('should generate XML structured prompt', () => {
      // Arrange
      const prompt = 'Tell me about JavaScript';

      // Act
      const result = structuredOutputGenerator.generateStructuredPrompt(prompt, StructuredOutputFormat.XML);

      // Assert
      expect(result).toContain(prompt);
      expect(result).toContain('Please output your response in valid XML format');
    });
  });
});
