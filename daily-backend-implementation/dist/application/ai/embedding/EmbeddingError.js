"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingTextProcessingError = exports.EmbeddingAPICallError = exports.EmbeddingConfigError = exports.EmbeddingError = void 0;
const domain_error_1 = require("../../../domain/errors/domain-error");
class EmbeddingError extends domain_error_1.DomainError {
    constructor(message, code, cause) {
        super(message, code, cause);
        this.name = 'EmbeddingError';
    }
}
exports.EmbeddingError = EmbeddingError;
class EmbeddingConfigError extends EmbeddingError {
    constructor(message, cause) {
        super(message, 'EMBEDDING_CONFIG_ERROR', cause);
        this.name = 'EmbeddingConfigError';
    }
}
exports.EmbeddingConfigError = EmbeddingConfigError;
class EmbeddingAPICallError extends EmbeddingError {
    constructor(message, cause) {
        super(message, 'EMBEDDING_API_CALL_ERROR', cause);
        this.name = 'EmbeddingAPICallError';
    }
}
exports.EmbeddingAPICallError = EmbeddingAPICallError;
class EmbeddingTextProcessingError extends EmbeddingError {
    constructor(message, cause) {
        super(message, 'EMBEDDING_TEXT_PROCESSING_ERROR', cause);
        this.name = 'EmbeddingTextProcessingError';
    }
}
exports.EmbeddingTextProcessingError = EmbeddingTextProcessingError;
//# sourceMappingURL=EmbeddingError.js.map