"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryableAPIServiceImpl = void 0;
class RetryableAPIServiceImpl {
    apiService;
    maxRetries;
    retryDelay;
    constructor(apiService, maxRetries = 3, retryDelay = 1000) {
        this.apiService = apiService;
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
    }
    async executeLLMRequest(endpoint, body, params) {
        return this.executeWithRetry(() => this.apiService.executeLLMRequest(endpoint, body, params));
    }
    async executeEmbeddingRequest(endpoint, body, params) {
        return this.executeWithRetry(() => this.apiService.executeEmbeddingRequest(endpoint, body, params));
    }
    healthCheck() {
        return this.apiService.healthCheck();
    }
    setRetryStrategy(maxRetries, retryDelay) {
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
    }
    getRetryStrategy() {
        return {
            maxRetries: this.maxRetries,
            retryDelay: this.retryDelay,
        };
    }
    async executeWithRetry(operation) {
        let lastError;
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (attempt < this.maxRetries) {
                    const delay = this.retryDelay * Math.pow(2, attempt);
                    await this.delay(delay);
                }
            }
        }
        throw lastError;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.RetryableAPIServiceImpl = RetryableAPIServiceImpl;
//# sourceMappingURL=RetryableAPIService.js.map