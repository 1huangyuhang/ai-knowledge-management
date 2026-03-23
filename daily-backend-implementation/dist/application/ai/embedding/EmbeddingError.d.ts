import { DomainError } from '../../../domain/errors/domain-error';
export declare class EmbeddingError extends DomainError {
    constructor(message: string, code: string, cause?: Error);
}
export declare class EmbeddingConfigError extends EmbeddingError {
    constructor(message: string, cause?: Error);
}
export declare class EmbeddingAPICallError extends EmbeddingError {
    constructor(message: string, cause?: Error);
}
export declare class EmbeddingTextProcessingError extends EmbeddingError {
    constructor(message: string, cause?: Error);
}
//# sourceMappingURL=EmbeddingError.d.ts.map