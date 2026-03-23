import { UUID } from '../../domain/value-objects/UUID';
import { InputAnalysis, AnalysisType } from '../../domain/entities/InputAnalysis';
import { InputAnalysisRepository } from '../../domain/repositories/InputAnalysisRepository';
import { InputRepository } from '../../domain/repositories/InputRepository';
import { LoggerService } from '../../infrastructure/logging/LoggerService';
import { LLMClient } from '../../ai/llm/LLMClient';
export declare class InputAnalysisService {
    private readonly analysisRepository;
    private readonly inputRepository;
    private readonly llmClient;
    private readonly logger;
    constructor(analysisRepository: InputAnalysisRepository, inputRepository: InputRepository, llmClient: LLMClient, logger: LoggerService);
    initializeAnalysis(inputId: UUID, types: AnalysisType[]): Promise<InputAnalysis[]>;
    executeAnalysis(analysisId: UUID): Promise<InputAnalysis>;
    executeAllAnalysesForInput(inputId: UUID): Promise<InputAnalysis[]>;
    getAnalysisResults(inputId: UUID): Promise<Record<string, any>>;
    private extractKeywords;
    private recognizeTopics;
    private analyzeSentiment;
    private classifyContent;
    private summarizeContent;
    private recognizeEntities;
    private extractRelations;
    private analyzeReadability;
}
//# sourceMappingURL=InputAnalysisService.d.ts.map