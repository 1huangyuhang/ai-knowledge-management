import { EmbeddingService } from '../../../application/ai/embedding/EmbeddingService';
import { OpenAIEmbeddingConfig } from './OpenAIEmbeddingService';
import { LoggerService } from '../../logging/logger.service';
export declare enum EmbeddingServiceType {
    OpenAI = "openai",
    Local = "local"
}
export declare class EmbeddingServiceFactory {
    static createService(type: EmbeddingServiceType, config: Partial<OpenAIEmbeddingConfig>, logger: LoggerService): EmbeddingService;
}
//# sourceMappingURL=EmbeddingServiceFactory.d.ts.map