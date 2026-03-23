"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExponentialBackoffRetryStrategy = void 0;
const ApiCallError_1 = require("../../../infrastructure/ai/api/ApiCallError");
class ExponentialBackoffRetryStrategy {
    config;
    retryAllErrors;
    constructor(config) {
        this.config = config;
        this.retryAllErrors = config.retryAllErrors ?? true;
    }
    getWaitTime(attempt) {
        const waitTime = this.config.initialInterval * Math.pow(this.config.backoffFactor, attempt - 1);
        return Math.min(waitTime, this.config.maxWaitTime);
    }
    shouldRetry(attempt, error) {
        if (attempt > this.config.maxRetries) {
            return false;
        }
        if (this.retryAllErrors) {
            return true;
        }
        return this.isRetryableError(error);
    }
    isRetryableError(error) {
        const retryableErrors = [
            ApiCallError_1.ApiTimeoutError,
            ApiCallError_1.ApiServiceUnavailableError,
        ];
        if (retryableErrors.some(errorType => error instanceof errorType)) {
            return true;
        }
        if (error instanceof ApiCallError_1.ApiCallError && error.statusCode) {
            return error.statusCode >= 500 && error.statusCode < 600;
        }
        if (error.code) {
            const retryableCodes = ['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND'];
            return retryableCodes.includes(error.code);
        }
        return false;
    }
}
exports.ExponentialBackoffRetryStrategy = ExponentialBackoffRetryStrategy;
//# sourceMappingURL=ExponentialBackoffRetryStrategy.js.map