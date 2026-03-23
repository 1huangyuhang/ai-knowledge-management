import { Vector } from '../../../../domain/entities';
export interface EmbeddingService {
    embedText(text: string): Promise<Vector>;
    embedTexts(texts: string[]): Promise<Vector[]>;
}
export interface EmbeddingServiceFactory {
    create(): EmbeddingService;
}
//# sourceMappingURL=EmbeddingService.d.ts.map