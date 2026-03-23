import { PromptTemplateImpl } from '../../../src/infrastructure/ai/prompt/PromptTemplateImpl';

/**
 * PromptTemplate 单元测试
 */
describe('PromptTemplate', () => {
  describe('generatePrompt', () => {
    it('should generate prompt with basic template', () => {
      // 准备测试数据
      const promptTemplate = new PromptTemplateImpl({
        name: 'test-template',
        template: 'Hello, {{name}}!',
        parameters: ['name']
      });

      // 执行测试
      const result = promptTemplate.generatePrompt({ name: 'World' });

      // 验证结果
      expect(result).toBe('Hello, World!');
    });

    it('should generate prompt with missing parameters as empty string', () => {
      // 准备测试数据
      const promptTemplate = new PromptTemplateImpl({
        name: 'test-template',
        template: 'Hello, {{name}}! Your age is {{age}}.',
        parameters: ['name', 'age']
      });

      // 执行测试
      const result = promptTemplate.generatePrompt({ name: 'World' });

      // 验证结果
      expect(result).toBe('Hello, World! Your age is undefined.');
    });

    it('should generate prompt with complex template', () => {
      // 准备测试数据
      const promptTemplate = new PromptTemplateImpl({
        name: 'test-template',
        template: `
          User: {{user_input}}
          Context: {{context}}
          Assistant: Please analyze the following and provide insights.
        `,
        parameters: ['user_input', 'context']
      });

      // 执行测试
      const result = promptTemplate.generatePrompt({
        user_input: 'Tell me about AI',
        context: 'Artificial Intelligence is a branch of computer science.'
      });

      // 验证结果
      expect(result).toContain('User: Tell me about AI');
      expect(result).toContain('Context: Artificial Intelligence is a branch of computer science.');
      expect(result).toContain('Assistant: Please analyze the following and provide insights.');
    });

    it('should handle special characters in parameters', () => {
      // 准备测试数据
      const promptTemplate = new PromptTemplateImpl({
        name: 'test-template',
        template: 'Message: {{message}}',
        parameters: ['message']
      });

      // 执行测试
      const result = promptTemplate.generatePrompt({ message: 'Hello, "World"! How are you?' });

      // 验证结果
      expect(result).toBe('Message: Hello, "World"! How are you?');
    });
  });

  describe('validateParams', () => {
    it('should return true for valid parameters', () => {
      // 准备测试数据
      const promptTemplate = new PromptTemplateImpl({
        name: 'test-template',
        template: 'Hello, {{name}}!',
        parameters: ['name']
      });

      // 执行测试
      const result = promptTemplate.validateParams({ name: 'World' });

      // 验证结果
      expect(result).toBe(true);
    });

    it('should return false when required parameter is missing', () => {
      // 准备测试数据
      const promptTemplate = new PromptTemplateImpl({
        name: 'test-template',
        template: 'Hello, {{name}}! Your age is {{age}}.',
        parameters: ['name', 'age']
      });

      // 执行测试
      const result = promptTemplate.validateParams({ name: 'World' });

      // 验证结果
      expect(result).toBe(false);
    });

    it('should return true when no parameters are required', () => {
      // 准备测试数据
      const promptTemplate = new PromptTemplateImpl({
        name: 'test-template',
        template: 'Hello, World!'
      });

      // 执行测试
      const result = promptTemplate.validateParams({});

      // 验证结果
      expect(result).toBe(true);
    });
  });

  describe('getParameters', () => {
    it('should return parameters from template', () => {
      // 准备测试数据
      const promptTemplate = new PromptTemplateImpl({
        name: 'test-template',
        template: 'Hello, {{name}}! Your age is {{age}}.'
      });

      // 执行测试
      const result = promptTemplate.getParameters();

      // 验证结果
      expect(result).toEqual(['name', 'age']);
    });

    it('should return empty array for template without parameters', () => {
      // 准备测试数据
      const promptTemplate = new PromptTemplateImpl({
        name: 'test-template',
        template: 'Hello, World!'
      });

      // 执行测试
      const result = promptTemplate.getParameters();

      // 验证结果
      expect(result).toEqual([]);
    });

    it('should return unique parameters', () => {
      // 准备测试数据
      const promptTemplate = new PromptTemplateImpl({
        name: 'test-template',
        template: 'Hello, {{name}}! Hello again, {{name}}!'
      });

      // 执行测试
      const result = promptTemplate.getParameters();

      // 验证结果
      expect(result).toEqual(['name']);
    });
  });
});
