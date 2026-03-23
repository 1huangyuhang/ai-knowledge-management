import { CognitiveConcept } from '../../../domain/entities';
import { CognitiveRelation } from '../../../domain/entities';
import { LLMClient } from '../../services/llm/LLMClient';
import { PromptGenerationService } from '../../services/llm/prompt/PromptGenerationService';
export interface CognitiveParsingResult {
    concepts: CognitiveConcept[];
    relations: CognitiveRelation[];
}
export interface CognitiveParserService {
    parse(text: string, modelId: string): Promise<CognitiveParsingResult>;
    batchParse(texts: string[], modelId: string): Promise<CognitiveParsingResult[]>;
}
export declare class LLMBasedCognitiveParserService implements CognitiveParserService {
    private readonly llmClient;
    private readonly promptService;
    constructor(llmClient: LLMClient, promptService: PromptGenerationService);
    parse(text: string, modelId: string): Promise<CognitiveParsingResult>;
    batchParse(texts: string[], modelId: string): Promise<CognitiveParsingResult[]>;
}
//# sourceMappingURL=CognitiveParserService.d.ts.map