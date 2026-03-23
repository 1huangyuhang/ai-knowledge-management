"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThoughtFragmentImpl = void 0;
class ThoughtFragmentImpl {
    id;
    content;
    metadata;
    userId;
    createdAt;
    updatedAt;
    isProcessed;
    processingAttempts;
    lastProcessedAt;
    constructor(id, content, userId, metadata = {}, isProcessed = false, processingAttempts = 0, lastProcessedAt = null, createdAt = new Date()) {
        this.id = id;
        this.content = content;
        this.userId = userId;
        this.metadata = metadata;
        this.createdAt = createdAt;
        this.updatedAt = new Date();
        this.isProcessed = isProcessed;
        this.processingAttempts = processingAttempts;
        this.lastProcessedAt = lastProcessedAt;
    }
    updateContent(content) {
        this.content = content;
        this.updatedAt = new Date();
    }
    updateMetadata(metadata) {
        this.metadata = { ...this.metadata, ...metadata };
        this.updatedAt = new Date();
    }
    markAsProcessed() {
        this.isProcessed = true;
        this.lastProcessedAt = new Date();
        this.updatedAt = new Date();
    }
    markAsUnprocessed() {
        this.isProcessed = false;
        this.updatedAt = new Date();
    }
    incrementProcessingAttempts() {
        this.processingAttempts += 1;
        this.updatedAt = new Date();
    }
}
exports.ThoughtFragmentImpl = ThoughtFragmentImpl;
//# sourceMappingURL=thought-fragment.js.map