"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionGenerationService = void 0;
const Suggestion_1 = require("../../domain/entities/Suggestion");
const UUID_1 = require("../../domain/value-objects/UUID");
const SuggestionType_1 = require("../../domain/enums/SuggestionType");
const SuggestionCategory_1 = require("../../domain/enums/SuggestionCategory");
class SuggestionGenerationService {
    suggestionRepository;
    cognitiveModelRepository;
    cognitiveInsightRepository;
    cognitiveParserService;
    llmClientService;
    constructor(suggestionRepository, cognitiveModelRepository, cognitiveInsightRepository, cognitiveParserService, llmClientService) {
        this.suggestionRepository = suggestionRepository;
        this.cognitiveModelRepository = cognitiveModelRepository;
        this.cognitiveInsightRepository = cognitiveInsightRepository;
        this.cognitiveParserService = cognitiveParserService;
        this.llmClientService = llmClientService;
    }
    async generateSuggestions(userId, cognitiveModelId) {
        const cognitiveModel = await this.cognitiveModelRepository.getById(new UUID_1.UUID(cognitiveModelId));
        if (!cognitiveModel) {
            throw new Error(`认知模型不存在: ${cognitiveModelId}`);
        }
        const insights = await this.cognitiveInsightRepository.getByCognitiveModelId(cognitiveModelId, 1, 100);
        const suggestions = await this.generateSuggestionsFromModelAndInsights(cognitiveModel, insights, userId);
        const savedSuggestions = [];
        for (const suggestion of suggestions) {
            const savedSuggestion = await this.suggestionRepository.create(suggestion);
            savedSuggestions.push(savedSuggestion);
        }
        return savedSuggestions;
    }
    async generateSuggestionsFromModelAndInsights(cognitiveModel, insights, userId) {
        const suggestions = [];
        suggestions.push(new Suggestion_1.Suggestion(UUID_1.UUID.generate(), SuggestionType_1.SuggestionType.CONCEPT_RELATIONSHIP, '建议关联相关概念', '您的认知模型中存在一些相关概念，但它们之间缺乏明确的关联。建议您将这些概念关联起来，形成更完整的知识网络。', 8, 0.9, [cognitiveModel.concepts[0]?.id || 'concept-1'], ['查看相关概念', '创建概念关联'], SuggestionCategory_1.SuggestionCategory.STRUCTURE_OPTIMIZATION, userId, cognitiveModel.id, '基于您的认知模型结构分析', { modelVersion: cognitiveModel.version }));
        suggestions.push(new Suggestion_1.Suggestion(UUID_1.UUID.generate(), SuggestionType_1.SuggestionType.CONCEPT_EXPANSION, '建议扩展概念深度', '您的某些核心概念可以进一步扩展，添加更多相关的子概念和细节，以丰富您的认知模型。', 7, 0.85, [cognitiveModel.concepts[1]?.id || 'concept-2'], ['扩展概念', '添加子概念'], SuggestionCategory_1.SuggestionCategory.CONTENT_EXPANSION, userId, cognitiveModel.id, '基于您的认知模型内容分析', { modelVersion: cognitiveModel.version }));
        suggestions.push(new Suggestion_1.Suggestion(UUID_1.UUID.generate(), SuggestionType_1.SuggestionType.THOUGHT_DEPTH, '建议深入思考主题', '您在某个主题上的思考可以更加深入，建议您探索该主题的不同角度和层次。', 9, 0.95, [cognitiveModel.concepts[2]?.id || 'concept-3'], ['深入思考主题', '添加思考维度'], SuggestionCategory_1.SuggestionCategory.DEEP_THINKING, userId, cognitiveModel.id, '基于您的认知洞察分析', { modelVersion: cognitiveModel.version }));
        return suggestions;
    }
    async getSuggestionsByUserId(userId, page = 1, limit = 10) {
        return this.suggestionRepository.getByUserId(userId, page, limit);
    }
    async getSuggestionsByCognitiveModelId(cognitiveModelId, page = 1, limit = 10) {
        return this.suggestionRepository.getByCognitiveModelId(cognitiveModelId, page, limit);
    }
    async getSuggestionsByType(userId, type) {
        return this.suggestionRepository.getByType(type, userId);
    }
    async getSuggestionsByCategory(userId, category) {
        return this.suggestionRepository.getByCategory(category, userId);
    }
}
exports.SuggestionGenerationService = SuggestionGenerationService;
//# sourceMappingURL=SuggestionGenerationService.js.map