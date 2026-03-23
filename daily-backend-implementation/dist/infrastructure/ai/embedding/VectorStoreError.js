"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorStoreError = void 0;
const EmbeddingError_1 = require("../../../application/ai/embedding/EmbeddingError");
class VectorStoreError extends EmbeddingError_1.EmbeddingError {
    constructor(message, cause) {
        super(message, 'VECTOR_STORE_ERROR', cause);
        this.name = 'VectorStoreError';
    }
}
exports.VectorStoreError = VectorStoreError;
//# sourceMappingURL=VectorStoreError.js.map