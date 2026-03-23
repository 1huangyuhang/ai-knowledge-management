"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RelationInferenceService_1 = require("../../../../application/ai/relation-inference/RelationInferenceService");
const entities_1 = require("../../../../domain/entities");
const entities_2 = require("../../../../domain/entities");
class MockLLMClient {
    async generate(prompt, options) {
        return JSON.stringify({
            relationType: 'association',
            confidenceScore: 0.85,
            description: 'Test relation'
        });
    }
    async generateStructuredOutput(prompt, options) {
        return {
            relationType: entities_2.CognitiveRelationType.ASSOCIATION,
            confidenceScore: 0.85,
            description: 'Test relation'
        };
    }
}
class MockSimilaritySearchService {
    async searchByEmbedding(embedding, limit) {
        return [];
    }
    async searchByContent(content, limit) {
        return [];
    }
    async batchSearch(embeddings, limit) {
        return [];
    }
}
describe('RelationInferenceService', () => {
    let mockLLMClient;
    let mockSimilarityService;
    let relationInferenceService;
    let testConcept1;
    let testConcept2;
    beforeEach(() => {
        mockLLMClient = new MockLLMClient();
        mockSimilarityService = new MockSimilaritySearchService();
        relationInferenceService = new RelationInferenceService_1.LLMBasedRelationInferenceService(mockLLMClient, mockSimilarityService);
        testConcept1 = new entities_1.CognitiveConceptImpl('test-concept-1', 'test-model-id', 'Test Concept 1', 3, 0.9, 'First test concept');
        testConcept2 = new entities_1.CognitiveConceptImpl('test-concept-2', 'test-model-id', 'Test Concept 2', 3, 0.85, 'Second test concept');
    });
    describe('inferRelation', () => {
        it('should return relation inference result', async () => {
            const result = await relationInferenceService.inferRelation({
                sourceConcept: testConcept1,
                targetConcept: testConcept2
            });
            expect(result).toHaveProperty('relationType');
            expect(result).toHaveProperty('confidenceScore');
            expect(result).toHaveProperty('description');
            expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
            expect(result.confidenceScore).toBeLessThanOrEqual(1);
        });
        it('should handle context parameter', async () => {
            const result = await relationInferenceService.inferRelation({
                sourceConcept: testConcept1,
                targetConcept: testConcept2,
                context: 'Test context'
            });
            expect(result).toHaveProperty('relationType');
            expect(result).toHaveProperty('confidenceScore');
            expect(result).toHaveProperty('description');
        });
    });
    describe('batchInferRelations', () => {
        it('should return array of relation inference results', async () => {
            const requests = [
                {
                    sourceConcept: testConcept1,
                    targetConcept: testConcept2
                },
                {
                    sourceConcept: testConcept2,
                    targetConcept: testConcept1
                }
            ];
            const results = await relationInferenceService.batchInferRelations(requests);
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBe(requests.length);
            results.forEach(result => {
                expect(result).toHaveProperty('relationType');
                expect(result).toHaveProperty('confidenceScore');
                expect(result).toHaveProperty('description');
            });
        });
        it('should handle empty requests array', async () => {
            const results = await relationInferenceService.batchInferRelations([]);
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBe(0);
        });
    });
    describe('inferConceptRelations', () => {
        it('should return array of cognitive relations', async () => {
            const existingConcepts = [testConcept2];
            const results = await relationInferenceService.inferConceptRelations(testConcept1, existingConcepts);
            expect(Array.isArray(results)).toBe(true);
        });
        it('should handle empty existing concepts array', async () => {
            const results = await relationInferenceService.inferConceptRelations(testConcept1, []);
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBe(0);
        });
    });
});
//# sourceMappingURL=RelationInferenceService.test.js.map