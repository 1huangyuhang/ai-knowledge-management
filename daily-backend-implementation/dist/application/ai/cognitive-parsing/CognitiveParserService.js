"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMBasedCognitiveParserService = void 0;
class LLMBasedCognitiveParserService {
    llmClient;
    promptService;
    constructor(llmClient, promptService) {
        this.llmClient = llmClient;
        this.promptService = promptService;
    }
    async parse(text, modelId) {
        const prompt = this.promptService.generateCognitiveParsingPrompt(text);
        const result = await this.llmClient.generateStructuredOutput(prompt);
        const concepts = [];
        const relations = [];
        return {
            concepts,
            relations
        };
    }
    async batchParse(texts, modelId) {
        return Promise.all(texts.map(text => this.parse(text, modelId)));
    }
}
exports.LLMBasedCognitiveParserService = LLMBasedCognitiveParserService;
//# sourceMappingURL=CognitiveParserService.js.map