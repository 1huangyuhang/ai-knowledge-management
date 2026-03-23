"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryableApiCallService = void 0;
const ExponentialBackoffRetryStrategy_1 = require("../../../application/ai/retry/ExponentialBackoffRetryStrategy");
const RetryDefaults_1 = require("../../../application/ai/retry/RetryDefaults");
class RetryableApiCallService {
    apiCallService;
    retryService;
    retryStrategy;
    constructor(apiCallService, retryService, retryConfig) {
        this.apiCallService = apiCallService;
        this.retryService = retryService;
        this.retryStrategy = new ExponentialBackoffRetryStrategy_1.ExponentialBackoffRetryStrategy({
            ...RetryDefaults_1.DEFAULT_RETRY_CONFIG,
            ...retryConfig
        });
    }
    async sendRequest(request) {
        return this.retryService.executeWithRetry(() => this.apiCallService.sendRequest(request), this.retryStrategy);
    }
    async sendRequestWithTimeout(request, timeoutMs) {
        return this.retryService.executeWithRetry(() => this.apiCallService.sendRequestWithTimeout(request, timeoutMs), this.retryStrategy);
    }
    async checkServiceHealth() {
        return this.apiCallService.checkServiceHealth();
    }
}
exports.RetryableApiCallService = RetryableApiCallService;
//# sourceMappingURL=RetryableApiCallService.js.map