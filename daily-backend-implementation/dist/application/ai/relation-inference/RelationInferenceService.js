"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMBasedRelationInferenceService = void 0;
const entities_1 = require("../../../domain/entities");
class LLMBasedRelationInferenceService {
    llmClient;
    similaritySearchService;
    constructor(llmClient, similaritySearchService) {
        this.llmClient = llmClient;
        this.similaritySearchService = similaritySearchService;
    }
    async inferRelation(request) {
        const { sourceConcept, targetConcept, context } = request;
        const prompt = this.generateRelationInferencePrompt(sourceConcept, targetConcept, context);
        const result = await this.llmClient.generateStructuredOutput(prompt);
        return {
            relationType: result.relationType,
            confidenceScore: result.confidenceScore,
            description: result.description
        };
    }
    async batchInferRelations(requests) {
        return Promise.all(requests.map(request => this.inferRelation(request)));
    }
    async inferConceptRelations(concept, existingConcepts, context) {
        const relations = [];
        const requests = existingConcepts.map(existingConcept => ({
            sourceConcept: concept,
            targetConcept: existingConcept,
            context
        }));
        const results = await this.batchInferRelations(requests);
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const targetConcept = existingConcepts[i];
            if (result.confidenceScore > 0.5) {
            }
        }
        return relations;
    }
    generateRelationInferencePrompt(sourceConcept, targetConcept, context) {
        let prompt = `Analyze the relationship between the following two concepts:\n\n`;
        prompt += `Concept 1: ${sourceConcept.semanticIdentity} - ${sourceConcept.description}\n`;
        prompt += `Concept 2: ${targetConcept.semanticIdentity} - ${targetConcept.description}\n\n`;
        if (context) {
            prompt += `Context: ${context}\n\n`;
        }
        prompt += `Please identify the relationship type between these two concepts. Choose from the following options:\n`;
        prompt += `${Object.values(entities_1.CognitiveRelationType).join(', ')}\n\n`;
        prompt += `Also provide a confidence score (0-1) and a brief description of the relationship.\n\n`;
        prompt += `Return your response in JSON format with the following structure:\n`;
        prompt += `{\n`;
        prompt += `  "relationType": "<relation_type>",\n`;
        prompt += `  "confidenceScore": <confidence_score>,\n`;
        prompt += `  "description": "<description>"\n`;
        prompt += `}`;
        return prompt;
    }
}
exports.LLMBasedRelationInferenceService = LLMBasedRelationInferenceService;
//# sourceMappingURL=RelationInferenceService.js.map