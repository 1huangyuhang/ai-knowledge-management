"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CognitiveParserService_1 = require("../../../../application/ai/cognitive-parsing/CognitiveParserService");
class MockLLMClient {
    async generate(prompt, options) {
        return JSON.stringify({
            concepts: [],
            relations: []
        });
    }
    async generateStructuredOutput(prompt, options) {
        return {
            concepts: [
                {
                    semanticIdentity: 'Test Concept',
                    abstractionLevel: 3,
                    confidenceScore: 0.9,
                    description: 'A test concept',
                    metadata: {}
                }
            ],
            relations: []
        };
    }
}
class MockPromptGenerationService {
    generateCognitiveParsingPrompt(text) {
        return `Parse cognitive concepts from: ${text}`;
    }
    generatePrompt(templateName, data) {
        return 'Generated prompt';
    }
}
describe('CognitiveParserService', () => {
    let mockLLMClient;
    let mockPromptService;
    let cognitiveParserService;
    beforeEach(() => {
        mockLLMClient = new MockLLMClient();
        mockPromptService = new MockPromptGenerationService();
        cognitiveParserService = new CognitiveParserService_1.LLMBasedCognitiveParserService(mockLLMClient, mockPromptService);
    });
    describe('parse', () => {
        it('should return parsing result with concepts and relations', async () => {
            const text = 'Test text containing cognitive concepts';
            const modelId = 'test-model-id';
            const result = await cognitiveParserService.parse(text, modelId);
            expect(result).toHaveProperty('concepts');
            expect(result).toHaveProperty('relations');
            expect(Array.isArray(result.concepts)).toBe(true);
            expect(Array.isArray(result.relations)).toBe(true);
        });
        it('should handle empty text', async () => {
            const text = '';
            const modelId = 'test-model-id';
            const result = await cognitiveParserService.parse(text, modelId);
            expect(result).toHaveProperty('concepts');
            expect(result).toHaveProperty('relations');
            expect(result.concepts).toEqual([]);
            expect(result.relations).toEqual([]);
        });
    });
    describe('batchParse', () => {
        it('should return array of parsing results', async () => {
            const texts = ['Test text 1', 'Test text 2', 'Test text 3'];
            const modelId = 'test-model-id';
            const results = await cognitiveParserService.batchParse(texts, modelId);
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBe(texts.length);
            results.forEach(result => {
                expect(result).toHaveProperty('concepts');
                expect(result).toHaveProperty('relations');
            });
        });
        it('should handle empty texts array', async () => {
            const texts = [];
            const modelId = 'test-model-id';
            const results = await cognitiveParserService.batchParse(texts, modelId);
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBe(0);
        });
    });
});
//# sourceMappingURL=CognitiveParserService.test.js.map