import { Suggestion } from '../../domain/entities/Suggestion';
import { SuggestionType } from '../../domain/enums/SuggestionType';
import { SuggestionCategory } from '../../domain/enums/SuggestionCategory';
import { SuggestionRepository } from '../../domain/repositories/SuggestionRepository';
import { CognitiveModelRepository } from '../../domain/repositories/CognitiveModelRepository';
import { CognitiveInsightRepository } from '../../domain/repositories/CognitiveInsightRepository';
import { CognitiveParserService } from '../../ai/cognitive/CognitiveParserService';
import { LLMClientService } from '../../ai/llm/LLMClientService';
export declare class SuggestionGenerationService {
    private readonly suggestionRepository;
    private readonly cognitiveModelRepository;
    private readonly cognitiveInsightRepository;
    private readonly cognitiveParserService;
    private readonly llmClientService;
    constructor(suggestionRepository: SuggestionRepository, cognitiveModelRepository: CognitiveModelRepository, cognitiveInsightRepository: CognitiveInsightRepository, cognitiveParserService: CognitiveParserService, llmClientService: LLMClientService);
    generateSuggestions(userId: string, cognitiveModelId: string): Promise<Suggestion[]>;
    private generateSuggestionsFromModelAndInsights;
    getSuggestionsByUserId(userId: string, page?: number, limit?: number): Promise<Suggestion[]>;
    getSuggestionsByCognitiveModelId(cognitiveModelId: string, page?: number, limit?: number): Promise<Suggestion[]>;
    getSuggestionsByType(userId: string, type: SuggestionType): Promise<Suggestion[]>;
    getSuggestionsByCategory(userId: string, category: SuggestionCategory): Promise<Suggestion[]>;
}
//# sourceMappingURL=SuggestionGenerationService.d.ts.map