import { EmbeddingService, EmbeddingServiceFactory } from '../../../application/services/llm/embedding/EmbeddingService';
import { Vector } from '../../../domain/entities';
import { APICaller } from '../api/APICaller';
export interface OpenAIEmbeddingConfig {
    apiKey: string;
    model: string;
    baseUrl: string;
}
export declare class OpenAIEmbeddingService implements EmbeddingService {
    private readonly caller;
    private readonly config;
    constructor(caller: APICaller, config: OpenAIEmbeddingConfig);
    embedText(text: string): Promise<Vector>;
    embedTexts(texts: string[]): Promise<Vector[]>;
}
export declare class OpenAIEmbeddingServiceFactory implements EmbeddingServiceFactory {
    private readonly caller;
    private readonly config;
    constructor(caller: APICaller, config: OpenAIEmbeddingConfig);
    create(): EmbeddingService;
}
//# sourceMappingURL=OpenAIEmbeddingService.d.ts.map